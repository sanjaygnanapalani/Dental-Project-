/**
 * Client API for communicating with the Python REST API server (PyTorch / TensorFlow Backend)
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Checks if the Python PyTorch REST API is active and online
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) return { online: false };
    const data = await response.json();
    return { online: true, status: 'online', ...data };
  } catch (err) {
    return { online: false, status: 'offline', error: err.message };
  }
}

export async function getModelInfo() {
  try {
    const response = await fetch(`${API_BASE_URL}/model-info`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) return { status: 'offline' };
    return await response.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

/**
 * Sends image payload to the Python REST API for high-accuracy PyTorch deep learning analysis
 */
export async function analyzeImageWithBackend(imageDataUrl, sensitivity = 120) {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: imageDataUrl,
        sensitivity: sensitivity
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP status ${response.status}`);
    }

    const res = await response.json();
    if (!res.success) {
      throw new Error(res.error || 'Backend analysis failed');
    }
    return res.data;
  } catch (err) {
    console.warn('Backend REST API call failed, falling back to local engine:', err);
    return null;
  }
}

export async function analyzeImageWithAI(imageDataUrl, sensitivity = 120) {
  return analyzeImageWithBackend(imageDataUrl, sensitivity);
}

/**
 * Triggers retraining of the PyTorch / H5 model on the backend
 */
export async function triggerModelTraining() {
  try {
    const response = await fetch(`${API_BASE_URL}/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await response.json();
  } catch (err) {
    console.error('Trigger training failed:', err);
    return { success: false, error: err.message };
  }
}

export async function retrainAIModel() {
  return triggerModelTraining();
}
