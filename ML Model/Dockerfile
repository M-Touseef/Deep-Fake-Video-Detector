# Stage 1: Build - install Python dependencies
FROM python:3.10-slim AS builder

WORKDIR /install

# System deps needed only at build time.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Use PyTorch CPU-only index to avoid pulling CUDA wheels into the image.
RUN pip install --no-cache-dir --prefix=/install/packages \
    --extra-index-url https://download.pytorch.org/whl/cpu \
    -r requirements.txt

# Stage 2: Runtime
FROM python:3.10-slim

WORKDIR /app

# Runtime libs for OpenCV, MediaPipe, and MP4/video decoding.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /install/packages /usr/local

COPY app.py model.py utils.py ./
COPY best_spatial_detector.pth ./
COPY blaze_face_short_range.tflite ./
COPY templates/ ./templates/

RUN mkdir -p uploads

ENV PORT=5000
EXPOSE 5000

# Grad-CAM hooks are process-global, so keep one worker for predictable inference.
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT} --workers 1 --timeout 300 --log-level info app:app"]
