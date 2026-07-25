/**
 * PLGA Microvascular Image Processing Algorithm Engine
 * Fully client-side execution via ImageData array buffers.
 */

/**
 * Main process function taking an image source (HTMLImageElement / Image / Canvas / File) and sensitivity
 */
export async function processVesselImage(imageSource, sensitivity = 120) {
  // Step 1: Downscale image if needed (max dimension 400px preserving aspect ratio)
  const { canvas: inputCanvas, ctx, width, height } = prepareCanvas(imageSource, 400);
  const imgData = ctx.getImageData(0, 0, width, height);
  const pixels = imgData.data;

  // Step 2: Grayscale matrix
  const gray = new Float32Array(width * height);
  for (let i = 0; i < pixels.length; i += 4) {
    const idx = i / 4;
    gray[idx] = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
  }

  // Step 3: Integral Image Adaptive Thresholding (31x31 window)
  const integral = computeIntegralImage(gray, width, height);
  const binary = new Uint8Array(width * height); // 1 = vessel (foreground), 0 = background
  const windowRadius = 15; // 31x31 window
  const C = (sensitivity / 10) - 8;

  let fgCount = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const x1 = Math.max(0, x - windowRadius);
      const y1 = Math.max(0, y - windowRadius);
      const x2 = Math.min(width - 1, x + windowRadius);
      const y2 = Math.min(height - 1, y + windowRadius);

      const count = (x2 - x1 + 1) * (y2 - y1 + 1);
      const sum = getIntegralSum(integral, width, x1, y1, x2, y2);
      const localMean = sum / count;

      // Darker structures relative to local background mean are vessels
      if (gray[idx] < (localMean - C)) {
        binary[idx] = 1;
        fgCount++;
      } else {
        binary[idx] = 0;
      }
    }
  }

  // Step 4: Morphological Opening (Erode -> Dilate) then Closing (Dilate -> Erode)
  const opened = morphOpening(binary, width, height);
  const cleanedBinary = morphClosing(opened, width, height);

  // Recount cleaned foreground pixels
  let cleanFgCount = 0;
  for (let i = 0; i < cleanedBinary.length; i++) {
    if (cleanedBinary[i] === 1) cleanFgCount++;
  }

  // Step 5: Zhang-Suen Thinning (Skeletonization)
  const skeleton = zhangSuenThinning(cleanedBinary, width, height);

  let skeletonPixelCount = 0;
  for (let i = 0; i < skeleton.length; i++) {
    if (skeleton[i] === 1) skeletonPixelCount++;
  }

  // Step 6: Branch Points and Endpoints detection + Clustering
  const rawBranchPoints = [];
  const rawEndpoints = [];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (skeleton[idx] !== 1) continue;

      const neighbors = countSkeletonNeighbors(skeleton, x, y, width);
      if (neighbors >= 3) {
        rawBranchPoints.push({ x, y });
      } else if (neighbors === 1) {
        rawEndpoints.push({ x, y });
      }
    }
  }

  // Cluster branch points within 5px radius
  const clusteredBranchPoints = clusterPoints(rawBranchPoints, 5);

  // Step 7: Connected Components (Vessel Segments count)
  const vesselSegments = countConnectedComponents(skeleton, width, height);

  // Step 8: Calculate Metrics
  const vesselDensity = Number(((cleanFgCount / (width * height)) * 100).toFixed(2));
  const totalLength = skeletonPixelCount;
  const avgWidth = skeletonPixelCount > 0 ? Number((cleanFgCount / skeletonPixelCount).toFixed(2)) : 0;
  const branchPointCount = clusteredBranchPoints.length;
  const endpointCount = rawEndpoints.length;
  const lacunarity = calculateLacunarity(cleanedBinary, width, height, 32, 16);
  const connectivity = Number((Math.min(1.0, branchPointCount / Math.max(1, vesselSegments)) * 100).toFixed(1));

  const metrics = {
    vesselDensity,       // %
    branchPoints: branchPointCount,
    vesselSegments,
    totalLength,         // px
    avgWidth,            // px
    endpoints: endpointCount,
    lacunarity,          // index
    connectivity,        // %
    width,
    height
  };

  // Step 9: Render 3 Canvases
  const binaryCanvas = renderBinaryMask(cleanedBinary, width, height);
  const skeletonCanvas = renderSkeleton(skeleton, width, height);
  const overlayCanvas = renderOverlay(inputCanvas, cleanedBinary, skeleton, clusteredBranchPoints, rawEndpoints, width, height);

  return {
    metrics,
    binaryCanvas,
    skeletonCanvas,
    overlayCanvas,
    inputCanvas
  };
}

/**
 * Prepare Canvas downscaled to maxDimension
 */
function prepareCanvas(imageSource, maxDimension) {
  let origWidth = imageSource.naturalWidth || imageSource.width;
  let origHeight = imageSource.naturalHeight || imageSource.height;

  let width = origWidth;
  let height = origHeight;

  if (Math.max(width, height) > maxDimension) {
    if (width >= height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageSource, 0, 0, width, height);

  return { canvas, ctx, width, height };
}

/**
 * Integral Image Summed-Area Table
 */
function computeIntegralImage(gray, width, height) {
  const integral = new Float64Array(width * height);
  for (let y = 0; y < height; y++) {
    let rowSum = 0;
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      rowSum += gray[idx];
      const prevAbove = y > 0 ? integral[(y - 1) * width + x] : 0;
      integral[idx] = rowSum + prevAbove;
    }
  }
  return integral;
}

function getIntegralSum(integral, width, x1, y1, x2, y2) {
  const A = (x1 > 0 && y1 > 0) ? integral[(y1 - 1) * width + (x1 - 1)] : 0;
  const B = (y1 > 0) ? integral[(y1 - 1) * width + x2] : 0;
  const C = (x1 > 0) ? integral[y2 * width + (x1 - 1)] : 0;
  const D = integral[y2 * width + x2];
  return D - B - C + A;
}

/**
 * Morphological Erosion and Dilation (3x3 square element)
 */
function morphErode(binary, width, height) {
  const out = new Uint8Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (binary[idx] === 1) {
        let allOn = true;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (binary[(y + dy) * width + (x + dx)] !== 1) {
              allOn = false;
              break;
            }
          }
          if (!allOn) break;
        }
        out[idx] = allOn ? 1 : 0;
      }
    }
  }
  return out;
}

function morphDilate(binary, width, height) {
  const out = new Uint8Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (binary[idx] === 1) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            out[(y + dy) * width + (x + dx)] = 1;
          }
        }
      }
    }
  }
  return out;
}

function morphOpening(binary, width, height) {
  return morphDilate(morphErode(binary, width, height), width, height);
}

function morphClosing(binary, width, height) {
  return morphErode(morphDilate(binary, width, height), width, height);
}

/**
 * Zhang-Suen Thinning Algorithm
 */
function zhangSuenThinning(binary, width, height) {
  const grid = new Uint8Array(binary);
  let changed = true;

  while (changed) {
    changed = false;

    // Pass 1
    const toRemove1 = [];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (grid[idx] !== 1) continue;

        const p2 = grid[(y - 1) * width + x];
        const p3 = grid[(y - 1) * width + (x + 1)];
        const p4 = grid[y * width + (x + 1)];
        const p5 = grid[(y + 1) * width + (x + 1)];
        const p6 = grid[(y + 1) * width + x];
        const p7 = grid[(y + 1) * width + (x - 1)];
        const p8 = grid[y * width + (x - 1)];
        const p9 = grid[(y - 1) * width + (x - 1)];

        const B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
        if (B < 2 || B > 6) continue;

        const A = (p2 === 0 && p3 === 1 ? 1 : 0) +
                  (p3 === 0 && p4 === 1 ? 1 : 0) +
                  (p4 === 0 && p5 === 1 ? 1 : 0) +
                  (p5 === 0 && p6 === 1 ? 1 : 0) +
                  (p6 === 0 && p7 === 1 ? 1 : 0) +
                  (p7 === 0 && p8 === 1 ? 1 : 0) +
                  (p8 === 0 && p9 === 1 ? 1 : 0) +
                  (p9 === 0 && p2 === 1 ? 1 : 0);

        if (A !== 1) continue;

        if (p2 * p4 * p6 !== 0) continue;
        if (p4 * p6 * p8 !== 0) continue;

        toRemove1.push(idx);
      }
    }

    for (let i = 0; i < toRemove1.length; i++) {
      grid[toRemove1[i]] = 0;
      changed = true;
    }

    // Pass 2
    const toRemove2 = [];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (grid[idx] !== 1) continue;

        const p2 = grid[(y - 1) * width + x];
        const p3 = grid[(y - 1) * width + (x + 1)];
        const p4 = grid[y * width + (x + 1)];
        const p5 = grid[(y + 1) * width + (x + 1)];
        const p6 = grid[(y + 1) * width + x];
        const p7 = grid[(y + 1) * width + (x - 1)];
        const p8 = grid[y * width + (x - 1)];
        const p9 = grid[(y - 1) * width + (x - 1)];

        const B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
        if (B < 2 || B > 6) continue;

        const A = (p2 === 0 && p3 === 1 ? 1 : 0) +
                  (p3 === 0 && p4 === 1 ? 1 : 0) +
                  (p4 === 0 && p5 === 1 ? 1 : 0) +
                  (p5 === 0 && p6 === 1 ? 1 : 0) +
                  (p6 === 0 && p7 === 1 ? 1 : 0) +
                  (p7 === 0 && p8 === 1 ? 1 : 0) +
                  (p8 === 0 && p9 === 1 ? 1 : 0) +
                  (p9 === 0 && p2 === 1 ? 1 : 0);

        if (A !== 1) continue;

        if (p2 * p4 * p8 !== 0) continue;
        if (p2 * p6 * p8 !== 0) continue;

        toRemove2.push(idx);
      }
    }

    for (let i = 0; i < toRemove2.length; i++) {
      grid[toRemove2[i]] = 0;
      changed = true;
    }
  }

  return grid;
}

/**
 * 8-Neighbor Skeleton Counter
 */
function countSkeletonNeighbors(skeleton, x, y, width) {
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      if (skeleton[(y + dy) * width + (x + dx)] === 1) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Cluster points within a specified pixel radius
 */
function clusterPoints(points, maxDistance) {
  const clusters = [];
  const visited = new Set();

  for (let i = 0; i < points.length; i++) {
    if (visited.has(i)) continue;
    visited.add(i);

    let sumX = points[i].x;
    let sumY = points[i].y;
    let count = 1;

    for (let j = i + 1; j < points.length; j++) {
      if (visited.has(j)) continue;
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      if (Math.sqrt(dx * dx + dy * dy) <= maxDistance) {
        visited.add(j);
        sumX += points[j].x;
        sumY += points[j].y;
        count++;
      }
    }

    clusters.push({
      x: Math.round(sumX / count),
      y: Math.round(sumY / count)
    });
  }

  return clusters;
}

/**
 * Count Connected Components on Skeleton (BFS Flood fill)
 */
function countConnectedComponents(skeleton, width, height) {
  const visited = new Uint8Array(width * height);
  let count = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (skeleton[idx] === 1 && visited[idx] === 0) {
        count++;
        // BFS
        const queue = [idx];
        visited[idx] = 1;

        while (queue.length > 0) {
          const curr = queue.shift();
          const cx = curr % width;
          const cy = Math.floor(curr / width);

          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = cx + dx;
              const ny = cy + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nidx = ny * width + nx;
                if (skeleton[nidx] === 1 && visited[nidx] === 0) {
                  visited[nidx] = 1;
                  queue.push(nidx);
                }
              }
            }
          }
        }
      }
    }
  }

  return count;
}

/**
 * Calculate Lacunarity over binary matrix using sliding box counting
 */
function calculateLacunarity(binary, width, height, boxSize = 32, step = 16) {
  const counts = [];
  for (let y = 0; y <= height - boxSize; y += step) {
    for (let x = 0; x <= width - boxSize; x += step) {
      let boxFg = 0;
      for (let by = 0; by < boxSize; by++) {
        for (let bx = 0; bx < boxSize; bx++) {
          if (binary[(y + by) * width + (x + bx)] === 1) {
            boxFg++;
          }
        }
      }
      counts.push(boxFg);
    }
  }

  if (counts.length === 0) return 1.0;

  const mean = counts.reduce((acc, v) => acc + v, 0) / counts.length;
  const variance = counts.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / counts.length;

  const lac = (variance / (Math.pow(mean, 2) + 1e-6)) + 1;
  return Number(lac.toFixed(2));
}

/**
 * Canvas Renderer: Binary Mask (Teal on Dark)
 */
function renderBinaryMask(binary, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let i = 0; i < binary.length; i++) {
    const p = i * 4;
    if (binary[i] === 1) {
      data[p] = 0;       // R
      data[p + 1] = 212; // G (#00D4AA)
      data[p + 2] = 170; // B
      data[p + 3] = 255; // A
    } else {
      data[p] = 20;      // R (#14191A dark)
      data[p + 1] = 25;  // G
      data[p + 2] = 26;  // B
      data[p + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Canvas Renderer: Skeleton (Cyan on Dark)
 */
function renderSkeleton(skeleton, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let i = 0; i < skeleton.length; i++) {
    const p = i * 4;
    if (skeleton[i] === 1) {
      data[p] = 0;       // R
      data[p + 1] = 180; // G (#00B4D8 cyan)
      data[p + 2] = 216; // B
      data[p + 3] = 255;
    } else {
      data[p] = 20;      // R (#14191A)
      data[p + 1] = 25;
      data[p + 2] = 26;
      data[p + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Canvas Renderer: Analysis Overlay (Original + Blended Mask + Skeleton + Dots)
 */
function renderOverlay(inputCanvas, binary, skeleton, branchPoints, endpoints, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Draw original image base
  ctx.drawImage(inputCanvas, 0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let i = 0; i < binary.length; i++) {
    const p = i * 4;
    const isFg = binary[i] === 1;
    const isSkel = skeleton[i] === 1;

    if (isSkel) {
      // Blend 30% original + 70% Cyan (#00B4D8)
      data[p] = Math.round(data[p] * 0.3 + 0 * 0.7);
      data[p + 1] = Math.round(data[p + 1] * 0.3 + 180 * 0.7);
      data[p + 2] = Math.round(data[p + 2] * 0.3 + 216 * 0.7);
    } else if (isFg) {
      // Blend 65% original + 35% Teal (#00D4AA)
      data[p] = Math.round(data[p] * 0.65 + 0 * 0.35);
      data[p + 1] = Math.round(data[p + 1] * 0.65 + 212 * 0.35);
      data[p + 2] = Math.round(data[p + 2] * 0.65 + 170 * 0.35);
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Draw Pink branch point circles
  const branchRadius = Math.max(3, Math.round(width * 0.008));
  ctx.fillStyle = '#F472B6'; // Pink
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  branchPoints.forEach(bp => {
    ctx.beginPath();
    ctx.arc(bp.x, bp.y, branchRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  });

  // Draw Gold endpoint circles
  const endRadius = Math.max(2, Math.round(width * 0.006));
  ctx.fillStyle = '#FBBF24'; // Gold
  endpoints.forEach(ep => {
    ctx.beginPath();
    ctx.arc(ep.x, ep.y, endRadius, 0, 2 * Math.PI);
    ctx.fill();
  });

  return canvas;
}
