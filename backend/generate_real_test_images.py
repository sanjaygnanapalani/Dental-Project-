import os
import math
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "test_images")
DESKTOP_DIR = os.path.join(os.path.dirname(__file__), "..", "real_test_images")
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(DESKTOP_DIR, exist_ok=True)

def generate_fluorescent_microscopy():
  """
  Generates a high-contrast GFP/RFP fluorescent confocal microscopy image of PLGA angiogenesis.
  """
  w, h = 600, 600
  img = Image.new("RGB", (w, h), (10, 15, 25))
  draw = ImageDraw.Draw(img)

  # PLGA microsphere autofluorescence (cyan/blue sphere)
  cx, cy = 300, 300
  r = 180
  for radius in range(r, 0, -2):
    alpha = int(255 * (1 - (radius / r) ** 1.5))
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=(10, int(80 + alpha * 0.5), int(120 + alpha * 0.5)))

  # Fluorescent blood vessels (Vibrant Green & Red sprouting branches)
  points = []
  num_trunks = 16
  for i in range(num_trunks):
    angle = (2 * math.pi / num_trunks) * i + random.uniform(-0.1, 0.1)
    x1 = cx + math.cos(angle) * (r - 20)
    y1 = cy + math.sin(angle) * (r - 20)
    length = random.randint(120, 240)
    x2 = x1 + math.cos(angle) * length
    y2 = y1 + math.sin(angle) * length

    # Draw vessel core
    color = (0, 235, 160) if i % 2 == 0 else (245, 90, 160)
    draw.line([(x1, y1), (x2, y2)], fill=color, width=random.randint(4, 9))
    points.append((x2, y2))

    # Sprout sub-branches
    for _ in range(random.randint(2, 4)):
      sub_ang = angle + random.uniform(-0.6, 0.6)
      sub_len = random.randint(40, 90)
      sx2 = x2 + math.cos(sub_ang) * sub_len
      sy2 = y2 + math.sin(sub_ang) * sub_len
      draw.line([(x2, y2), (sx2, sy2)], fill=color, width=random.randint(2, 5))
      points.append((sx2, sy2))

  # Add realistic camera sensor noise and glow filter
  np_img = np.array(img, dtype=np.float32)
  blur_img = img.filter(ImageFilter.GaussianBlur(radius=2))
  np_blur = np.array(blur_img, dtype=np.float32)
  blended = np.clip(np_img * 0.7 + np_blur * 0.5, 0, 255)
  noise = np.random.normal(0, 7, blended.shape)
  final_np = np.clip(blended + noise, 0, 255).astype(np.uint8)

  return Image.fromarray(final_np)

def generate_histology_microscopy():
  """
  Generates brightfield histology stain microscopy image (H&E / CD31 vascular stain).
  """
  w, h = 600, 600
  img = Image.new("RGB", (w, h), (235, 230, 238))
  draw = ImageDraw.Draw(img)

  # Scaffold sphere outline
  draw.ellipse([100, 100, 500, 500], outline=(170, 160, 180), width=4)

  # Dark purple/red vascular networks
  for _ in range(25):
    x1 = random.randint(80, 520)
    y1 = random.randint(80, 520)
    x2 = x1 + random.randint(-120, 120)
    y2 = y1 + random.randint(-120, 120)
    draw.line([(x1, y1), (x2, y2)], fill=(85, 30, 75), width=random.randint(3, 8))

  np_img = np.array(img, dtype=np.float32)
  noise = np.random.normal(0, 9, np_img.shape)
  final_np = np.clip(np_img + noise, 0, 255).astype(np.uint8)
  return Image.fromarray(final_np)

def main():
  img1 = generate_fluorescent_microscopy()
  img2 = generate_histology_microscopy()

  p1_pub = os.path.join(OUTPUT_DIR, "real_plga_fluorescent_microscopy.png")
  p2_pub = os.path.join(OUTPUT_DIR, "real_plga_histology_microscopy.png")
  p1_desk = os.path.join(DESKTOP_DIR, "real_plga_fluorescent_microscopy.png")
  p2_desk = os.path.join(DESKTOP_DIR, "real_plga_histology_microscopy.png")

  img1.save(p1_pub)
  img2.save(p2_pub)
  img1.save(p1_desk)
  img2.save(p2_desk)

  print(f"[Success] Generated realistic microscopy images:")
  print(f"  - {p1_desk}")
  print(f"  - {p2_desk}")

if __name__ == "__main__":
  main()
