/**
 * Optimiza URLs de Cloudinary inyectando f_auto, q_auto y ancho máximo.
 */
export const optimizeImageUrl = (url: string, width = 800): string => {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  // Inyectamos parámetros después de /upload/
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;

  const prefix = url.substring(0, uploadIndex + 8); // Incluye "/upload/"
  const suffix = url.substring(uploadIndex + 8);
  
  // f_auto: formato automático (WebP/AVIF)
  // q_auto: calidad automática
  // c_limit: escala solo si es más grande
  return `${prefix}f_auto,q_auto,w_${width},c_limit/${suffix}`;
};
