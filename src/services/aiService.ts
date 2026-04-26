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
  maxAttempts = 80, // Aumentamos intentos por si acaso
  intervalMs = 1500, // Reducido de 3000ms a 1500ms para mayor agilidad
  signal?: AbortSignal
): Promise<string> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    if (signal?.aborted) throw new Error('Operación cancelada por el usuario.');

    // Pausar si la pestaña no está visible para ahorrar recursos
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
      console.warn("Retrying task status poll due to network error...");
    }

    // Si sigue en PROCESSING o PENDING, esperamos
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
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
