import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import api from '../../utils/axios';
import { Spinner } from 'flowbite-react';
import { useMap } from '../../context/MapContext';
import { Icon } from '@iconify/react';

interface VendorMapProps {
  isAdmin?: boolean;
  vendorId?: string | null;
  showCatalog?: boolean;
}

const VendorMap: React.FC<VendorMapProps> = ({ isAdmin = false, vendorId: propVendorId = null, showCatalog = true }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const routingLayer = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const { userLocation } = useMap();
  const location = useLocation();

  const vendorFilterId = (location.state as any)?.vendorId || propVendorId;

  const initMap = () => {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    if (leafletMap.current) {
      leafletMap.current.remove();
    }

    leafletMap.current = L.map(mapRef.current, { zoomControl: false }).setView([2.4419, -76.6062], 13);
    L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(leafletMap.current);

    const loadLocations = async () => {
      try {
        setLoading(true);
        const endpoint = isAdmin ? 'geo/locations/all_locations/' : 'geo/vendors-locations/';
        const response = await api.get(endpoint);
        const data = response.data.results || response.data;
        const locations = Array.isArray(data) ? data : [];

        if (userLocation) {
          const userIcon = L.divIcon({
            className: 'custom-div-icon',
            html: '<div style="background-color: #3b82f6; width: 15px; height: 15px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>',
            iconSize: [15, 15],
            iconAnchor: [7, 7]
          });
          L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
            .addTo(leafletMap.current)
            .bindPopup('<b>Tú estás aquí</b>');
        }

        const markers: any[] = [];
        locations.forEach((loc: any) => {
          if (loc.latitude && loc.longitude) {
            if (vendorFilterId && String(loc.vendor_id || loc.user) !== String(vendorFilterId)) {
              return;
            }

            let popupContent = `<b>${loc.description || loc.vendor_name || 'Vendedor'}</b>`;

            if (isAdmin && loc.products) {
              const productsHtml = loc.products.map((p: any) => `
                <div class="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-lg p-1 border border-gray-100 dark:border-slate-700 mb-1">
                  <img src="${p.image || 'https://via.placeholder.com/100'}" class="w-10 h-10 rounded object-cover shadow-sm" />
                  <div class="overflow-hidden">
                    <p class="text-[10px] font-bold text-gray-800 dark:text-gray-200 truncate">${p.name}</p>
                    <p class="text-[9px] text-green-600 font-black">$${Number(p.price).toLocaleString()}</p>
                  </div>
                </div>
              `).join('') || '<p class="text-xs text-gray-400 italic">Sin productos</p>';

              popupContent = `
                <div class="p-2 min-w-[220px] font-sans">
                  <h3 class="font-black text-indigo-900 dark:text-white border-b border-indigo-100 dark:border-slate-700 mb-2 uppercase text-lg">${loc.user_name || 'VENDEDOR'}</h3>
                  <p class="text-[11px] text-gray-500 mb-2"><b>Email:</b> ${loc.user_email}</p>
                  <div class="mb-2">
                    <p class="text-[10px] font-bold text-indigo-500 uppercase mb-1">Catálogo</p>
                    <div class="max-h-[160px] overflow-y-auto">${productsHtml}</div>
                  </div>
                  <div class="flex items-center justify-between border-t border-gray-100 dark:border-slate-700 pt-2">
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${loc.user_status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${loc.user_status}</span>
                  </div>
                </div>
              `;
            } else if (showCatalog && loc.products) {
              const productsHtml = loc.products.map((p: any) => `
                <div class="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-lg p-1 border border-gray-100 dark:border-slate-700 mb-1">
                  <img src="${p.image || 'https://via.placeholder.com/100'}" class="w-8 h-8 rounded object-cover" />
                  <div class="overflow-hidden flex-1">
                    <p class="text-[10px] font-bold text-gray-800 dark:text-gray-200 truncate">${p.name}</p>
                    <p class="text-[9px] text-green-600 font-black">$${Number(p.price).toLocaleString()}</p>
                  </div>
                </div>
              `).join('') || '<p class="text-xs text-gray-400 italic">Sin productos</p>';

              popupContent = `
                <div class="p-2 min-w-[200px] font-sans">
                  <h3 class="font-black text-indigo-900 dark:text-white border-b border-indigo-100 dark:border-slate-700 mb-2 text-base">${loc.vendor_name || 'Vendedor'}</h3>
                  <div class="mb-1">
                    <p class="text-[9px] text-gray-400 uppercase">Catálogo</p>
                    <div class="max-h-[180px] overflow-y-auto">${productsHtml}</div>
                  </div>
                </div>
              `;
            }

            const marker = L.marker([Number(loc.latitude), Number(loc.longitude)])
              .addTo(leafletMap.current)
              .bindPopup(popupContent);

            marker.on('click', () => {
              if (userLocation && !isAdmin) {
                if (routingLayer.current) leafletMap.current.removeLayer(routingLayer.current);
                routingLayer.current = L.polyline([
                  [userLocation.lat, userLocation.lng],
                  [Number(loc.latitude), Number(loc.longitude)]
                ], {
                  color: '#6366f1',
                  weight: 5,
                  opacity: 0.7,
                  dashArray: '10, 10',
                  lineCap: 'round'
                }).addTo(leafletMap.current);
                leafletMap.current.fitBounds(routingLayer.current.getBounds().pad(0.2));
              }
            });

            markers.push(marker);
          }
        });

        if (markers.length > 0) {
          const group = L.featureGroup(markers);
          leafletMap.current.fitBounds(group.getBounds().pad(0.1));
        } else if (vendorFilterId) {
          const infoDiv = L.control({ position: 'topleft' });
          infoDiv.onAdd = () => {
            const div = L.DomUtil.create('div', '');
            div.innerHTML = '<div class="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 m-2 shadow"><p class="text-xs font-bold text-yellow-700">Vendedor no encontrado</p></div>';
            return div;
          };
          infoDiv.addTo(leafletMap.current);
        }
      } catch (error) {
        console.error('Error al cargar ubicaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  };

  useEffect(() => {
    const checkLeaflet = setInterval(() => {
      if ((window as any).L) {
        clearInterval(checkLeaflet);
        initMap();
      }
    }, 100);

    return () => {
      clearInterval(checkLeaflet);
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [isAdmin, userLocation, vendorFilterId]);

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
