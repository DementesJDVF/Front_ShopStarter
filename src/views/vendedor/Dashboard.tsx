import { Card, Badge, Table, Button, Modal, Spinner } from "flowbite-react";
import { HiOutlineCube, HiOutlineShoppingBag, HiOutlineTrendingUp, HiOutlineExternalLink, HiOutlineLocationMarker } from 'react-icons/hi';
import { Icon } from '@iconify/react';
import { useState, useEffect } from "react";
import api from "../../utils/axios";
import LocationPicker from "../../components/geo/LocationPicker";
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t } = useTranslation('vendedor');
  const [vendorLocation, setVendorLocation] = useState<{lat: number, lng: number, description?: string} | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [isLocationActive, setIsLocationActive] = useState(false);
  const [toggling, setToggling] = useState(false);

  const fetchLocation = async () => {
    try {
      setLoadingLocation(true);
      const res = await api.get('geo/locations/');
      const data = res.data.results || res.data;
      const loc = Array.isArray(data) ? data[0] : data;
      
      if (loc) {
        setVendorLocation({
          lat: parseFloat(loc.latitude),
          lng: parseFloat(loc.longitude),
          description: loc.description
        });
        setIsLocationActive(loc.is_active);
      }
    } catch (err) {
      console.error("Error al cargar ubicación:", err);
    } finally {
      setLoadingLocation(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const handleUpdateLocation = async (lat: number, lng: number) => {
    try {
      setSavingLocation(true);
      await api.post('geo/locations/', {
        latitude: parseFloat(lat.toFixed(6)),
        longitude: parseFloat(lng.toFixed(6)),
        description: "Mi tienda"
      });
      setVendorLocation({ lat, lng });
      setShowLocationModal(false);
      alert(t('dashboard.alert.locationUpdated'));
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data) {
        alert(t('dashboard.alert.backendError') + " " + JSON.stringify(err.response.data));
      } else {
        alert(t('dashboard.alert.networkError') + " " + (err.message || ''));
      }
    } finally {
      setSavingLocation(false);
    }
  };

  const toggleVisibility = async () => {
      try {
          setToggling(true);
          const res = await api.post('geo/locations/toggle_visibility/');
          setIsLocationActive(res.data.is_active);
          alert(res.data.message);
      } catch (err) {
          console.error(err);
      } finally {
          setToggling(false);
      }
  };

  return (
    <div className="p-6">
      <div className="bg-gradient-to-r from-[#CFFEFF] to-[#BBADFF] dark:bg-none dark:bg-transparent p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-slate-600 dark:text-gray-400 mt-1 italic font-medium">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <Button 
                size="sm" 
                color={isLocationActive ? "success" : "failure"} 
                onClick={toggleVisibility}
                disabled={toggling || !vendorLocation}
                className="rounded-xl shadow-md"
            >
                {toggling ? <Spinner size="sm" /> : <Icon icon={isLocationActive ? "solar:map-point-wave-bold" : "solar:map-point-remove-bold"} className="mr-2" />}
                {isLocationActive ? "UBICACIÓN ENCENDIDA" : "UBICACIÓN APAGADA"}
            </Button>
            <Button size="sm" color="light" outline onClick={() => setShowLocationModal(true)} className="rounded-xl">
              <HiOutlineLocationMarker className="mr-2 h-4 w-4" />
              {vendorLocation ? t('dashboard.updateLocation') : t('dashboard.setLocation')}
            </Button>
        </div>
      </div>
      
      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
        <Card className="panel-card !bg-white/60 dark:!bg-gray-800/60 backdrop-blur-xl border-none shadow-xl hover:-translate-y-1 transition-all duration-500">
          <div className="flex items-center gap-5 p-2">
            <div className="p-4 bg-primary/10 text-primary rounded-2xl">
              <HiOutlineCube size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('dashboard.productsActive')}</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white">12</p>
            </div>
          </div>
        </Card>

        {/* Info card de ubicación actual */}
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-gray-100 dark:border-gray-700 shadow-sm rounded-3xl sm:col-span-2 xl:col-span-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-2">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl">
                <HiOutlineLocationMarker size={28} />
              </div>
              <div className="flex flex-col">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('dashboard.locationTitle')}</p>
                {loadingLocation ? (
                  <Spinner size="sm" />
                ) : vendorLocation ? (
                  <p className="text-sm font-bold text-gray-900 dark:text-white break-all">
                    {vendorLocation.lat.toFixed(5)}, {vendorLocation.lng.toFixed(5)}
                  </p>
                ) : (
                  <p className="text-xs text-red-500 font-bold">{t('dashboard.noLocation')}</p>
                )}
              </div>
            </div>
            {vendorLocation && (
              <a 
                href={`https://www.google.com/maps?q=${vendorLocation.lat},${vendorLocation.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-black hover:bg-primary/20 transition"
              >
                {t('dashboard.viewInMaps')}
                <HiOutlineExternalLink />
              </a>
            )}
          </div>
        </Card>
      </div>

      {/* Dashboard Placeholder - Próximamente por Papayo */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-indigo-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <Card className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-none shadow-2xl p-6 md:p-12 text-center rounded-[2.5rem] overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <Icon icon="solar:chart-square-bold-duotone" width={200} />
          </div>
          
          <div className="relative z-10 flex flex-col items-center gap-8">
            <div className="p-6 bg-gradient-to-br from-primary to-indigo-600 rounded-[2rem] shadow-xl transform hover:scale-110 transition duration-500">
              <Icon icon="solar:widget-bold-duotone" className="text-white" height={48} />
            </div>
            <div className="max-w-xl">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic leading-none break-words">
                {t('dashboard.heading.line1')} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2CD4D9] to-[#3A17E4] dark:from-primary dark:to-indigo-500">{t('dashboard.heading.line2')}</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-6 text-base md:text-lg font-medium leading-relaxed">
                {t('dashboard.description')}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
               <Badge color="info" className="px-4 py-2 rounded-full font-black uppercase text-[10px]">{t('dashboard.badge.analytics')}</Badge>
               <Badge color="indigo" className="px-4 py-2 rounded-full font-black uppercase text-[10px]">{t('dashboard.badge.inventory')}</Badge>
               <Badge color="purple" className="px-4 py-2 rounded-full font-black uppercase text-[10px]">{t('dashboard.badge.reports')}</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal para elegir ubicación */}
      <Modal show={showLocationModal} onClose={() => setShowLocationModal(false)} size="lg">
        <Modal.Header>{t('dashboard.modal.title')}</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              {t('dashboard.modal.description')}
            </p>
            <LocationPicker 
              initialLat={vendorLocation?.lat} 
              initialLng={vendorLocation?.lng}
              onLocationSelected={(lat, lng) => {
                 // Guardamos temporalmente si queremos, o simplemente permitimos al botón de acción llamar el update
                 // Para simplicidad, pasamos la posición al botón de "Guardar"
                 setVendorLocation({ lat, lng });
              }}
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="flex justify-end p-2 px-6">
           <Button color="gray" onClick={() => setShowLocationModal(false)}>{t('dashboard.modal.close')}</Button>
           <Button 
              color="primary" 
              onClick={() => handleUpdateLocation(vendorLocation?.lat || 2.4419, vendorLocation?.lng || -76.6062)}
              disabled={savingLocation}
            >
              {savingLocation ? <Spinner size="sm" /> : t('dashboard.modal.save')}
           </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;