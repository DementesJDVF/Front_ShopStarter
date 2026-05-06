import React, { useEffect, useRef, useState } from 'react';
import api from '../../utils/axios';
import { Spinner } from 'flowbite-react';
import { useMap } from '../../context/MapContext';

interface VendorMapProps {
  isAdmin?: boolean;
}

const VendorMap: React.FC<VendorMapProps> = ({ isAdmin = false }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const routingLayer = useRef<any>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const markersRef = useRef<{ [key: string]: any }>({});

  const [loading, setLoading] = useState(true);
  const { userLocation } = useMap();

  const initMap = async () => {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    if (leafletMap.current) {
      leafletMap.current.remove();
    }

    leafletMap.current = L.map(mapRef.current).setView([2.4419, -76.6062], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(leafletMap.current);

    try {
      setLoading(true);

      const endpoint = isAdmin
        ? 'geo/locations/all_locations/'
        : 'geo/vendors-locations/';

      const response = await api.get(endpoint);
      const data = response.data.results || response.data;
      const locations = Array.isArray(data) ? data : [];

      locations.forEach((loc: any) => {
        if (loc.latitude && loc.longitude) {

          let popupContent = `<b>${loc.description || loc.vendor_name || 'Vendedor'}</b>`;

          // 🔥 ADMIN → POPUP COMPLETO COMO EL ORIGINAL
          if (isAdmin) {
            const productsHtml = loc.products?.map((p: any) => `
              <div class="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border mb-1">
                <img src="${p.image || 'https://via.placeholder.com/100'}" class="w-10 h-10 rounded object-cover" />
                <div>
                  <p class="text-xs font-bold">${p.name}</p>
                  <p class="text-xs text-green-600 font-black">$${Number(p.price).toLocaleString()}</p>
                </div>
              </div>
            `).join('') || '<p class="text-xs text-gray-400">Sin productos</p>';

            popupContent = `
              <div class="p-2 min-w-[220px]">
                <h3 class="font-bold text-lg">${loc.user_name || 'VENDEDOR'}</h3>

                <p class="text-xs text-gray-500 mb-1">
                  <b>Email:</b> ${loc.user_email || 'No disponible'}
                </p>

                <span class="px-2 py-1 text-[10px] font-bold rounded 
                  ${loc.user_status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                  ${loc.user_status || 'UNKNOWN'}
                </span>

                <div class="mt-2 max-h-[120px] overflow-y-auto">
                  ${productsHtml}
                </div>
              </div>
            `;
          }

          const userId = loc.user || loc.id;

          const marker = L.marker([Number(loc.latitude), Number(loc.longitude)])
            .addTo(leafletMap.current)
            .bindPopup(popupContent);

          markersRef.current[userId] = marker;

          // 🔥 CAMINO (cuando haces click)
          marker.on('click', () => {
            if (userLocation && !isAdmin) {
              if (routingLayer.current) {
                leafletMap.current.removeLayer(routingLayer.current);
              }

              routingLayer.current = L.polyline([
                [userLocation.lat, userLocation.lng],
                [Number(loc.latitude), Number(loc.longitude)]
              ], {
                color: '#6366f1',
                weight: 5,
                dashArray: '10, 10'
              }).addTo(leafletMap.current);
            }
          });
        }
      });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 🔌 WebSocket conexión
  useEffect(() => {
    socketRef.current = new WebSocket("ws://localhost:8000/ws/location/");

    return () => socketRef.current?.close();
  }, []);

  // 🗺️ Init mapa
  useEffect(() => {
    const check = setInterval(() => {
      if ((window as any).L) {
        clearInterval(check);
        initMap();
      }
    }, 100);

    return () => clearInterval(check);
  }, [isAdmin]);

  // 📤 VENDEDOR ENVÍA UBICACIÓN
  useEffect(() => {
    if (isAdmin) return;

    navigator.geolocation.watchPosition((pos) => {
      socketRef.current?.send(JSON.stringify({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        userId: "vendor1"
      }));
    });
  }, [isAdmin]);

  // 📥 ADMIN RECIBE Y MUEVE
  useEffect(() => {
    if (!isAdmin) return;

    socketRef.current!.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { lat, lng, userId } = data;

      const L = (window as any).L;
      if (!leafletMap.current || !L) return;

      if (markersRef.current[userId]) {
        markersRef.current[userId].setLatLng([lat, lng]);
      }
    };
  }, [isAdmin]);

  // 🧪 SIMULACIÓN (por si no tienes backend)
  useEffect(() => {
    if (!isAdmin) return;

    const interval = setInterval(() => {
      Object.values(markersRef.current).forEach((marker: any) => {
        const pos = marker.getLatLng();

        marker.setLatLng([
          pos.lat + (Math.random() - 0.5) * 0.001,
          pos.lng + (Math.random() - 0.5) * 0.001
        ]);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isAdmin]);

  return (
    <div className="w-full h-full min-h-[500px]">
      {loading && <Spinner />}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default VendorMap;