<div align="center">

<h1>🎭 Proof of Reality</h1>
<h3>AI-Powered Deepfake Video Detection Platform</h3>

<p>
  <img src="https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
</p>

<p>
  <img src="https://img.shields.io/badge/Model%20F1%20Score-96.76%25-brightgreen?style=flat-square" />
  <img src="https://img.shields.io/badge/Dataset-FaceForensics%2B%2B%20C23-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/XAI-Grad--CAM-orange?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" />
</p>

<br/>

> **Proof of Reality** is a full-stack deepfake detection platform that analyzes uploaded videos frame-by-frame, identifies manipulated regions using Grad-CAM heatmaps, and delivers a transparent, explainable verdict on video authenticity.

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Model Performance](#-model-performance)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [ML Model Setup](#ml-model-setup)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Dataset](#-dataset)
- [Environment Variables](#-environment-variables)
- [License](#-license)

---

## 🔍 Overview

The spread of AI-generated deepfake videos poses serious threats to media integrity, public trust, and digital security. **Proof of Reality** addresses this challenge by combining a state-of-the-art spatial-temporal deep learning model with explainable AI (XAI) to not only detect deepfakes, but *show you why* a video is flagged as fake.

The system:
1. Accepts an uploaded MP4 video
2. Extracts and analyzes facial regions across 16 evenly-sampled frames
3. Runs inference using an **EfficientNet-B0 + Transformer Encoder** model
4. Generates **Grad-CAM heatmaps** highlighting suspicious facial regions
5. Returns a confidence-adjusted verdict with segment-level breakdowns

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🎬 **Video Upload** | Upload MP4 videos up to 50MB for analysis |
| 🧠 **Deepfake Detection** | Binary classification (Fake / Real) with confidence scoring |
| 🌡️ **Grad-CAM Heatmaps** | Visual explanation of which facial regions triggered the detection |
| 📊 **Segment Analysis** | Video divided into 3 temporal segments (A, B, C) with individual risk scores |
| 🎯 **Top-K Frame Selection** | Highlights the 3 most suspicious frames for forensic review |
| 📋 **REST API** | Full CRUD operations for video and analysis management |
| 🛡️ **Admin Dashboard** | Platform-wide statistics and video management interface |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                        │
│              React 18 + TypeScript + TailwindCSS             │
└───────────────────────────┬─────────────────────────────────┘
                            │  HTTP REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND SERVER                          │
│                 Node.js + Express.js + MongoDB               │
│   Upload  │  Video CRUD  │  Analysis Orchestration  │  Admin │
└───────────────────────────┬─────────────────────────────────┘
                            │  HTTP (Internal)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     ML INFERENCE SERVICE                     │
│              Flask + PyTorch  (localhost:5000)               │
│                                                              │
│  ┌──────────┐   ┌──────────────┐   ┌─────────────────────┐  │
│  │  Face    │   │ EfficientNet │   │ Transformer Encoder │  │
│  │ Detect   │──▶│    -B0       │──▶│   (3-layer, 8 head) │  │
│  │BlazeFace │   │  (Backbone)  │   │     d_model=512      │  │
│  └──────────┘   └──────────────┘   └──────────┬──────────┘  │
│                                               │             │
│                  ┌────────────────────────────▼──────────┐  │
│                  │  Classification Head + Grad-CAM XAI   │  │
│                  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tooling |
| TailwindCSS + shadcn/ui | Styling and components |
| React Router DOM | Client-side routing |
| Recharts | Data visualization |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | Database and ODM |
| Multer | Multipart file uploads |
| Fluent-FFmpeg | Video processing |
| Express-validator | Request validation |

### ML Model
| Technology | Purpose |
|---|---|
| PyTorch | Model training and inference |
| EfficientNet-B0 | Spatial feature extraction backbone |
| Transformer Encoder | Temporal inconsistency modeling |
| MediaPipe BlazeFace (TFLite) | Real-time face detection |
| Flask | ML inference API |
| Grad-CAM | Explainable AI heatmap generation |

---

## 📈 Model Performance

Trained on **FaceForensics++ (C23)** with 993 real and 1,986 fake videos.

| Epoch | Train Loss | Val Accuracy | Precision | Recall | **F1 Score** |
|-------|-----------|--------------|-----------|--------|-------------|
| 1 | 0.3839 | 86.24% | 87.22% | 93.96% | 90.47% |
| 3 | 0.2042 | 93.12% | 94.94% | 95.17% | 95.05% |
| 5 | 0.1367 | 94.63% | 95.69% | 96.62% | 96.15% |
| **9** ⭐ | **0.1455** | **95.47%** | **96.18%** | **97.34%** | **96.76%** |
| 10 | 0.1112 | 94.46% | 94.61% | 97.58% | 96.08% |

> 🏆 **Best Model (Epoch 9):** F1 Score = **96.76%** · Val Accuracy = **95.47%**

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed before proceeding:

- [Node.js](https://nodejs.org/) v18+
- [Python](https://python.org/) 3.8+
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas)
- [FFmpeg](https://ffmpeg.org/) (required for video processing)

---

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env with your MongoDB URI and settings (see Environment Variables section)

# 4. Start the development server
npm run dev
```

The backend API will be available at `http://localhost:3000`

---

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

### ML Model Setup

```bash
# 1. Navigate to the ML Model directory
cd "ML Model"

# 2. Create a Python virtual environment
python -m venv venv

# 3. Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# 4. Install Python dependencies
pip install -r requirements.txt

# 5. Start the Flask inference service
python app.py
```

The ML service will be available at `http://localhost:5000`

> ⚠️ **Important:** Ensure `best_spatial_detector.pth` (trained weights) and `blaze_face_short_range.tflite` are present inside the `ML Model/` directory before starting the service.

---

## 📡 API Reference

### Backend REST API (`localhost:3000`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/video/upload` | Upload a video file (MP4, max 50MB) |
| `GET` | `/api/video` | List all uploaded videos |
| `GET` | `/api/video/:id` | Get details of a specific video |
| `POST` | `/api/analysis/start/:videoId` | Trigger deepfake analysis |
| `GET` | `/api/analysis/status/:videoId` | Poll analysis progress |
| `GET` | `/api/results/:videoId` | Retrieve analysis results + heatmaps |
| `GET` | `/api/admin/stats` | Admin platform statistics |
| `DELETE` | `/api/admin/videos/:videoId` | Delete a video and its results |

### ML Inference Service (`localhost:5000`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Web UI for direct model testing |
| `POST` | `/predict` | Analyze video — returns prediction, confidence score, and Grad-CAM overlays |

---

## 📁 Project Structure

```
Deep-Fake-Video-Detector/
│
├── frontend/                    # React + Vite + TypeScript client
│   ├── src/
│   │   ├── app/                 # Pages and components
│   │   ├── main.tsx             # Application entry point
│   │   └── styles/              # Global CSS
│   ├── index.html
│   └── vite.config.ts
│
├── backend/                     # Express.js REST API
│   ├── src/
│   │   ├── app.js               # Express app configuration
│   │   ├── config/              # Environment and DB config
│   │   ├── controllers/         # Route handler logic
│   │   ├── middleware/          # Auth, error handling, upload
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/              # API route definitions
│   │   ├── services/            # Business logic layer
│   │   └── utils/               # Helpers and utilities
│   ├── uploads/                 # Uploaded video storage
│   ├── heatmaps/                # Generated Grad-CAM heatmap images
│   └── server.js                # Entry point
│
└── ML Model/                    # PyTorch model + Flask inference API
    ├── app.py                   # Flask server + Grad-CAM pipeline
    ├── model.py                 # SpatialDeepfakeDetector architecture
    ├── utils.py                 # Video preprocessing + face detection
    ├── best_spatial_detector.pth   # Trained model weights (not in repo)
    ├── blaze_face_short_range.tflite  # Face detector model
    └── requirements.txt
```

---

## 🗃️ Dataset

This project was trained on the **[FaceForensics++](https://github.com/ondyari/FaceForensics)** dataset under **C23 compression** (high-quality H.264 compression).

| Split | Real Videos | Fake Videos | Total |
|-------|-------------|-------------|-------|
| Training | ~800 | ~1,600 | ~2,400 |
| Validation | 182 | 414 | 596 |

- **Fake methods included:** Deepfakes, Face2Face, FaceSwap, NeuralTextures
- **Compression:** C23 (visually lossless — a challenging and realistic benchmark)
- **Frame preprocessing:** 16 evenly-spaced frames sampled per video, face-cropped to 224×224 using MediaPipe BlazeFace

> 📌 Access to the FaceForensics++ dataset requires a request form. See [their GitHub](https://github.com/ondyari/FaceForensics) for instructions.

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/deepfake-detector

# ML Inference Service
ML_SERVICE_URL=http://localhost:5000
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ for media integrity and digital trust.

**[⬆ Back to Top](#-proof-of-reality)**

</div>
