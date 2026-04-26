import api from '../utils/axios';

export async function suggestDescription(
  payload: FormData | { image_url: string; product_id?: string },
  signal?: AbortSignal,
  sync = false
): Promise<{ task_id?: string; result?: string; status: string }> {
  const isFormData = payload instanceof FormData;
  
  if (sync) {
    if (isFormData) (payload as FormData).append('sync', 'true');
    else (payload as any).sync = 'true';
  }

  const response = await api.post('products/suggest_description/', payload, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    signal
  });
  return response.data;
}

export async function pollTaskStatus(
  taskId: string,
  maxAttempts = 80,
  intervalMs = 500,
  signal?: AbortSignal
): Promise<string> {
  // ... (keep previous optimized pollTaskStatus logic)
  let attempts = 0;
  let currentInterval = intervalMs;
  const startTime = Date.now();

  while (attempts < maxAttempts) {
    if (signal?.aborted) throw new Error('Operación cancelada por el usuario.');

    if (Date.now() - startTime > 30000) { // Reducido a 30s para disparar el bypass antes
      throw new Error('TIMEOUT_ASYNC');
    }

    if (document.visibilityState === 'hidden') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      continue;
    }

    try {
      const response = await api.get(`products/tasks/${taskId}/`, { signal });
      const { status, result, error } = response.data;

      if (status === 'DONE') return result;
      if (status === 'FAILED') throw new Error(error || 'FAILED');

    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') throw err;
      if (err.response?.status === 500) throw err;
      console.warn("Retrying task status poll...");
    }

    if (attempts > 10) currentInterval = 1500; 
    if (attempts > 30) currentInterval = 3000; 

    await new Promise((resolve) => setTimeout(resolve, currentInterval));
    attempts++;
  }
  throw new Error('TIMEOUT_ASYNC');
}

export async function generateAIDescription(
  payload: FormData | { image_url: string; product_id?: string },
  signal?: AbortSignal
): Promise<string> {
  try {
    // Intento 1: Asíncrono (Celery) - Comportamiento normal
    const data = await suggestDescription(payload, signal);
    if (data.status === 'DONE' && data.result) return data.result;
    return await pollTaskStatus(data.task_id!, 80, 500, signal);
  } catch (err: any) {
    // Si falla por timeout de Celery o worker caído, intentamos Modo Directo (Sync)
    if (err.message === 'TIMEOUT_ASYNC' || err.message === 'FAILED' || err.status === 'PENDING') {
      console.warn("Celery worker slow or down. Retrying with Sync Bypass...");
      const syncData = await suggestDescription(payload, signal, true);
      if (syncData.status === 'DONE' && syncData.result) {
        return syncData.result;
      }
    }
    throw err;
  }
}
