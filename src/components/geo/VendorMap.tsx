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
            let popupContent = `<b>${loc.description || loc.vendor_name || 'Vendedor'}</b>`;
            
            if (isAdmin) {
                popupContent = `
                  <div class="p-2 min-w-[200px] font-sans">
                    <h3 class="font-black text-indigo-900 border-b border-indigo-100 mb-2 uppercase italic text-lg">${loc.user_name || 'VENDEDOR'}</h3>
                    <p class="text-xs text-gray-500 mb-1"><b>Email:</b> ${loc.user_email}</p>
                    <p class="text-xs text-gray-500 mb-1"><b>Estado:</b> <span class="px-2 py-0.5 rounded-full ${loc.user_status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${loc.user_status}</span></p>
                    <p class="text-xs text-gray-400 mt-2"><b>Ubicación:</b> ${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}</p>
                    <p class="text-[10px] text-gray-300 mt-1 italic">Moderación ShopStarter</p>
                  </div>
                `;
            }

            const marker = L.marker([loc.latitude, loc.longitude])
              .addTo(leafletMap.current)
              .bindPopup(popupContent);
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
