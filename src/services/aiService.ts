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
  
  if (response.data.status === 'DONE') {
    return response.data.result;
  }
  throw new Error(response.data.error || 'Error al generar sugerencia.');
}

export async function generateAIDescription(
  payload: FormData | { image_url: string; product_id?: string },
  signal?: AbortSignal
): Promise<string> {
  return await suggestDescription(payload, signal);
}
