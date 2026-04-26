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
  const startTime = Date.now();

  while (attempts < maxAttempts) {
    if (signal?.aborted) throw new Error('Operación cancelada por el usuario.');

    // Timeout de seguridad: Si pasan 45 segundos sin éxito, abortamos
    if (Date.now() - startTime > 45000) {
      throw new Error('El servidor de IA está tardando demasiado. Por favor, verifica que tu conexión sea estable e intenta de nuevo.');
    }

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

      // Si la tarea está PENDING por más de 10 segundos, algo anda mal con el worker
      if (status === 'PENDING' && (Date.now() - startTime > 10000)) {
         console.warn("Task stuck in PENDING, checking worker...");
      }
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') throw err;
      if (err.response?.status === 500) throw err; // Error real del servidor
      console.warn("Retrying task status poll...");
    }

    // Polling Dinámico: Aumentamos el intervalo gradualmente
    if (attempts > 10) currentInterval = 1500; 
    if (attempts > 30) currentInterval = 3000; 

    await new Promise((resolve) => setTimeout(resolve, currentInterval));
    attempts++;
  }

  throw new Error('Timeout de espera superado.');
}

export async function generateAIDescription(
  payload: FormData | { image_url: string; product_id?: string },
  signal?: AbortSignal
): Promise<string> {
  const taskId = await suggestDescription(payload, signal);
  return await pollTaskStatus(taskId, 60, 3000, signal);
}
