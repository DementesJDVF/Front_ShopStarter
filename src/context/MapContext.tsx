import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Location {
  lat: number;
  lng: number;
}

interface MapContextType {
  userLocation: Location | null;
  radius: number;
  setRadius: (r: number) => void;
  isLocationActive: boolean;
  gettingLocation: boolean;
  requestLocation: () => Promise<Location | null>;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

/**
 * Proveedor de Contexto para el Mapa y Localización.
 * Permite que la ubicación del usuario sea persistente mientras navega por la app.
 */
export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [radius, setRadius] = useState<number>(0); // 0 = sin filtro
  const [gettingLocation, setGettingLocation] = useState(false);

  // Cargar ubicación guardada si existe (opcional, para persistencia entre refrescos)
  useEffect(() => {
    const saved = localStorage.getItem('user_geo_location');
    if (saved) {
      setUserLocation(JSON.parse(saved));
    }
  }, []);

  const requestLocation = (): Promise<Location | null> => {
    return new Promise((resolve) => {
      setGettingLocation(true);
      if (!navigator.geolocation) {
        toast.error("Tu navegador no soporta geolocalización.");
        setGettingLocation(false);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          localStorage.setItem('user_geo_location', JSON.stringify(loc));
          setGettingLocation(false);
          toast.success("Ubicación activada correctamente.");
          resolve(loc);
        },
        (err) => {
          console.error("Error obteniendo ubicación:", err);
          let msg = "No se pudo obtener tu ubicación. Verifica los permisos.";
          if (err.code === err.TIMEOUT) msg = "La geolocalización tardó demasiado. Intenta de nuevo.";
          toast.error(msg);
          setGettingLocation(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  return (
    <MapContext.Provider value={{
      userLocation,
      radius,
      setRadius,
      isLocationActive: !!userLocation,
      gettingLocation,
      requestLocation
    }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap debe usarse dentro de un MapProvider');
  }
  return context;
};
