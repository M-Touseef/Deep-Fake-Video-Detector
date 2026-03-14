<div align="center">

<h1>🧠 Spatial Deepfake Detector — ML Model</h1>
<h3>EfficientNet-B0 + Transformer Encoder with Grad-CAM XAI</h3>

<p>
  <img src="https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" />
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" />
  <img src="https://img.shields.io/badge/MediaPipe-0097A7?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
</p>

<p>
  <img src="https://img.shields.io/badge/Best%20F1%20Score-96.76%25-brightgreen?style=flat-square" />
  <img src="https://img.shields.io/badge/Val%20Accuracy-95.47%25-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/Dataset-FaceForensics%2B%2B%20C23-orange?style=flat-square" />
  <img src="https://img.shields.io/badge/Frames%20per%20Video-16-purple?style=flat-square" />
</p>

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Model Architecture](#-model-architecture)
- [Grad-CAM XAI Pipeline](#-grad-cam-xai-pipeline)
- [Post-Processing Pipeline](#-post-processing-pipeline)
- [Dataset](#-dataset)
- [Training Results](#-training-results)
- [Flask API](#-flask-api)
- [Setup & Installation](#-setup--installation)
- [File Reference](#-file-reference)
- [Design Decisions](#-design-decisions)

---

## 🔍 Overview

This module implements the core **machine learning inference pipeline** for the Proof of Reality deepfake detection system. It combines a pretrained **EfficientNet-B0** backbone for spatial feature extraction with a **Transformer Encoder** for temporal consistency analysis across video frames — trained and evaluated on the **FaceForensics++ C23** benchmark.

The model is served as a **Flask REST API** and integrates **Gradient-weighted Class Activation Mapping (Grad-CAM)** to produce visual explanations alongside each prediction.

---

## 🏗️ Model Architecture

### `SpatialDeepfakeDetector`

```
Input Video (MP4)
       │
       ▼
┌───────────────────────┐
│    Frame Sampling     │  ←  16 evenly-spaced frames extracted from video
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│    Face Detection     │  ←  MediaPipe BlazeFace (TFLite)
│   (BlazeFace TFLite)  │  ←  Min confidence threshold: 0.70
└──────────┬────────────┘  ←  Minimum face area: 40×40 px
           │
           ▼
┌───────────────────────┐
│    Preprocessing      │  ←  Crop → Resize to 224×224
│   (ImageNet Norms)    │  ←  Normalize: μ=[0.485,0.456,0.406] σ=[0.229,0.224,0.225]
└──────────┬────────────┘
           │
           ▼  (applied independently per frame)
┌───────────────────────┐
│    EfficientNet-B0    │  ←  Pretrained ImageNet backbone
│       Backbone        │  ←  Output: 1280-dimensional feature vector per frame
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│   Feature Projection  │  ←  Linear(1280 → 512)
└──────────┬────────────┘
           │
           ▼  (sequence of 16 frame embeddings, shape: [B, 16, 512])
┌───────────────────────┐
│  Transformer Encoder  │  ←  3 stacked encoder layers
│                       │  ←  8 multi-head attention heads
│  (No positional enc.) │  ←  d_model = 512
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│   Global Avg Pooling  │  ←  Mean across temporal (frame) dimension → [B, 512]
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Classification Head  │  ←  Linear(512 → 64) → ReLU → Dropout(0.5)
│                       │  ←  Linear(64 → 1) → Sigmoid
└──────────┬────────────┘
           │
           ▼
    Output: P(Fake) ∈ [0, 1]
```

### Component Summary

| Component | Configuration | Purpose |
|---|---|---|
| **Face Detector** | BlazeFace TFLite, conf ≥ 0.70 | Isolate facial region per frame |
| **Backbone** | EfficientNet-B0 (pretrained) | Extract spatial features (1280-dim) |
| **Projection** | Linear 1280→512 | Reduce feature dimensionality |
| **Transformer** | 3 layers, 8 heads, d_model=512 | Model temporal inconsistencies |
| **Pooling** | Global Average Pooling | Aggregate temporal sequence |
| **Classifier** | FC(512→64→1) + Sigmoid | Binary fake/real output |

---

## 🌡️ Grad-CAM XAI Pipeline

The model produces **Gradient-weighted Class Activation Maps** to visualize which facial regions drove the deepfake prediction. This makes the model's decisions interpretable and auditable.

### How It Works

```
┌──────────────────────────────────────────────────────┐
│  1. Register forward hooks on the last EfficientNet  │
│     convolutional block to capture activations       │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│  2. Run forward pass → store feature map activations │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│  3. Compute scalar output → backward pass            │
│     → capture gradients w.r.t. activation maps      │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│  4. Compute channel weights:                         │
│     αₖ = mean of gradients over spatial dims (H, W) │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│  5. Generate CAM:                                    │
│     L = ReLU( Σₖ αₖ · Aₖ )                          │
│     Normalize L to [0, 1], resize to 224×224         │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│  6. Overlay heatmap on original face crop            │
│     → Render with colored border + confidence label  │
└──────────────────────────────────────────────────────┘
```

### Output

- Heatmap highlighting manipulation artifacts (eyes, nose, jaw boundaries, skin texture)
- Color gradient from blue (low suspicion) → red (high suspicion)
- Saved as JPEG overlays for the top-3 most suspicious frames

---

## ⚙️ Post-Processing Pipeline

Raw per-frame sigmoid outputs are refined through a multi-stage post-processing pipeline before a final verdict is delivered.

```
┌───────────────────────────┐
│  Per-Frame CAM Intensity  │  ←  Top-25% mean of normalized CAM per frame
└──────────────┬────────────┘
               │
               ▼
┌───────────────────────────┐
│   Top-K Score Adjustment  │  ←  Select top-4 most suspicious frames
│                           │  ←  Boost overall confidence score accordingly
└──────────────┬────────────┘
               │
               ▼
┌───────────────────────────┐
│    Temporal Segmentation  │  ←  Divide video into 3 equal segments
│    (Segments A, B, C)     │  ←  Score each: HIGH ≥60% | MEDIUM ≥30% | LOW
└──────────────┬────────────┘
               │
               ▼
┌───────────────────────────┐
│   Top-3 Frame Selection   │  ←  Select 3 frames with highest suspicion scores
│   + Heatmap Overlay       │  ←  Render annotated frames with borders + labels
└───────────────────────────┘
```

### Confidence Score Thresholds

| Score | Verdict |
|---|---|
| ≥ 0.60 | 🔴 **HIGH RISK** — Likely deepfake |
| 0.30 – 0.59 | 🟡 **MEDIUM RISK** — Suspicious |
| < 0.30 | 🟢 **LOW RISK** — Likely authentic |

---

## 🗃️ Dataset

**FaceForensics++ (C23 Compression)**

| Property | Value |
|---|---|
| Dataset | FaceForensics++ |
| Compression | C23 (visually lossless H.264) |
| Real Videos | 993 |
| Fake Videos | 1,986 |
| Fake-to-Real Ratio | 2:1 |
| Frames per Video | 16 |
| Face Resolution | 224 × 224 px |

**Fake video manipulation methods included:**
- Deepfakes (DF)
- Face2Face (F2F)
- FaceSwap (FS)
- NeuralTextures (NT)

### Dataset Preparation Pipeline

```python
# Frame extraction and face cropping per video
def process_video(video_path, save_dir, frames_per_video=16):
    # 1. Sample evenly-spaced frames
    # 2. Detect face with MediaPipe BlazeFace
    # 3. Crop and resize to 224x224
    # 4. Save as JPEG to processed_flattened/{Real|Fake}/{video_id}/
```

The processed dataset structure:
```
processed_flattened/
├── Real/
│   └── {video_id}/
│       ├── frame_0.jpg
│       └── frame_15.jpg
└── Fake/
    └── {video_id}/
        ├── frame_0.jpg
        └── frame_15.jpg
```

> 📌 Request access to FaceForensics++ at: https://github.com/ondyari/FaceForensics

---

## 📈 Training Results

Training ran for **10 epochs** on balanced batches with a 2:1 fake-to-real ratio.

| Epoch | Train Loss | Val Accuracy | Precision | Recall | F1 Score | Saved? |
|-------|-----------|--------------|-----------|--------|----------|--------|
| 1 | 0.3839 | 86.24% | 87.22% | 93.96% | 90.47% | ✅ |
| 2 | 0.2484 | 86.91% | 97.73% | 83.09% | 89.82% | — |
| 3 | 0.2042 | 93.12% | 94.94% | 95.17% | 95.05% | ✅ |
| 4 | 0.1640 | 93.12% | 92.29% | 98.31% | 95.20% | ✅ |
| 5 | 0.1367 | 94.63% | 95.69% | 96.62% | 96.15% | ✅ |
| 6 | 0.1324 | 92.79% | 93.04% | 96.86% | 94.91% | — |
| 7 | 0.1191 | 89.77% | 98.09% | 86.96% | 92.19% | — |
| 8 | 0.1149 | 94.13% | 95.66% | 95.89% | 95.78% | — |
| **9** | **0.1455** | **95.47%** | **96.18%** | **97.34%** | **96.76%** ⭐ | ✅ |
| 10 | 0.1112 | 94.46% | 94.61% | 97.58% | 96.08% | — |

### Best Model — Epoch 9 Confusion Matrix

```
                  Predicted
                 Real   Fake
Actual  Real  [  166     16 ]
        Fake  [   11    403 ]

True Positives  (Fake correctly identified):  403
True Negatives  (Real correctly identified):  166
False Positives (Real flagged as Fake):        16
False Negatives (Fake missed as Real):         11
```

---

## 🌐 Flask API

The ML model is served via a lightweight **Flask** REST server.

### Start the Server

```bash
python app.py
# Runs at http://localhost:5000
```

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Web UI for manual testing |
| `POST` | `/predict` | Analyze a video file |

### `POST /predict`

**Request:** Multipart form-data with a video file.

**Response:**
```json
{
  "verdict": "FAKE",
  "confidence": 0.921,
  "segment_scores": {
    "A": { "score": 0.87, "risk": "HIGH" },
    "B": { "score": 0.95, "risk": "HIGH" },
    "C": { "score": 0.43, "risk": "MEDIUM" }
  },
  "top_frames": [
    { "frame_index": 7, "score": 0.97, "heatmap_path": "..." },
    { "frame_index": 11, "score": 0.94, "heatmap_path": "..." },
    { "frame_index": 4, "score": 0.89, "heatmap_path": "..." }
  ]
}
```

---

## 🚀 Setup & Installation

### Requirements

- Python 3.8+
- CUDA-compatible GPU (recommended for inference speed)

### Installation

```bash
# 1. Navigate to the ML Model directory
cd "ML Model"

# 2. Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Verify required model files are present
ls -la
# Should include:
# - best_spatial_detector.pth   (trained weights)
# - blaze_face_short_range.tflite (face detector)

# 5. Start the Flask server
python app.py
```

### Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| `torch` | ≥2.0 | Model training and inference |
| `torchvision` | ≥0.15 | EfficientNet backbone |
| `flask` | ≥2.3 | REST API server |
| `mediapipe` | ≥0.10 | BlazeFace face detection |
| `opencv-python` | ≥4.8 | Frame extraction + image ops |
| `Pillow` | ≥10.0 | Image loading and transforms |
| `numpy` | ≥1.24 | Array operations |

---

## 📁 File Reference

```
ML Model/
│
├── app.py                          # Flask API server + Grad-CAM visualization pipeline
├── model.py                        # SpatialDeepfakeDetector architecture definition
├── utils.py                        # Video preprocessing + MediaPipe face detection
│
├── best_spatial_detector.pth       # Trained model weights (Epoch 9, F1: 96.76%)
├── blaze_face_short_range.tflite   # MediaPipe BlazeFace TFLite model
│
└── requirements.txt                # Python package dependencies
```

---

## 🔬 Design Decisions

### Why EfficientNet-B0?
EfficientNet-B0 offers an excellent trade-off between parameter count (~5.3M) and accuracy. As a pretrained ImageNet backbone, it provides rich spatial features that transfer well to detecting subtle GAN artifacts and blending boundaries in face-swapped regions.

### Why Transformer Encoder (no positional encoding)?
Deepfake artifacts are not strictly time-ordered — a frame mid-video can be as suspicious as the first. Omitting positional encoding allows the model to focus on *inter-frame inconsistency* rather than sequential position, which better captures the flickering and temporal discontinuities that define many deepfake types.

### Why FaceForensics++ C23?
C23 applies high-quality (visually lossless) compression, making it the most challenging benchmark variant. Models that perform well at C23 are robust enough for real-world video forensics, where naive compression-based artifact detection would fail.

### Why Grad-CAM over other XAI methods?
Grad-CAM is computationally efficient, requires no model modification, and produces spatially meaningful heatmaps that align with known deepfake artifact locations (eye corners, jaw edges, skin tone boundaries). This makes it ideal for a real-time, production-facing explainability layer.

---

<div align="center">

Part of the **[Proof of Reality](https://github.com/M-Touseef/Deep-Fake-Video-Detector)** deepfake detection platform.

**[⬆ Back to Top](#-spatial-deepfake-detector--ml-model)**

</div>
