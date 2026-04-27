import api from './axios';

/**
 * Convierte una URL de imagen (que puede ser absoluta o relativa del backend)
 * en una URL absoluta funcional para el navegador.
 */
export const getAbsoluteImageUrl = (url: string | null | undefined): string => {
  if (!url) return 'https://via.placeholder.com/150?text=Sin+Imagen';
  
  // Si ya es absoluta (Cloudinary, externas, Base64), la devolvemos tal cual
  if (url.startsWith('http') || url.startsWith('data:')) {
    return url;
  }
  
  // Si es relativa, le anteponemos el dominio del backend
  // api.defaults.baseURL suele ser algo como 'https://.../api/'
  const backendBase = api.defaults.baseURL?.replace('/api/', '') || '';
  
  // Aseguramos que no haya barras dobles innecesarias
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  
  return `${backendBase}${cleanUrl}`;
};
