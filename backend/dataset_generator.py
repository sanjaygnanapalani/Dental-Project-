import os
import math
import random
import json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

DATASET_DIR = os.path.join(os.path.dirname(__file__), "dataset")
CLASSES = ["lumen_intraluminal_flow", "angiogenic_branch_node", "capillary_sprouting_network"]

def generate_angiogenesis_vessel_sample(sample_id, category, size=(500, 500)):
    """
    Generates realistic 3D anatomical microscopy samples of Blood Vessel Lumens,
    flowing Red Blood Cells (Erythrocytes), and Angiogenesis Branching Nodes.
    """
    width, height = size

    # 1. Base Image: Tubular Blood Vessel Lumen with crimson/red tissue gradient
    img = Image.new("RGB", (width, height), (75, 12, 18))
    draw = ImageDraw.Draw(img)

    # Ground truth segmentation mask (0 = background, 255 = vessel lumen & RBCs)
    mask = Image.new("L", (width, height), 0)
    mask_draw = ImageDraw.Draw(mask)

    # Render 3D Vascular Tunnel / Lumen Wall Depth Gradient
    center_x, center_y = width // 2, height // 2
    max_radius = 230

    for r in range(max_radius, 10, -3):
        factor = r / max_radius
        # Deep crimson (#50050A) to bright lumen center (#A02028)
        red_val = int(75 + (1 - factor) * 110)
        green_val = int(10 + (1 - factor) * 35)
        blue_val = int(18 + (1 - factor) * 45)
        draw.ellipse(
            [center_x - r, center_y - r, center_x + r, center_y + r],
            fill=(red_val, green_val, blue_val)
        )
        mask_draw.ellipse(
            [center_x - r, center_y - r, center_x + r, center_y + r],
            fill=int(180 * (1 - factor))
        )

    # 2. Angiogenesis Branching Nodes & Side Vessels
    num_nodes = 0
    if category == "lumen_intraluminal_flow":
        rbc_count = random.randint(18, 28)
        num_branches = 4
    elif category == "angiogenic_branch_node":
        rbc_count = random.randint(12, 20)
        num_branches = 10
    else: # capillary_sprouting_network
        rbc_count = random.randint(14, 22)
        num_branches = 14

    branch_nodes = []
    for i in range(num_branches):
        angle = (2 * math.pi / max(1, num_branches)) * i + random.uniform(-0.2, 0.2)
        length = random.randint(140, 220)
        ex = int(center_x + length * math.cos(angle))
        ey = int(center_y + length * math.sin(angle))
        stroke_w = random.randint(8, 22)

        # Draw branching blood vessel tube
        draw.line([(center_x, center_y), (ex, ey)], fill=(160, 30, 45), width=stroke_w)
        mask_draw.line([(center_x, center_y), (ex, ey)], fill=255, width=stroke_w)

        # Bifurcation node point
        node_r = stroke_w + 3
        draw.ellipse([ex - node_r, ey - node_r, ex + node_r, ey + node_r], fill=(245, 90, 140), outline=(255, 255, 255))
        branch_nodes.append((ex, ey))
        num_nodes += 1

    # 3. Flowing Red Blood Cells (Erythrocytes - Biconcave Discs)
    rbc_locations = []
    for _ in range(rbc_count):
        # Distribute inside vessel lumen tunnel
        dist = random.uniform(20, max_radius - 30)
        ang = random.uniform(0, 2 * math.pi)
        rx = int(center_x + dist * math.cos(ang))
        ry = int(center_y + dist * math.sin(ang))

        # Disc dimensions with 3D tilt perspective
        rw = random.randint(22, 38)
        rh = int(rw * random.uniform(0.45, 0.75))
        tilt_angle = random.uniform(0, 180)

        # Create individual RBC disc overlay
        rbc_img = Image.new("RGBA", (rw + 8, rw + 8), (0, 0, 0, 0))
        rbc_draw = ImageDraw.Draw(rbc_img)

        # Outer rim (Crimson #D32F2F) & dimpled center (biconcave reflection)
        rbc_draw.ellipse([2, 2, rw + 2, rh + 2], fill=(225, 45, 60, 240), outline=(255, 140, 150, 255), width=2)
        rbc_draw.ellipse([rw // 4 + 2, rh // 4 + 2, 3 * rw // 4 + 2, 3 * rh // 4 + 2], fill=(165, 25, 38, 220))

        # Rotate disc
        rotated_rbc = rbc_img.rotate(tilt_angle, expand=True)
        img.paste(rotated_rbc, (rx - rotated_rbc.width // 2, ry - rotated_rbc.height // 2), rotated_rbc)
        mask_draw.ellipse([rx - rw // 2, ry - rh // 2, rx + rw // 2, ry + rh // 2], fill=255)

        rbc_locations.append((rx, ry))

    # Add micro-anatomical texture noise & subtle endothelial wall blur
    np_img = np.array(img, dtype=np.float32)
    blur_img = img.filter(ImageFilter.GaussianBlur(radius=1.5))
    np_blur = np.array(blur_img, dtype=np.float32)
    blended = np.clip(np_img * 0.75 + np_blur * 0.4, 0, 255)
    noise = np.random.normal(0, 7, blended.shape)
    final_np = np.clip(blended + noise, 0, 255).astype(np.uint8)
    final_img = Image.fromarray(final_np)

    np_mask = np.array(mask)
    vessel_pixel_count = np.count_nonzero(np_mask)
    total_pixels = width * height
    vessel_density = round((vessel_pixel_count / total_pixels) * 100, 2)

    metadata = {
        "id": sample_id,
        "category": category,
        "vessel_density": vessel_density,
        "red_blood_cells_count": len(rbc_locations),
        "branch_nodes_count": num_nodes,
        "vessel_segments_count": num_branches + num_nodes,
        "total_length_px": int(vessel_pixel_count * 0.48),
        "avg_lumen_width_px": round(float(random.uniform(18.5, 34.0)), 2),
        "endpoints_count": int(num_nodes * 0.65) + random.randint(4, 8),
        "lacunarity_index": round(random.uniform(0.12, 0.35), 3),
        "connectivity_pct": round(min(100.0, (num_nodes / max(1, num_branches)) * 100.0), 1)
    }

    return final_img, mask, metadata

def create_dataset(samples_per_class=35):
    """
    Generates training dataset focused on Blood Vessel Lumens, Erythrocytes, and Angiogenesis Nodes.
    """
    os.makedirs(os.path.join(DATASET_DIR, "images"), exist_ok=True)
    os.makedirs(os.path.join(DATASET_DIR, "masks"), exist_ok=True)

    metadata_list = []
    total_count = 0
    print(f"Generating Angiogenesis Blood Vessel & Red Blood Cell Dataset ({samples_per_class} per class)...")

    for cls in CLASSES:
        for i in range(samples_per_class):
            sample_id = f"angio_vessel_{cls}_{i+1:03d}"
            img, mask, meta = generate_angiogenesis_vessel_sample(sample_id, cls)

            img_path = os.path.join(DATASET_DIR, "images", f"{sample_id}.png")
            mask_path = os.path.join(DATASET_DIR, "masks", f"{sample_id}_mask.png")

            img.save(img_path)
            mask.save(mask_path)
            metadata_list.append(meta)
            total_count += 1

    meta_file = os.path.join(DATASET_DIR, "angiogenesis_vessel_metadata.json")
    with open(meta_file, "w") as f:
        json.dump(metadata_list, f, indent=2)

    print(f"Successfully generated {total_count} Angiogenesis Vessel & Lumen samples in '{DATASET_DIR}'!")
    return meta_file

if __name__ == "__main__":
    create_dataset()
