import os
import cv2
import base64
import numpy as np
import torch
from flask import Flask, request, render_template, jsonify
from werkzeug.utils import secure_filename
from model import SpatialDeepfakeDetector
from utils import NoFaceDetectedError, extract_and_preprocess_video

app = Flask(__name__)
app.config['UPLOAD_FOLDER']      = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# ── Load model ───────────────────────────────────────────────────────────────
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"[INFO] Loading model on {device}...")

model = SpatialDeepfakeDetector().to(device)
model.load_state_dict(
    torch.load('best_spatial_detector.pth', map_location=device, weights_only=True)
)
model.eval()
print("[INFO] Model loaded successfully!")


# ============================================================
# CUSTOM XAI: GRAD-CAM EXTRACTOR
# ============================================================
class SpatialGradCAM:
    """
    Grad-CAM for the 5D SpatialDeepfakeDetector (B, F, C, H, W).
    Hooks the last EfficientNet-B0 conv block; returns one heat-map
    per frame — shape (F, Hf, Wf).
    """

    def __init__(self, model):
        self.model       = model
        self.gradients   = None
        self.activations = None

        target_layer = self.model.backbone.features[-1]
        target_layer.register_forward_hook(self._save_activation)
        target_layer.register_full_backward_hook(self._save_gradient)

    def _save_activation(self, module, inp, out):
        self.activations = out          # (B*F, C, Hf, Wf)

    def _save_gradient(self, module, grad_in, grad_out):
        self.gradients = grad_out[0]    # (B*F, C, Hf, Wf)

    def generate_cams(self, input_tensor):
        """
        Forward + backward pass with gradient tracking.

        Returns
        -------
        cams      : np.ndarray (F, Hf, Wf) – per-frame ReLU-CAMs
        pred_prob : float – sigmoid output (>0.5 → Fake)
        """
        # BUG-1 FIX: guarantee eval mode on every call so Dropout(0.5)
        # in the classifier is always disabled during inference.
        self.model.eval()
        self.model.zero_grad()
        input_tensor = input_tensor.requires_grad_(True)

        output    = self.model(input_tensor)
        pred_prob = torch.sigmoid(output).item()
        output.backward()

        grads   = self.gradients   # (F, C, Hf, Wf)
        acts    = self.activations # (F, C, Hf, Wf)

        weights = torch.mean(grads, dim=[2, 3], keepdim=True)   # (F, C, 1, 1)
        cams    = torch.sum(weights * acts, dim=1, keepdim=True) # (F, 1, Hf, Wf)
        cams    = torch.relu(cams).squeeze(1)                    # (F, Hf, Wf)

        return cams.detach().cpu().numpy(), pred_prob


cam_extractor = SpatialGradCAM(model)


# ============================================================
# POST-PROCESSING: TOP-K, FILTERING, SEGMENTS, TOP-3
# ============================================================
TOPK          = 4          # frames used for top-K confidence adjustment
MIN_INTENSITY = 0.05       # heatmap intensity gate (near-zero = model saw nothing)
SEGMENT_DEFS  = [          # (label, start_inclusive, end_exclusive)
    ("Segment A",  0,  5),
    ("Segment B",  5, 10),
    ("Segment C", 10, 16),
]


def _frame_intensity(cam_norm):
    """Top-25 % mean of a normalised (0-1) CAM — scalar."""
    threshold = np.percentile(cam_norm, 75)
    top_vals  = cam_norm[cam_norm >= threshold]
    return float(top_vals.mean()) if top_vals.size else 0.0


def _normalise_cam(cam):
    """Normalise a raw CAM to [0, 1]."""
    lo, hi = cam.min(), cam.max()
    if hi - lo > 1e-6:
        return (cam - lo) / (hi - lo)
    return np.zeros_like(cam)


def _encode_rgb_jpeg(face_rgb):
    """Encode a 224x224 RGB face crop as a Base64 JPEG string."""
    bgr = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2BGR)
    _, buf = cv2.imencode('.jpg', bgr, [cv2.IMWRITE_JPEG_QUALITY, 90])
    return base64.b64encode(buf).decode('utf-8')


def _explain_activation_region(cam):
    """
    Rule-based Grad-CAM region summary for reviewer-friendly evidence text.
    The explanation is derived from the hottest area of the normalised CAM.
    """
    cam_up = cv2.resize(cam, (224, 224))
    cam_norm = _normalise_cam(cam_up)
    hot_threshold = np.percentile(cam_norm, 85)
    hot_points = np.argwhere(cam_norm >= hot_threshold)

    if hot_points.size == 0:
        return {
            'region': 'Diffuse activation',
            'explanation': 'Activation is diffuse across the face crop with no single dominant facial region.',
        }

    y_mean, x_mean = hot_points.mean(axis=0)

    if y_mean < 72:
        region = 'forehead and eye region'
        explanation = 'Suspicious activation is concentrated around the forehead and eyes, where blending, gaze, or eyelid artifacts often appear.'
    elif y_mean < 135:
        if x_mean < 80:
            region = 'left cheek and nose boundary'
            explanation = 'Suspicious activation is concentrated around the left cheek and nose boundary, a common area for face-swap blending artifacts.'
        elif x_mean > 144:
            region = 'right cheek and nose boundary'
            explanation = 'Suspicious activation is concentrated around the right cheek and nose boundary, a common area for face-swap blending artifacts.'
        else:
            region = 'central nose and mid-face'
            explanation = 'Suspicious activation is concentrated around the nose and mid-face, where texture mismatch and identity blending can be visible.'
    else:
        if x_mean < 85:
            region = 'left jawline and mouth boundary'
            explanation = 'Suspicious activation is concentrated around the left jawline and mouth boundary, where manipulation edges can become visible.'
        elif x_mean > 139:
            region = 'right jawline and mouth boundary'
            explanation = 'Suspicious activation is concentrated around the right jawline and mouth boundary, where manipulation edges can become visible.'
        else:
            region = 'mouth and chin region'
            explanation = 'Suspicious activation is concentrated around the mouth and chin, where lip motion, teeth texture, and lower-face blending artifacts often appear.'

    return {
        'region': region,
        'explanation': explanation,
    }


def _build_quality_summary(frame_meta):
    """
    Summarise face extraction quality for responsible confidence reporting.
    Duplicate padded frames are collapsed by timestamp so warnings reflect
    how many genuinely usable frames were found before padding.
    """
    unique_by_ts = {}
    for meta in frame_meta:
        unique_by_ts.setdefault(meta['timestamp'], meta)

    unique_meta = list(unique_by_ts.values())
    det_scores = [float(meta.get('det_score', 0)) for meta in unique_meta]
    face_areas = [int(meta.get('face_area', 0)) for meta in unique_meta]
    valid_face_frames = len(unique_meta)
    avg_det_score = float(np.mean(det_scores)) if det_scores else 0.0
    min_face_area = int(min(face_areas)) if face_areas else 0

    warnings = []
    if valid_face_frames < 8:
        warnings.append(
            'Few valid frames. The video had limited usable face frames, so temporal evidence may be less reliable.'
        )
    if avg_det_score < 0.82 or min_face_area < 2500:
        warnings.append(
            'Low face visibility. Small or weak face detections can reduce model reliability.'
        )

    return {
        'valid_face_frames': valid_face_frames,
        'avg_face_detection_score': round(avg_det_score, 3),
        'min_face_area': min_face_area,
        'warnings': warnings,
    }


def _render_heatmap_overlay(face_rgb, cam, border_color=None,
                             label_top=None, label_bot=None):
    """
    Blend a CAM heatmap over a face crop, optionally draw a border
    and two cv2 text labels.

    Returns a Base64-encoded JPEG string.
    """
    cam_up   = cv2.resize(cam, (224, 224))
    cam_norm = _normalise_cam(cam_up)
    heatmap  = cv2.applyColorMap(np.uint8(255 * cam_norm), cv2.COLORMAP_JET)
    bgr      = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2BGR)
    overlay  = cv2.addWeighted(bgr, 0.55, heatmap, 0.45, 0)

    if border_color:
        cv2.rectangle(overlay, (0, 0), (223, 223), border_color, 3)

    if label_top:
        cv2.putText(overlay, label_top, (6, 20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.52, (255, 255, 255), 2, cv2.LINE_AA)
    if label_bot:
        cv2.putText(overlay, label_bot, (6, 210),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.42, (255, 255, 255), 1, cv2.LINE_AA)

    _, buf = cv2.imencode('.jpg', overlay, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return base64.b64encode(buf).decode('utf-8')


def analyse_frames(cams, original_faces, frame_meta, global_prob):
    """
    Post-process Grad-CAM outputs into production-grade analysis.

    Parameters
    ----------
    cams         : np.ndarray (F, Hf, Wf)
    original_faces: list of F RGB arrays
    frame_meta   : list of F dicts {timestamp, face_area, det_score}
    global_prob  : float from sigmoid

    Returns dict with keys: topk_confidence, segments, top3_frames
    """
    num_frames = len(original_faces)

    # ── 1. Per-frame intensity ────────────────────────────────────────────────
    intensities = np.array([
        _frame_intensity(_normalise_cam(cv2.resize(cams[i], (224, 224))))
        for i in range(num_frames)
    ])  # shape (F,)

    # ── 2. Filter near-zero frames ────────────────────────────────────────────
    valid_mask = intensities > MIN_INTENSITY
    if valid_mask.sum() == 0:
        valid_mask[:] = True  # all frames near-zero → keep all as fallback

    valid_intensities = intensities.copy()
    valid_intensities[~valid_mask] = 0.0

    # ── 3. Top-K confidence adjustment ───────────────────────────────────────
    # Identify top-K frames by intensity
    sorted_idx      = np.argsort(intensities)[::-1]
    topk_idx        = sorted_idx[:TOPK]
    topk_intensities = intensities[topk_idx]

    # Weight global_prob by mean top-K intensity relative to all intensity
    all_mean  = intensities[valid_mask].mean() if valid_mask.any() else 1e-6
    topk_mean = topk_intensities.mean()
    boost     = min(topk_mean / (all_mean + 1e-6), 1.5)   # cap at 50 % boost

    # BUG-4 FIX: boost is applied to the final confidence value, not to the
    # raw probability — this avoids incorrectly pulling Real confidence up.
    if global_prob > 0.5:   # Fake: boost detection confidence
        adj_prob  = min(global_prob * boost, 0.99)
        topk_conf = adj_prob                         # already in (0.5, 1) range
    else:                    # Real: boost "authenticity" confidence
        # global_prob is near 0 → authenticity = 1 - global_prob
        auth_conf  = 1.0 - global_prob               # e.g. 0.85 if prob=0.15
        adj_auth   = min(auth_conf * boost, 0.99)    # boost authenticity score
        topk_conf  = adj_auth                        # report as confidence in Real

    # ── 4. Segment scoring ────────────────────────────────────────────────────
    segments = []
    for seg_label, seg_start, seg_end in SEGMENT_DEFS:
        indices   = list(range(seg_start, min(seg_end, num_frames)))
        seg_int   = intensities[indices]
        avg_score = float(seg_int.mean()) * 100.0        # → %
        if avg_score >= 60:
            verdict, verdict_css = "HIGH",   "high"
        elif avg_score >= 30:
            verdict, verdict_css = "MEDIUM", "medium"
        else:
            verdict, verdict_css = "LOW",    "low"

        # Build a human-readable time range from metadata
        ts_start = frame_meta[indices[0]]['timestamp']
        ts_end   = frame_meta[indices[-1]]['timestamp']
        time_lbl = f"{ts_start:.1f}s – {ts_end:.1f}s"

        segments.append({
            'label':       seg_label,
            'time_range':  time_lbl,
            'score':       round(avg_score, 1),
            'verdict':     verdict,
            'verdict_css': verdict_css,
        })

    # ── 5. Top-3 annotated frames ─────────────────────────────────────────────
    top3_frames = []
    for rank, idx in enumerate(sorted_idx[:3], start=1):
        ts        = frame_meta[idx]['timestamp']
        score_pct = round(float(intensities[idx]) * 100, 1)
        region_info = _explain_activation_region(cams[idx])
        b64       = _render_heatmap_overlay(
            face_rgb     = original_faces[idx],
            cam          = cams[idx],
            border_color = (0, 0, 200),           # red border in BGR
            label_top    = f"#{rank}  {ts:.1f}s",
            label_bot    = f"Suspicion: {score_pct}%",
        )
        top3_frames.append({
            'image':              b64,
            'original_image':     _encode_rgb_jpeg(original_faces[idx]),
            'rank':               rank,
            'timestamp':          f"{ts:.1f}s",
            'score':              score_pct,
            'activation_region':  region_info['region'],
            'region_explanation': region_info['explanation'],
        })

    return {
        'topk_confidence': round(topk_conf * 100, 2),
        'segments':        segments,
        'top3_frames':     top3_frames,
    }


# ── Routes ───────────────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    """Liveness/readiness for orchestrators (e.g. Azure Container Apps, K8s)."""
    return jsonify({
        'status': 'ok',
        'service': 'spatial-deepfake-detector',
    }), 200


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400

    file = request.files['video']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if not file.filename.lower().endswith('.mp4'):
        return jsonify({'error': 'Invalid file format. Please upload an .mp4'}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    try:
        # 1. Extract — now returns 3-tuple
        input_tensor, original_faces, frame_meta = extract_and_preprocess_video(filepath)
        input_tensor = input_tensor.to(device)

        # 2. Grad-CAM (gradient flow required — no torch.no_grad())
        cams, probability = cam_extractor.generate_cams(input_tensor)
        # cams shape: (F, Hf, Wf) — typically (16, 7, 7)

        # 3. Global verdict
        prediction = "Fake" if probability > 0.5 else "Real"
        confidence = probability if prediction == "Fake" else 1 - probability

        # 4. Advanced frame analysis
        analysis = analyse_frames(cams, original_faces, frame_meta, probability)

        # 5. Clean up
        os.remove(filepath)

        return jsonify({
            'prediction':      prediction,
            'confidence':      round(confidence * 100, 2),
            'topk_confidence': analysis['topk_confidence'],
            'segments':        analysis['segments'],
            'top3_frames':     analysis['top3_frames'],
            'quality_summary': _build_quality_summary(frame_meta),
        })

    except NoFaceDetectedError as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({
            'error': str(e),
            'code': 'NO_FACE_DETECTED',
        }), 422

    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=False, port=5000)
