import api from '../utils/axios';

export async function suggestDescription(
  payload: FormData | { image_url: string; product_id?: string }
): Promise<string> {
  const isFormData = payload instanceof FormData;
  const response = await api.post('products/suggest_description/', payload, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data.task_id;
}

export async function pollTaskStatus(
  taskId: string,
  maxAttempts = 60, // 60 intentos * 3s = 180s (3 minutos)
  intervalMs = 3000
): Promise<string> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await api.get(`products/tasks/${taskId}/`);
    const { status, result, error } = response.data;

    if (status === 'DONE') {
      return result;
    }

    if (status === 'FAILED') {
      throw new Error(error || 'La tarea de IA falló en el servidor.');
    }

    // Si sigue en PROCESSING o PENDING, esperamos
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    attempts++;
  }

  throw new Error('La IA está tomando más tiempo de lo esperado debido a alta demanda. Por favor, intenta de nuevo en unos momentos.');
}

export async function generateAIDescription(
  payload: FormData | { image_url: string; product_id?: string }
): Promise<string> {
  const taskId = await suggestDescription(payload);
  return await pollTaskStatus(taskId);
}
