import torch
import torch.nn as nn
import torch.nn.functional as F

class AngiogenesisVesselNet(nn.Module):
    """
    Canonical PyTorch Deep Learning Model Architecture for
    3D Anatomical Blood Vessel Lumens, Red Blood Cells (Erythrocytes),
    and Angiogenesis Sprout Nodes.
    
    Anti-Overfitting Features:
    - Spatial Dropout2D (p=0.30) in Convolutional Encoder
    - Fully-Connected Dropout (p=0.40) before Prediction Heads
    - Weight Decay (1e-4) applied in Optimizer
    """
    def __init__(self, in_channels=3, spatial_dropout=0.30, fc_dropout=0.40):
        super(AngiogenesisVesselNet, self).__init__()
        self.in_channels = in_channels
        self.spatial_dropout_rate = spatial_dropout
        self.fc_dropout_rate = fc_dropout

        # Convolutional Encoder
        self.enc_conv1   = nn.Conv2d(in_channels, 32, kernel_size=3, padding=1)
        self.enc_bn1     = nn.BatchNorm2d(32)
        self.relu1       = nn.ReLU(inplace=True)
        self.pool1       = nn.MaxPool2d(2, 2)
        self.drop1       = nn.Dropout2d(p=spatial_dropout)

        self.enc_conv2   = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.enc_bn2     = nn.BatchNorm2d(64)
        self.relu2       = nn.ReLU(inplace=True)
        self.pool2       = nn.MaxPool2d(2, 2)
        self.drop2       = nn.Dropout2d(p=spatial_dropout)

        self.enc_conv3   = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.enc_bn3     = nn.BatchNorm2d(128)
        self.relu3       = nn.ReLU(inplace=True)
        self.pool3       = nn.MaxPool2d(2, 2)
        self.drop3       = nn.Dropout2d(p=spatial_dropout)

        # Dual Prediction Heads
        self.global_pool = nn.AdaptiveAvgPool2d((1, 1))
        self.fc_drop     = nn.Dropout(p=fc_dropout)
        self.classifier  = nn.Linear(128, 3)    # 3 Angiogenesis categories
        self.regressor   = nn.Linear(128, 8)    # 8 quantitative vascular metrics

        # Transpose Segmentation Decoder
        self.dec_conv1   = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
        self.dec_drop1   = nn.Dropout2d(p=spatial_dropout * 0.8)
        self.dec_conv2   = nn.ConvTranspose2d(64, 32, kernel_size=2, stride=2)
        self.dec_conv3   = nn.ConvTranspose2d(32, 1, kernel_size=2, stride=2)
        self.sigmoid     = nn.Sigmoid()

    def forward(self, x):
        in_height, in_width = x.shape[2], x.shape[3]

        x1 = self.drop1(self.pool1(self.relu1(self.enc_bn1(self.enc_conv1(x)))))
        x2 = self.drop2(self.pool2(self.relu2(self.enc_bn2(self.enc_conv2(x1)))))
        x3 = self.drop3(self.pool3(self.relu3(self.enc_bn3(self.enc_conv3(x2)))))
        features = x3

        # Luminal Classification & Metric Regression
        pooled = self.fc_drop(self.global_pool(features).view(x.size(0), -1))
        class_logits = self.classifier(pooled)
        metrics_pred = self.regressor(pooled)

        # Luminal Vessel Segmentation Mask
        d1 = self.dec_drop1(self.dec_conv1(features))
        d2 = self.dec_conv2(d1)
        mask_raw = self.sigmoid(self.dec_conv3(d2))

        # Align exact input resolution dimensions
        mask_out = F.interpolate(mask_raw, size=(in_height, in_width), mode='bilinear', align_corners=False)

        return class_logits, metrics_pred, mask_out

MODEL_VERSION = "3.2.0"
MODEL_NAME = "AngiogenesisVesselNet"
