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
      setLoading(true);
      const endpoint = isAdmin ? 'geo/locations/all_locations/' : 'geo/vendors-locations/';
      const response = await api.get(endpoint);
      
      // 🔥 CORRECCIÓN: Manejar tanto arrays como objetos con 'results' (DRF Pagination)
      const data = response.data.results || response.data;
      const locations = Array.isArray(data) ? data : [];

      if (locations.length > 0) {
        const markers: any[] = [];
        locations.forEach((loc: any) => {
          if (loc.latitude && loc.longitude) {
            let popupContent = `<b>${loc.description || loc.vendor_name || 'Vendedor'}</b>`;
            
            if (isAdmin) {
                const productsHtml = loc.products?.map((p: any) => `
                  <div class="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-lg p-1 border border-gray-100 dark:border-slate-700 mb-1">
                    <img src="${p.image || 'https://via.placeholder.com/100'}" class="w-10 h-10 rounded object-cover shadow-sm" />
                    <div class="overflow-hidden">
                        <p class="text-[10px] font-bold text-gray-800 dark:text-gray-200 truncate">${p.name}</p>
                        <p class="text-[9px] text-green-600 font-black">$${Number(p.price).toLocaleString()}</p>
                    </div>
                  </div>
                `).join('') || '<p class="text-xs text-gray-400 italic">Sin productos activos</p>';

                popupContent = `
                  <div class="p-2 min-w-[220px] font-sans">
                    <h3 class="font-black text-indigo-900 dark:text-white border-b border-indigo-100 dark:border-slate-700 mb-2 uppercase italic text-lg leading-tight">${loc.user_name || 'VENDEDOR'}</h3>
                    <p class="text-[11px] text-gray-500 mb-2"><b>Email:</b> ${loc.user_email}</p>
                    
                    <div class="mb-3">
                        <p class="text-[10px] font-bold text-indigo-500 uppercase mb-1 tracking-wider">Catálogo Destacado</p>
                        <div class="max-h-[160px] overflow-y-auto pr-1">
                            ${productsHtml}
                        </div>
                    </div>

                    <div class="flex items-center justify-between border-t border-gray-100 dark:border-slate-700 pt-2 mt-2">
                        <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${loc.user_status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${loc.user_status}</span>
                        <span class="text-[9px] text-gray-400 italic">ShopStarter Admin</span>
                    </div>
                  </div>
                `;
            }

            const marker = L.marker([Number(loc.latitude), Number(loc.longitude)])
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
        leafletMap.current = null;
      }
      clearInterval(checkLeaflet);
    };
  }, [isAdmin]); // 🔥 Re-inicializar si cambia el rol

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
