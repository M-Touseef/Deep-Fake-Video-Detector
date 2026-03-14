import torch
import torch.nn as nn
from torchvision import models


class SpatialDeepfakeDetector(nn.Module):
    def __init__(self, d_model=512, num_layers=3, nhead=8):
        super(SpatialDeepfakeDetector, self).__init__()

        # Backbone: EfficientNet-B0 (No need to download ImageNet weights now)
        self.backbone = models.efficientnet_b0(pretrained=False)
        self.backbone.classifier = nn.Identity()

        # Projection (1280 -> 512)
        self.feature_projector = nn.Linear(1280, d_model)

        # Shallow Transformer (NO Positional Encoding)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model, nhead=nhead, dim_feedforward=1024, batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)

        # Classification Head
        self.classifier = nn.Sequential(
            nn.Linear(d_model, 64),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(64, 1)
        )

    def forward(self, x):
        b, f, c, h, w = x.shape
        x = x.view(b * f, c, h, w)
        features = self.backbone(x)
        features = self.feature_projector(features)
        features = features.view(b, f, -1)
        trans_out = self.transformer(features)
        pooled = trans_out.mean(dim=1)
        return self.classifier(pooled)
