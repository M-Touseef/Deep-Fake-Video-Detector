# ────────────────────────────────────────────────────────────────
# Stage 1: Build — install Python deps
# ────────────────────────────────────────────────────────────────
FROM python:3.10-slim AS builder

WORKDIR /install

# System deps needed only at build time
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Use PyTorch CPU-only index (saves ~700 MB vs full CUDA wheel)
RUN pip install --no-cache-dir --prefix=/install/packages \
    --extra-index-url https://download.pytorch.org/whl/cpu \
    -r requirements.txt

# ────────────────────────────────────────────────────────────────
# Stage 2: Runtime
# ────────────────────────────────────────────────────────────────
FROM python:3.10-slim

WORKDIR /app

# Runtime system libs (OpenCV headless needs libglib, mediapipe needs libGL)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from build stage
COPY --from=builder /install/packages /usr/local

# Copy application code and model assets
COPY app.py model.py utils.py ./
COPY best_spatial_detector.pth ./
COPY blaze_face_short_range.tflite ./
COPY templates/ ./templates/

# Create uploads directory
RUN mkdir -p uploads

# Azure Container Apps uses PORT env var
ENV PORT=5000
EXPOSE 5000

# 1 worker — Grad-CAM hooks are not thread-safe
# 300s timeout for long-running inference
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT} --workers 1 --timeout 300 --log-level info app:app"]
