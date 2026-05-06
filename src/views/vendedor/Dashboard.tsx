import { Card, Badge, Button, Modal, Spinner } from "flowbite-react";
import { HiOutlineCube, HiOutlineExternalLink, HiOutlineLocationMarker } from 'react-icons/hi';
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

  useEffect(() => {
    let mounted = true;
    const loadLocation = async () => {
      try {
        if (mounted) setLoadingLocation(true);
        const res = await api.get('geo/locations/');
        const data = res.data.results || res.data;
        const loc = Array.isArray(data) ? data[0] : data;
        
        if (mounted && loc && loc.latitude !== undefined && loc.longitude !== undefined) {
          setVendorLocation({
            lat: parseFloat(loc.latitude),
            lng: parseFloat(loc.longitude),
            description: loc.description
          });
        }
      } catch (err) {
        console.error("Error al cargar ubicación:", err);
      } finally {
        if (mounted) setLoadingLocation(false);
      }
    };
    loadLocation();
    return () => {
      mounted = false;
    };
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

  return (
    <div className="p-6">
      <div className="bg-gradient-to-r from-[#CFFEFF] to-[#BBADFF] dark:bg-none dark:bg-transparent p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-slate-600 dark:text-gray-400 mt-1 italic font-medium">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Button size="sm" color="light" outline onClick={() => setShowLocationModal(true)} className="rounded-xl">
            <HiOutlineLocationMarker className="mr-2 h-4 w-4" />
            {vendorLocation ? t('dashboard.updateLocation') : t('dashboard.setLocation')}
          </Button>
        </div>
      </div>
      
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

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-indigo-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <Card className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-none shadow-2xl p-6 md:p-12 text-center rounded-[2.5rem] overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <div className="w-52 h-52 text-primary/20">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center gap-8">
            <div className="p-6 bg-gradient-to-br from-primary to-indigo-600 rounded-[2rem] shadow-xl transform hover:scale-110 transition duration-500">
              <div className="w-12 h-12 text-white">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
              </div>
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
                setVendorLocation({ lat, lng });
              }}
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="flex justify-end p-2 px-6">
            <Button color="gray" onClick={() => setShowLocationModal(false)}>{t('dashboard.modal.close')}</Button>
            <Button 
              color="primary" 
              onClick={() => handleUpdateLocation(vendorLocation?.lat ?? 0, vendorLocation?.lng ?? 0)}
              disabled={savingLocation || !vendorLocation}
            >
              {savingLocation ? <Spinner size="sm" /> : t('dashboard.modal.save')}
            </Button>
          </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;
