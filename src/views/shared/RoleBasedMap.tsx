import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Card, Badge, Spinner, Button, Modal, Label, TextInput } from 'flowbite-react';
import { Icon } from '@iconify/react';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import { useMap } from '../../context/MapContext';
import { toast } from 'react-hot-toast';
import VendorCatalogModal from '../../components/geo/VendorCatalogModal';
import { useTranslation } from 'react-i18next';

declare global {
  interface Window {
    _openVendorCatalog: (vendorId: string, vendorName: string) => void;
    _tracePath: (destLat: number, destLng: number) => void;
    _reserveProduct: (productId: string | number, productName: string) => void;
    _stopRouting: () => void;
  }
}

const RoleBasedMap: React.FC = () => {
  const { user } = useAuth();
  const { userLocation, requestLocation, gettingLocation } = useMap();
  const location = useLocation();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const routingControl = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRoutingActive, setIsRoutingActive] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [isLocationActive, setIsLocationActive] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{lat: number, lng: number} | null>(null);
  const [locationDescription, setLocationDescription] = useState('');
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<{id: string, name: string} | null>(null);

  const vendorFilterId = (location.state as any)?.vendorId || null;

  const buildPopupContent = (loc: any, L: any) => {
    const isClient = user?.role === 'CLIENTE';
    const isAdmin = user?.role === 'ADMIN';

    let catalogSection = '';
    if (loc.products && loc.products.length > 0) {
      const productsHtml = loc.products.map((p: any) => {
        const reservaBtn = isClient
          ? `<button onclick="window._reserveProduct(${p.id}, '${String(p.name || '').replace(/'/g, "\\'")}')" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-1.5 px-2 rounded-lg mt-1 transition-all">Reservar</button>`
          : `<span class="text-[10px] text-gray-500 block mt-1">$${Number(p.price).toLocaleString()}</span>`;
        return `
          <div class="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-lg p-1 border border-gray-100 dark:border-slate-700 mb-1">
            <img src="${p.image || 'https://via.placeholder.com/100'}" class="w-8 h-8 rounded object-cover" onerror="this.src='https://via.placeholder.com/100'" />
            <div class="overflow-hidden flex-1 min-w-0">
              <p class="text-[9px] font-bold text-gray-800 dark:text-gray-200 truncate">${p.name || 'Sin nombre'}</p>
              <p class="text-[8px] text-green-600 font-bold">$${Number(p.price).toLocaleString()}</p>
              ${reservaBtn ? `<div class="mt-1">${reservaBtn}</div>` : ''}
            </div>
          </div>
        `;
      }).join('');
      catalogSection = `
        <div class="mb-2">
          <p class="text-[9px] text-gray-400 uppercase font-bold mb-1">Catalogo</p>
          <div class="max-h-[140px] overflow-y-auto pr-1 space-y-1">${productsHtml}</div>
        </div>
      `;
    }

    const adminInfo = isAdmin && loc.user_email ? `<p class="text-[9px] text-red-400 mb-1">Owner: ${loc.user_email}</p>` : '';
    const routeBtn = !isAdmin && user?.role !== 'VENDEDOR' && userLocation && !vendorFilterId
      ? `<button onclick="window._tracePath(${loc.latitude}, ${loc.longitude})" class="w-full bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1">
           <i class='material-icons' style="font-size:12px">route</i> TRAZAR CAMINO
         </button>`
      : '';
    const catalogBtn = (loc.products && loc.products.length > 0)
      ? `<button onclick="window._openVendorCatalog('${loc.user}', '${String(loc.user_name || 'Vendedor').replace(/'/g, "\\'")}')" class="w-full bg-primary hover:bg-primary/90 text-white text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1">
           <i class='material-icons' style="font-size:12px">store</i> VER CATALOGO
         </button>`
      : '';

    return `
      <div class="p-2 min-w-[180px] font-sans">
        ${adminInfo}
        <h3 class="font-black text-indigo-900 dark:text-white text-sm mb-1">${loc.user_name || 'Vendedor'}</h3>
        <p class="text-[10px] text-gray-500 line-clamp-2 mb-2">${loc.description || 'Sin descripcion'}</p>
        ${catalogSection}
        <div class="flex flex-col gap-1">${catalogBtn}${routeBtn}</div>
      </div>
    `;
  };

  const initMap = () => {
    const L = (window as any).L;
    if (!L) return;

    if (leafletMap.current) {
      try { leafletMap.current.off(); leafletMap.current.remove(); } catch(e){}
      leafletMap.current = null;
    }
    if (mapRef.current) {
      mapRef.current.innerHTML = '';
      mapRef.current.className = mapRef.current.className.split(' ').filter((c: string) => !c.startsWith('leaflet-')).join(' ').trim();
    }

    leafletMap.current = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([2.4419, -76.6062], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OSM' }).addTo(leafletMap.current);

    window._openVendorCatalog = (vendorId: string, vendorName: string) => {
      setSelectedVendor({ id: vendorId, name: vendorName });
      setIsCatalogModalOpen(true);
    };
    window._tracePath = (destLat: number, destLng: number) => {
      if (!L || !leafletMap.current || !userLocation) { toast.error("Activa tu ubicacion primero"); return; }
      if (routingControl.current) leafletMap.current.removeControl(routingControl.current);
      routingControl.current = L.Routing.control({
        waypoints: [L.latLng(userLocation.lat, userLocation.lng), L.latLng(destLat, destLng)],
        lineOptions: { styles: [{ color: '#6366f1', weight: 6, opacity: 0.8 }] },
        addWaypoints: false, draggableWaypoints: false, fitSelectedRoutes: true, showAlternatives: false, language: 'es'
      }).addTo(leafletMap.current);
      setIsRoutingActive(true);
    };
    window._reserveProduct = async (productId: string | number, productName: string) => {
      if (!window.confirm(`Reservar "${productName}"?`)) return;
      try {
        await api.post('orders/', { product: productId });
        toast.success('Reserva creada!');
        const L = (window as any).L;
        if (L) fetchAndRenderMarkers(L);
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Error al reservar');
      }
    };
    window._stopRouting = () => {
      if (routingControl.current && leafletMap.current) {
        leafletMap.current.removeControl(routingControl.current);
        routingControl.current = null; setIsRoutingActive(false);
        toast.success("Navegacion finalizada");
      }
    };

    navigator.geolocation.getCurrentPosition((pos) => {
      L.circleMarker([pos.coords.latitude, pos.coords.longitude], {
        radius: 8, fillColor: "#3b82f6", color: "white", weight: 2, opacity: 1, fillOpacity: 0.8
      }).addTo(leafletMap.current).bindPopup("Tu ubicacion");
      leafletMap.current.setView([pos.coords.latitude, pos.coords.longitude], 15);
    }, () => leafletMap.current.setView([2.4419, -76.6062], 13));

    fetchAndRenderMarkers(L);
  };

  const fetchAndRenderMarkers = async (L: any) => {
    try {
      setLoading(true);
      let endpoint = user?.role === 'VENDEDOR' ? 'geo/my-locations/' : user?.role === 'ADMIN' ? 'geo/locations/all_locations/' : 'geo/vendors-locations/';
      const res = await api.get(endpoint);
      const payload = res.data;
      const allLocations: any[] = Array.isArray(payload?.results) ? payload.results : Array.isArray(payload) ? payload : [];

      const visibleLocations = vendorFilterId
        ? allLocations.filter((loc: any) => loc && String(loc.vendor_id || loc.user) === String(vendorFilterId))
        : allLocations;

      setLocations(visibleLocations);
      if (!leafletMap.current) return;

      leafletMap.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) leafletMap.current.removeLayer(layer);
      });

      const markers: any[] = [];
      visibleLocations.forEach((loc: any) => {
        if (!loc?.latitude || !loc?.longitude || loc.is_active === false) return;
        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: '<div class="marker-pin"></div><i class="material-icons" style="color:#2563eb">shop</i>',
          iconSize: [30, 42], iconAnchor: [15, 42]
        });
        const m = L.marker([loc.latitude, loc.longitude], { icon }).addTo(leafletMap.current).bindPopup(buildPopupContent(loc, L));
        markers.push(m);
      });

      if (markers.length > 0) {
        leafletMap.current.fitBounds(L.featureGroup(markers).getBounds().pad(0.2));
      }
    } catch (error) {
      console.error("Error marcadores", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAndInit = () => {
      if ((window as any).L && mapRef.current) {
        initMap();
      } else {
        setTimeout(checkAndInit, 50);
      }
    };
    const timer = setTimeout(checkAndInit, 100);

    return () => {
      clearTimeout(timer);
      if (leafletMap.current) {
        try { leafletMap.current.eachLayer((l: any) => leafletMap.current.removeLayer(l)); leafletMap.current.remove(); } catch(e){}
        leafletMap.current = null;
      }
      if (mapRef.current) mapRef.current.innerHTML = '';
    };
  }, [user?.role, vendorFilterId]);

  useEffect(() => {
    if (user?.role === 'VENDEDOR') {
      api.get('geo/my-locations/').then(res => {
        const data = res.data.results || res.data;
        const loc = Array.isArray(data) ? data[0] : data;
        if (loc) setIsLocationActive(loc.is_active);
      }).catch(() => {});
    }
  }, [user]);

  const toggleVisibility = async () => {
    try {
      setToggling(true);
      const res = await api.post('geo/locations/toggle_visibility/');
      setIsLocationActive(res.data.is_active);
      toast.success(res.data.message);
      const L = (window as any).L;
      if (L) fetchAndRenderMarkers(L);
    } catch {
      toast.error("Error al cambiar visibilidad");
    } finally {
      setToggling(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!selectedPosition) return;
    try {
      await api.post('geo/locations/', {
        latitude: selectedPosition.lat,
        longitude: selectedPosition.lng,
        description: locationDescription
      });
      toast.success('Ubicacion guardada');
      setIsEditModalOpen(false);
      setLocationDescription('');
      const L = (window as any).L;
      if (L) fetchAndRenderMarkers(L);
    } catch {
      toast.error('Error al guardar');
    }
  };

  const { t } = useTranslation('map');

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      {vendorFilterId && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center gap-2 text-primary">
          <Icon icon="solar:shop-bold" height={20} />
          <span className="text-sm font-bold">Modo: Catalogo exclusivo del vendedor</span>
          <button onClick={() => navigate(-1)} className="ml-auto text-xs underline hover:no-underline">Salir</button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
            {t('title', { 1: '<span class="text-primary">', '/1': '</span>' })}
          </h1>
          <p className="text-sm text-gray-500">
            {user?.role === 'VENDEDOR' ? t('desc_vendedor') : t('desc_otro')}
          </p>
        </div>
      </div>

      <Card className="flex-1 min-h-[500px] overflow-hidden p-0 relative border-0 shadow-2xl rounded-3xl">
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 items-end">
          <div className="flex gap-2">
            {user?.role === 'VENDEDOR' ? (
              <Button color={isLocationActive ? "success" : "failure"} size="sm" onClick={toggleVisibility}
                disabled={toggling} className="rounded-xl shadow-2xl border-2 border-white/80 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  {toggling ? <Spinner size="sm"/> : <Icon icon={isLocationActive ? "solar:map-point-wave-bold" : "solar:map-point-remove-bold"} height={20}/>}
                  <span className="font-bold italic text-[10px]">{isLocationActive ? "ENCENDIDA" : "APAGADA"}</span>
                </div>
              </Button>
            ) : (
              <Button color={userLocation ? "success" : "primary"} size="sm" onClick={requestLocation}
                disabled={gettingLocation} className="rounded-xl shadow-2xl border-2 border-white/80 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  {gettingLocation ? <Spinner size="sm"/> : <Icon icon="solar:map-point-wave-linear" height={20}/>}
                  <span className="font-bold text-[10px]">{userLocation ? "ACTUALIZAR" : "MI UBICACION"}</span>
                </div>
              </Button>
            )}
          </div>
          <Badge color="primary" icon={() => <Icon icon="solar:map-point-bold-duotone" className="mr-1" />} className="px-3 py-1 shadow-lg border border-white/20 backdrop-blur-md text-[10px]">
            {t('view', { role: user?.role })}
          </Badge>
        </div>

        {loading && (
          <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <Spinner size="xl" />
          </div>
        )}
        <div ref={mapRef} className="w-full h-full min-h-[500px] z-10 rounded-3xl" />

        {isRoutingActive && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
            <Button color="failure" size="xl" onClick={() => { (window as any)._stopRouting(); setIsRoutingActive(false); }}
              className="rounded-full shadow-2xl font-black flex items-center gap-2 border-4 border-white text-sm">
              <Icon icon="solar:stop-circle-bold-duotone" className="text-2xl mr-2" />
              DETENER NAVEGACION
            </Button>
          </div>
        )}
      </Card>

      <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} size="md">
        <Modal.Header>{t('modal_nueva_ubicacion')}</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div className="flex gap-4 p-3 bg-gray-50 rounded-xl items-center border border-gray-100">
              <Icon icon="solar:map-point-wave-bold-duotone" className="text-primary" height={24} />
              <div>
                <p className="text-xs font-bold text-gray-700">{t('coordenadas')}</p>
                <p className="text-[10px] text-gray-400">
                  {t('latlng', { lat: selectedPosition?.lat?.toFixed(6), lng: selectedPosition?.lng?.toFixed(6) })}
                </p>
              </div>
            </div>
            <div>
              <Label value={t('desc_lugar')} />
              <TextInput placeholder={t('placeholder_desc')} value={locationDescription}
                onChange={(e) => setLocationDescription(e.target.value)} />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="primary" onClick={handleSaveLocation} disabled={!locationDescription}>{t('guardar_punto')}</Button>
          <Button color="gray" onClick={() => setIsEditModalOpen(false)}>{t('cancelar')}</Button>
        </Modal.Footer>
      </Modal>

      <VendorCatalogModal isOpen={isCatalogModalOpen} onClose={() => setIsCatalogModalOpen(false)}
        vendorId={selectedVendor?.id || null} vendorName={selectedVendor?.name} />
    </div>
  );
};

export default RoleBasedMap;
