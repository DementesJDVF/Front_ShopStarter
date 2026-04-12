import React, { useEffect, useRef, useState } from 'react';
import { Button, Spinner } from 'flowbite-react';
import { Icon } from '@iconify/react';

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelected: (lat: number, lng: number) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  initialLat = 2.4419, // Popayán por defecto
  initialLng = -76.6062, 
  onLocationSelected 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPos, setCurrentPos] = useState({ lat: initialLat, lng: initialLng });

  useEffect(() => {
    const checkLeaflet = setInterval(() => {
      if ((window as any).L) {
        clearInterval(checkLeaflet);
        initMap();
      }
    }, 100);

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
      }
      clearInterval(checkLeaflet);
    };
  }, []);

  const initMap = () => {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    leafletMap.current = L.map(mapRef.current).setView([currentPos.lat, currentPos.lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(leafletMap.current);

    // Crear marcador inicial
    markerRef.current = L.marker([currentPos.lat, currentPos.lng], { draggable: true })
      .addTo(leafletMap.current)
      .bindPopup("Tu ubicación")
      .openPopup();

    // Eventos de click en mapa
    leafletMap.current.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      updatePosition(lat, lng);
    });

    // Evento de arrastre de marcador
    markerRef.current.on('dragend', (e: any) => {
      const { lat, lng } = e.target.getLatLng();
      updatePosition(lat, lng);
    });

    setLoading(false);
  };

  const updatePosition = (lat: number, lng: number) => {
    const L = (window as any).L;
    setCurrentPos({ lat, lng });
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
    onLocationSelected(lat, lng);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        leafletMap.current.setView([latitude, longitude], 15);
        updatePosition(latitude, longitude);
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center bg-gray-50 dark:bg-dark p-3 rounded-lg border border-gray-100 dark:border-gray-800">
        <div className="text-xs text-gray-500">
          <p>Latitud: <span className="font-bold text-primary">{currentPos.lat.toFixed(6)}</span></p>
          <p>Longitud: <span className="font-bold text-primary">{currentPos.lng.toFixed(6)}</span></p>
        </div>
        <Button color="gray" size="xs" onClick={handleUseCurrentLocation}>
          <Icon icon="solar:gps-linear" className="mr-2" /> Usar mi GPS
        </Button>
      </div>
      
      <div className="relative w-full h-[300px] rounded-xl overflow-hidden border-2 border-primary/20">
        {loading && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/50 backdrop-blur-sm">
            <Spinner size="lg" />
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>
      <p className="text-[10px] text-gray-400 text-center italic">
        Haz clic en el mapa o arrastra el marcador para elegir tu ubicación exacta.
      </p>
    </div>
  );
};

export default LocationPicker;
