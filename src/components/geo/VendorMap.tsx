import React, { useEffect, useRef, useState } from 'react';
import api from '../../utils/axios';
import { Spinner } from 'flowbite-react';

interface VendorMapProps {
  isAdmin?: boolean;
}

/**
 * Componente de Mapa de Vendedores con soporte para Vista de Águila (Admin).
 */
const VendorMap: React.FC<VendorMapProps> = ({ isAdmin = false }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const [loading, setLoading] = useState(true);

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

  const initMap = async () => {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    if (leafletMap.current) {
        leafletMap.current.remove();
    }

    leafletMap.current = L.map(mapRef.current).setView([2.4419, -76.6062], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(leafletMap.current);

    try {
      const endpoint = isAdmin ? 'geo/locations/all_locations/' : 'geo/vendors-locations/';
      const response = await api.get(endpoint);
      const locations = response.data;

      if (Array.isArray(locations) && locations.length > 0) {
        const markers: any[] = [];
        locations.forEach((loc: any) => {
          if (loc.latitude && loc.longitude) {
            const marker = L.marker([loc.latitude, loc.longitude])
              .addTo(leafletMap.current)
              .bindPopup(`<b>${loc.description || loc.vendor_name || 'Vendedor'}</b><br>Lat: ${loc.latitude}, Lon: ${loc.longitude}`);
            markers.push(marker);
          }
        });

        if (markers.length > 0) {
          const group = L.featureGroup(markers);
          leafletMap.current.fitBounds(group.getBounds().pad(0.1));
        }
      }
    } catch (error) {
      console.error("Error al cargar ubicaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800">
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <Spinner size="xl" color="info" />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '500px' }} />
    </div>
  );
};

export default VendorMap;
