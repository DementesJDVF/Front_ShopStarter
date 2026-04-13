import { Card, Badge, Table, Button, Modal, Spinner } from "flowbite-react";
import { HiOutlineCube, HiOutlineShoppingBag, HiOutlineTrendingUp, HiOutlineExternalLink, HiOutlineLocationMarker } from 'react-icons/hi';
import { Icon } from '@iconify/react';
import { useState, useEffect } from "react";
import api from "../../utils/axios";
import LocationPicker from "../../components/geo/LocationPicker";

const Dashboard = () => {
  const [vendorLocation, setVendorLocation] = useState<{lat: number, lng: number, description?: string} | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);

  const fetchLocation = async () => {
    try {
      setLoadingLocation(true);
      const res = await api.get('geo/locations/');
      // Buscamos nuestra propia locación (el API suele filtrar por usuario autenticado en el backend)
      // Si el API devuelve lista, tomamos el primero
      const loc = Array.isArray(res.data) ? res.data[0] : res.data;
      if (loc && loc.latitude) {
        setVendorLocation({
          lat: parseFloat(loc.latitude),
          lng: parseFloat(loc.longitude),
          description: loc.description
        });
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
      alert("¡Ubicación actualizada con éxito!");
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data) {
        alert("Error Backend: " + JSON.stringify(err.response.data));
      } else {
        alert("Error Red o Interno: " + err.message);
      }
    } finally {
      setSavingLocation(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Panel de Gestión - Vendedor</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 italic">[ Funcionalidades completas próximamente ]</p>
        </div>
        <div className="flex gap-2">
            <Badge color="success" size="lg" className="px-4 py-2">Estado: Activo</Badge>
            <Button size="sm" color="light" outline onClick={() => setShowLocationModal(true)}>
              <HiOutlineLocationMarker className="mr-2 h-4 w-4" />
              {vendorLocation ? "Actualizar Ubicación" : "Establecer Ubicación"}
            </Button>
        </div>
      </div>
      
      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-primary/5 dark:bg-primary/10 border-none shadow-none">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-primary text-white rounded-xl shadow-md">
              <HiOutlineCube size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Productos Activos</p>
              <p className="text-3xl font-bold text-dark dark:text-white">12</p>
            </div>
          </div>
        </Card>

        {/* Info card de ubicación actual */}
        <Card className="bg-orange-50 dark:bg-orange-900/10 border-none shadow-none col-span-1 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5 text-left">
              <div className="p-4 bg-orange-500 text-white rounded-xl shadow-md">
                <HiOutlineLocationMarker size={28} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-500 text-left">Ubicación de tu Negocio</p>
                {loadingLocation ? (
                  <Spinner size="sm" />
                ) : vendorLocation ? (
                  <p className="text-xs font-bold text-dark dark:text-white text-left break-all">
                    {vendorLocation.lat.toFixed(5)}, {vendorLocation.lng.toFixed(5)}
                  </p>
                ) : (
                  <p className="text-xs text-red-500 text-left">Aún no has fijado tu ubicación en el mapa.</p>
                )}
              </div>
            </div>
            {vendorLocation && (
              <a 
                href={`https://www.google.com/maps?q=${vendorLocation.lat},${vendorLocation.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-xs font-bold hover:underline"
              >
                Ver en Maps
              </a>
            )}
          </div>
        </Card>
      </div>

      {/* Dashboard Placeholder - Próximamente por Papayo */}
      <Card className="bg-gradient-to-br from-primary/10 to-indigo-500/10 border-none shadow-xl p-12 text-center overflow-hidden relative">
        <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="p-6 bg-white dark:bg-dark-light rounded-3xl shadow-2xl scale-110">
            <Icon icon="solar:chart-square-bold-duotone" className="text-primary" height={64} />
          </div>
          <div className="max-w-md">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">
              Próximamente <span className="text-primary italic">por Papayo</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg font-medium">
              Estamos preparando un centro de mando avanzado para gestionar tus pedidos, 
              ver analíticas en tiempo real y optimizar tu negocio. ¡Mantente atento!
            </p>
          </div>
          <div className="flex gap-4 mt-4">
             <Badge color="info" size="xl" className="font-bold">Analíticas Avanzadas</Badge>
             <Badge color="indigo" size="xl" className="font-bold">IA Predictiva</Badge>
             <Badge color="purple" size="xl" className="font-bold">Gestión ERP</Badge>
          </div>
        </div>
      </Card>

      {/* Modal para elegir ubicación */}
      <Modal show={showLocationModal} onClose={() => setShowLocationModal(false)} size="lg">
        <Modal.Header>Fijar Ubicación del Negocio</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Usa el mapa para marcar el punto exacto donde se encuentra tu tienda física. Esto permitirá que los clientes cercanos te encuentren.
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
           <Button color="gray" onClick={() => setShowLocationModal(false)}>Cerrar</Button>
           <Button 
              color="primary" 
              onClick={() => handleUpdateLocation(vendorLocation?.lat || 2.4419, vendorLocation?.lng || -76.6062)}
              disabled={savingLocation}
            >
              {savingLocation ? <Spinner size="sm" /> : "Guardar Ubicación"}
           </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;
