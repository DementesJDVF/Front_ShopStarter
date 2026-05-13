// ===== NUEVO: Sprint IA y Funcionalidad =====
import { useState, useCallback } from "react";

/**
 * Hook para llamadas seguras a servicios de IA.
 * Uso:
 *   const { resultado, error, cargando, llamarIA } = useIAFallback(fallbackValue);
 */
const useIAFallback = (fallbackValue = null) => {
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(false);
  const [cargando, setCargando] = useState(false);

  const llamarIA = useCallback(async (iaFunction, ...args) => {
    setCargando(true);
    setError(false);
    try {
      const respuesta = await iaFunction(...args);
      setResultado(respuesta);
    } catch (e) {
      console.warn("[IA Fallback activado]", e.message);
      setError(true);
      setResultado(fallbackValue);
    } finally {
      setCargando(false);
    }
  }, [fallbackValue]);

  return { resultado, error, cargando, llamarIA };
};

export default useIAFallback;
// ===== FIN NUEVO =====
