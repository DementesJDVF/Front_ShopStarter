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
      <div className="bg-gradient-to-r from-[#CFFEFF] to-[#BBADFF] dark:bg-none dark:bg-transparent p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 shadow-sm border border-white/50 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Panel de Gestión - Vendedor</h1>
          <p className="text-slate-600 dark:text-gray-400 mt-1 italic font-medium">[ Funcionalidades completas próximamente ]</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
        <Card className="panel-card !bg-white/60 dark:!bg-gray-800/60 backdrop-blur-xl border-none shadow-xl hover:-translate-y-1 transition-all duration-500">
          <div className="flex items-center gap-5 p-2">
            <div className="p-4 bg-primary/10 text-primary rounded-2xl">
              <HiOutlineCube size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Productos Activos</p>
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
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ubicación de tu Negocio</p>
                {loadingLocation ? (
                  <Spinner size="sm" />
                ) : vendorLocation ? (
                  <p className="text-sm font-bold text-gray-900 dark:text-white break-all">
                    {vendorLocation.lat.toFixed(5)}, {vendorLocation.lng.toFixed(5)}
                  </p>
                ) : (
                  <p className="text-xs text-red-500 font-bold">Sin ubicación asignada</p>
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
                VER EN MAPS
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
                Gestión Inteligente <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2CD4D9] to-[#3A17E4] dark:from-primary dark:to-indigo-500">Próximamente por Papayo</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-6 text-base md:text-lg font-medium leading-relaxed">
                Estamos construyendo el centro de mando más avanzado para tu negocio. 
                Analiza tus ventas con IA, gestiona inventarios en segundos y escala como nunca antes.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
               <Badge color="info" className="px-4 py-2 rounded-full font-black uppercase text-[10px]">Analíticas IA</Badge>
               <Badge color="indigo" className="px-4 py-2 rounded-full font-black uppercase text-[10px]">Inventario Cloud</Badge>
               <Badge color="purple" className="px-4 py-2 rounded-full font-black uppercase text-[10px]">Reportes ERP</Badge>
            </div>
          </div>
        </Card>
      </div>

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