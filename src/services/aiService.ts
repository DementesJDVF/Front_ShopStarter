import api from '../utils/axios';

export async function suggestDescription(
  payload: FormData | { image_url: string; product_id?: string },
  signal?: AbortSignal
): Promise<string> {
  const isFormData = payload instanceof FormData;
  const response = await api.post('products/suggest_description/', payload, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    signal
  });
  return response.data.task_id;
}

export async function pollTaskStatus(
  taskId: string,
  maxAttempts = 80,
  intervalMs = 500, // Empezamos muy rápido (0.5s)
  signal?: AbortSignal
): Promise<string> {
  let attempts = 0;
  let currentInterval = intervalMs;

  while (attempts < maxAttempts) {
    if (signal?.aborted) throw new Error('Operación cancelada por el usuario.');

    if (document.visibilityState === 'hidden') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      continue;
    }

    try {
      const response = await api.get(`products/tasks/${taskId}/`, { signal });
      const { status, result, error } = response.data;

      if (status === 'DONE') {
        return result;
      }

      if (status === 'FAILED') {
        throw new Error(error || 'La tarea de IA falló en el servidor.');
      }
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') throw err;
      console.warn("Retrying task status poll...");
    }

    // Polling Dinámico: Aumentamos el intervalo gradualmente para no saturar si tarda mucho
    if (attempts > 10) currentInterval = 1500; // Después de 5s, bajamos a 1.5s
    if (attempts > 30) currentInterval = 3000; // Después de 30s, bajamos a 3s

    await new Promise((resolve) => setTimeout(resolve, currentInterval));
    attempts++;
  }

  throw new Error('La IA está tomando más tiempo de lo esperado debido a alta demanda. Por favor, intenta de nuevo en unos momentos.');
}

export async function generateAIDescription(
  payload: FormData | { image_url: string; product_id?: string },
  signal?: AbortSignal
): Promise<string> {
  const taskId = await suggestDescription(payload, signal);
  return await pollTaskStatus(taskId, 60, 3000, signal);
}
