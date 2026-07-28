/**
 * PLGA Microvascular Image Processing Algorithm Engine
 * Fully client-side execution via ImageData array buffers.
 */

/**
 * Asynchronously loads an image source (dataURL string, URL string, HTMLImageElement, HTMLCanvasElement)
 */
function loadImage(source) {
  return new Promise((resolve, reject) => {
    if (!source) {
      reject(new Error('No image source provided to vesselProcessor'));
      return;
    }

    if (typeof HTMLCanvasElement !== 'undefined' && source instanceof HTMLCanvasElement) {
      resolve(source);
      return;
    }

    if (typeof HTMLImageElement !== 'undefined' && source instanceof HTMLImageElement) {
      if (source.complete && source.naturalWidth > 0) {
        resolve(source);
      } else {
        const imgCopy = new Image();
        imgCopy.crossOrigin = 'anonymous';
        imgCopy.onload = () => resolve(imgCopy);
        imgCopy.onerror = (err) => reject(new Error('Failed to load image element'));
        imgCopy.src = source.src;
      }
      return;
    }

    if (typeof source === 'string') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(new Error('Failed to load image from string URL/DataURL'));
      img.src = source;
      return;
    }

    reject(new Error('Unsupported image source type'));
  });
}

/**
 * Main process function taking an image source (HTMLImageElement / Image / Canvas / File / DataURL) and sensitivity
 */
export async function processVesselImage(imageSource, sensitivity = 120) {
  // Step 0: Ensure imageSource is converted to a loaded Image or Canvas element
  const loadedImage = await loadImage(imageSource);

  // Step 1: Downscale image if needed (max dimension 400px preserving aspect ratio)
  const { canvas: inputCanvas, ctx, width, height } = prepareCanvas(loadedImage, 400);
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
  let origWidth = imageSource.naturalWidth || imageSource.width || 400;
  let origHeight = imageSource.naturalHeight || imageSource.height || 400;

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
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageSource, 0, 0, canvas.width, canvas.height);

  return { canvas, ctx, width: canvas.width, height: canvas.height };
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
  const eroded = morphErode(binary, width, height);
  return morphDilate(eroded, width, height);
}

function morphClosing(binary, width, height) {
  const dilated = morphDilate(binary, width, height);
  return morphErode(dilated, width, height);
}

/**
 * Zhang-Suen Thinning Algorithm (Iterative 2-Pass)
 */
function zhangSuenThinning(binary, width, height) {
  let skeleton = new Uint8Array(binary);
  let changing = true;

  while (changing) {
    changing = false;

    // Pass 1
    let toRemove = [];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (skeleton[idx] !== 1) continue;

        const p2 = skeleton[(y - 1) * width + x];
        const p3 = skeleton[(y - 1) * width + (x + 1)];
        const p4 = skeleton[y * width + (x + 1)];
        const p5 = skeleton[(y + 1) * width + (x + 1)];
        const p6 = skeleton[(y + 1) * width + x];
        const p7 = skeleton[(y + 1) * width + (x - 1)];
        const p8 = skeleton[y * width + (x - 1)];
        const p9 = skeleton[(y - 1) * width + (x - 1)];

        const B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
        if (B < 2 || B > 6) continue;

        let A = 0;
        if (p2 === 0 && p3 === 1) A++;
        if (p3 === 0 && p4 === 1) A++;
        if (p4 === 0 && p5 === 1) A++;
        if (p5 === 0 && p6 === 1) A++;
        if (p6 === 0 && p7 === 1) A++;
        if (p7 === 0 && p8 === 1) A++;
        if (p8 === 0 && p9 === 1) A++;
        if (p9 === 0 && p2 === 1) A++;

        if (A !== 1) continue;

        if (p2 * p4 * p6 !== 0) continue;
        if (p4 * p6 * p8 !== 0) continue;

        toRemove.push(idx);
      }
    }

    if (toRemove.length > 0) {
      changing = true;
      for (let i = 0; i < toRemove.length; i++) {
        skeleton[toRemove[i]] = 0;
      }
    }

    // Pass 2
    toRemove = [];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (skeleton[idx] !== 1) continue;

        const p2 = skeleton[(y - 1) * width + x];
        const p3 = skeleton[(y - 1) * width + (x + 1)];
        const p4 = skeleton[y * width + (x + 1)];
        const p5 = skeleton[(y + 1) * width + (x + 1)];
        const p6 = skeleton[(y + 1) * width + x];
        const p7 = skeleton[(y + 1) * width + (x - 1)];
        const p8 = skeleton[y * width + (x - 1)];
        const p9 = skeleton[(y - 1) * width + (x - 1)];

        const B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
        if (B < 2 || B > 6) continue;

        let A = 0;
        if (p2 === 0 && p3 === 1) A++;
        if (p3 === 0 && p4 === 1) A++;
        if (p4 === 0 && p5 === 1) A++;
        if (p5 === 0 && p6 === 1) A++;
        if (p6 === 0 && p7 === 1) A++;
        if (p7 === 0 && p8 === 1) A++;
        if (p8 === 0 && p9 === 1) A++;
        if (p9 === 0 && p2 === 1) A++;

        if (A !== 1) continue;

        if (p2 * p4 * p8 !== 0) continue;
        if (p2 * p6 * p8 !== 0) continue;

        toRemove.push(idx);
      }
    }

    if (toRemove.length > 0) {
      changing = true;
      for (let i = 0; i < toRemove.length; i++) {
        skeleton[toRemove[i]] = 0;
      }
    }
  }

  return skeleton;
}

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

function clusterPoints(points, radius = 5) {
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
      if (dx * dx + dy * dy <= radius * radius) {
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

function countConnectedComponents(skeleton, width, height) {
  const visited = new Uint8Array(width * height);
  let count = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (skeleton[idx] === 1 && visited[idx] === 0) {
        count++;
        // BFS / DFS flood fill
        const queue = [idx];
        visited[idx] = 1;

        while (queue.length > 0) {
          const current = queue.pop();
          const cx = current % width;
          const cy = Math.floor(current / width);

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

function calculateLacunarity(binary, width, height, boxSize = 32, stride = 16) {
  const counts = [];
  for (let y = 0; y <= height - boxSize; y += stride) {
    for (let x = 0; x <= width - boxSize; x += stride) {
      let boxSum = 0;
      for (let by = 0; by < boxSize; by++) {
        for (let bx = 0; bx < boxSize; bx++) {
          if (binary[(y + by) * width + (x + bx)] === 1) boxSum++;
        }
      }
      counts.push(boxSum);
    }
  }

  if (counts.length === 0) return 1.0;

  const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
  if (mean === 0) return 1.0;

  const variance = counts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / counts.length;
  const lacunarity = 1.0 + (variance / (mean * mean));
  return Number(lacunarity.toFixed(3));
}

function renderBinaryMask(binary, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let i = 0; i < binary.length; i++) {
    const idx = i * 4;
    if (binary[i] === 1) {
      data[idx] = 0;       // R
      data[idx + 1] = 212; // G (#00D4AA)
      data[idx + 2] = 170; // B
      data[idx + 3] = 255; // A
    } else {
      data[idx] = 10;      // Dark background
      data[idx + 1] = 14;
      data[idx + 2] = 26;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

function renderSkeleton(skeleton, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let i = 0; i < skeleton.length; i++) {
    const idx = i * 4;
    if (skeleton[i] === 1) {
      data[idx] = 0;       // R
      data[idx + 1] = 180; // G (#00B4D8)
      data[idx + 2] = 216; // B
      data[idx + 3] = 255; // A
    } else {
      data[idx] = 10;
      data[idx + 1] = 14;
      data[idx + 2] = 26;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

function renderOverlay(inputCanvas, binary, skeleton, branchPoints, endpoints, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Draw original image base
  ctx.drawImage(inputCanvas, 0, 0, width, height);

  // Tint original image
  ctx.fillStyle = 'rgba(10, 14, 26, 0.4)';
  ctx.fillRect(0, 0, width, height);

  // Overlay vessel mask in Teal
  const binaryImgData = ctx.getImageData(0, 0, width, height);
  const data = binaryImgData.data;
  for (let i = 0; i < binary.length; i++) {
    if (binary[i] === 1) {
      const idx = i * 4;
      data[idx] = Math.min(255, data[idx] + 0);       // Red
      data[idx + 1] = Math.min(255, data[idx + 1] + 160); // Green (#00D4AA)
      data[idx + 2] = Math.min(255, data[idx + 2] + 130); // Blue
    }
  }
  ctx.putImageData(binaryImgData, 0, 0);

  // Draw Skeleton in Cyan
  for (let i = 0; i < skeleton.length; i++) {
    if (skeleton[i] === 1) {
      const x = i % width;
      const y = Math.floor(i / width);
      ctx.fillStyle = '#00B4D8';
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // Draw Branch Points in Pink
  for (let bp of branchPoints) {
    ctx.beginPath();
    ctx.arc(bp.x, bp.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#F472B6';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw Endpoints in Gold
  for (let ep of endpoints) {
    ctx.beginPath();
    ctx.arc(ep.x, ep.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FBBF24';
    ctx.fill();
  }

  return canvas;
}
