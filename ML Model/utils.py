import cv2
import mediapipe as mp
import numpy as np
import torch
from torchvision import transforms
from PIL import Image

# --- Initialize MediaPipe Face Detector ---
BaseOptions         = mp.tasks.BaseOptions
FaceDetector        = mp.tasks.vision.FaceDetector
FaceDetectorOptions = mp.tasks.vision.FaceDetectorOptions
VisionRunningMode   = mp.tasks.vision.RunningMode

options = FaceDetectorOptions(
    base_options=BaseOptions(model_asset_path="blaze_face_short_range.tflite"),
    running_mode=VisionRunningMode.IMAGE
)
face_detector = FaceDetector.create_from_options(options)

# --- Inference Transforms (no augmentation at test time) ---
inference_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Filtering thresholds
MIN_DET_SCORE   = 0.70   # BlazeFace detection confidence gate
MIN_FACE_PIXELS = 1600   # 40×40 minimum face area in original frame


class NoFaceDetectedError(ValueError):
    """Raised when no usable face crop can be extracted from a video."""


def _try_extract_face(frame, fps, frame_idx):
    """
    Attempt to detect and crop a face from a single BGR frame.
    Returns (face_rgb_224, tensor, meta_dict) on success, or None on failure.
    """
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image  = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
    result    = face_detector.detect(mp_image)

    if not result.detections:
        return None

    det       = result.detections[0]
    det_score = det.categories[0].score if det.categories else 1.0

    if det_score < MIN_DET_SCORE:
        return None

    bbox = det.bounding_box
    x = max(0, int(bbox.origin_x))
    y = max(0, int(bbox.origin_y))
    w = min(int(bbox.width),  frame.shape[1] - x)
    h = min(int(bbox.height), frame.shape[0] - y)

    if w * h < MIN_FACE_PIXELS:
        return None

    face = frame[y:y + h, x:x + w]
    if face.size == 0:
        return None

    face_rgb     = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)
    face_resized = cv2.resize(face_rgb, (224, 224))
    tensor       = inference_transforms(Image.fromarray(face_resized))
    meta         = {
        'timestamp': round(frame_idx / fps, 2),
        'face_area': w * h,
        'det_score': round(float(det_score), 3),
    }
    return face_resized, tensor, meta


def extract_and_preprocess_video(video_path, frames_per_video=16):
    """
    Extracts `frames_per_video` evenly-spaced face crops from an MP4.

    Quality gates applied per frame:
      - BlazeFace confidence  >= MIN_DET_SCORE  (0.70)
      - Face area in pixels   >= MIN_FACE_PIXELS (1600 = 40×40)

    BUG-3 FIX: Each of the `frames_per_video` target positions is searched
    with a ±window so that quality-gate failures at one frame index do not
    silently skip the entire temporal slot.

    Returns
    -------
    input_tensor  : torch.Tensor  shape (1, 16, 3, 224, 224) – model input
    original_faces: list[np.ndarray]  16 × (224, 224, 3) uint8 RGB – XAI overlay
    frame_meta    : list[dict]  one entry per face:
                      timestamp  – seconds into the video
                      face_area  – w×h of detection in original frame
                      det_score  – BlazeFace confidence [0‥1]
    """
    cap          = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps          = cap.get(cv2.CAP_PROP_FPS) or 25.0

    if total_frames < 1:
        cap.release()
        raise ValueError("Video is empty or cannot be read.")

    # Compute target frame indices (evenly spaced across the video)
    frame_interval = max(total_frames // frames_per_video, 1)
    targets        = [i * frame_interval for i in range(frames_per_video)]

    # BUG-3 FIX: search window ± around each target to handle quality-gate failures
    search_window  = max(frame_interval // 2, 3)

    # Read all frames into a seekable index — only seek, no sequential read
    # We only load on-demand by seeking to each candidate position.
    extracted_faces   = []
    extracted_tensors = []
    frame_meta        = []

    for target in targets:
        found = False
        # Search [target, target+1, ..., target+window, target-1, ..., target-window]
        candidates = [target]
        for delta in range(1, search_window + 1):
            if target + delta < total_frames:
                candidates.append(target + delta)
            if target - delta >= 0:
                candidates.append(target - delta)

        for candidate in candidates:
            cap.set(cv2.CAP_PROP_POS_FRAMES, candidate)
            ret, frame = cap.read()
            if not ret:
                continue
            extraction = _try_extract_face(frame, fps, candidate)
            if extraction is not None:
                face_resized, tensor, meta = extraction
                extracted_faces.append(face_resized)
                extracted_tensors.append(tensor)
                frame_meta.append(meta)
                found = True
                break

        # If no valid face found in the entire window, record a miss (handled below)
        if not found:
            pass  # pad step will fill the gap

    cap.release()

    # ── Fallback: no usable faces found ────────────────────────────────────────
    if len(extracted_tensors) == 0:
        raise NoFaceDetectedError(
            "No face was detected in this video. Please upload a video with a clear, visible face."
        )

    # BUG-2 FIX: pad by cycling through all valid faces (wrap-around) instead
    # of repeating only the last one — prevents one face dominating all slots.
    base_count = len(extracted_tensors)
    while len(extracted_tensors) < frames_per_video:
        idx = len(extracted_tensors) % base_count   # wrap-around index
        extracted_tensors.append(extracted_tensors[idx])
        extracted_faces.append(extracted_faces[idx])
        frame_meta.append(frame_meta[idx])

    input_tensor = torch.stack(extracted_tensors).unsqueeze(0)  # (1, 16, 3, 224, 224)
    return input_tensor, extracted_faces, frame_meta
