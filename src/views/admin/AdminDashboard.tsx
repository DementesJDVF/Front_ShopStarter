import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Table, Button, Select, Badge, Modal, Label, TextInput } from 'flowbite-react';
import { HiUserCircle, HiCheck, HiX, HiLightningBolt } from 'react-icons/hi';
import { MdOutlinePendingActions, MdSecurity } from 'react-icons/md';
import { Icon } from '@iconify/react';
import api from '../../utils/axios';
import CategoryComponent from '../../components/categorias/category';
import ImagePreviewModal from '../../components/shared/ImagePreviewModal';
import UnauthorizedScreen from '../../components/shared/UnauthorizedScreen';
import { useAuth } from '../../context/AuthContext';

// Importaciones del tablero analítico (Colaborador)
import { RevenueForecast } from 'src/components/dashboard/RevenueForecast';
import TotalIncome from 'src/components/dashboard/TotalIncome';
import NewCustomers from 'src/components/dashboard/NewCustomers';
import ProductRevenue from 'src/components/dashboard/ProductRevenue';
import DailyActivity from 'src/components/dashboard/DailyActivity';
import BlogCards from 'src/components/dashboard/BlogCards';

interface ProductImage {
  url_image: string;
}

interface PendingProduct {
  id: string;
  name: string;
  price: string;
  category_name?: string;
  vendor_name?: string;
  vendor?: string;
  images?: ProductImage[];
}

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  status: string;
  is_active: boolean;
}

interface AuditLog {
  id: string;
  action_type: string;
  object_repr: string;
  timestamp: string;
  ip_address: string;
  is_suspicious: boolean;
  new_data: any;
}

const TableSkeleton = () => (
    <div className="animate-pulse space-y-4 py-4">
        {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-gray-200/50 dark:bg-slate-800/50 rounded-xl"></div>
        ))}
    </div>
);

const AdminDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState(0);

  const [users, setUsers] = useState<User[]>([]);
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);

  // --- SEGURIDAD: CONTROL DE ACCESO ---
  // Muestra pantalla de acceso denegado si el usuario no es ADMIN.
  // No redirigimos silenciosamente: el usuario verá exactamente por qué no puede entrar.
  if (!authLoading && !user) {
    return <UnauthorizedScreen code={401} />;
  }
  if (!authLoading && user && user.role !== 'ADMIN') {
    return <UnauthorizedScreen code={403} message="Esta sección es exclusiva para Administradores del sistema." />;
  }

  // --- NAVEGACIÓN INTELIGENTE ---
  // Mantiene la pestaña correcta activa basándose en la URL actual.
  // Así, si refrescas la página en "Usuarios", volverás exactamente a donde estabas.
  useEffect(() => {
    if (location.pathname.includes('usuarios')) setCurrentView(2);
    else if (location.pathname.includes('categorias')) setCurrentView(1);
    else if (location.pathname.includes('productos/aprobar')) setCurrentView(3);
    else if (location.pathname.includes('seguridad')) setCurrentView(4);
    else setCurrentView(0); // Resumen inicial
  }, [location.pathname]);
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingProductId, setRejectingProductId] = useState<string | null>(null);
  const [rejectionComment, setRejectionComment] = useState('');

  // Abre el visor de imágenes para ver los productos en detalle antes de aprobarlos.
  const openPreview = (url: string, title: string) => {
    setPreviewUrl(url);
    setPreviewTitle(title);
    setIsPreviewOpen(true);
  };

  // Prepara el modal de rechazo para un producto específico.
  const openRejectModal = (productId: string) => {
    setRejectingProductId(productId);
    setIsRejectModalOpen(true);
  };

  // --- GESTIÓN DE USUARIOS ---
  // Trae la lista completa de personas registradas para que puedas gestionar sus permisos.
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('users/list/');
      setUsers(res.data);
    } catch (err) {
      console.error("Error al cargar usuarios", err);
    } finally {
      setLoading(false);
    }
  };

  // --- CONTROL DE CALIDAD (Moderación) ---
  // Busca todos los productos que los vendedores han subido y que aún no han sido aprobados.
  const fetchPendingProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('products/create/?status=PENDING');
      const data = res.data.results || res.data;
setPendingProducts(data as PendingProduct[]);
    } catch (err) {
      console.error("Error al cargar productos pendientes", err);
    } finally {
        setLoading(false);
    }
  };

  // --- MONITOREO DE CIBERSEGURIDAD ---
  // Esta es la "Caja Negra" del sistema. Trae los logs que el servidor marcó como sospechosos
  // (ataques de bots, inyecciones XSS, etc.) para que puedas tomar acción preventiva.
  const fetchSecurityLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await api.get('audit/logs/?is_suspicious=true');
      setAuditLogs(res.data.results || res.data);
    } catch (err) {
      console.error("Error al cargar logs de seguridad", err);
    } finally {
      setLogsLoading(false);
    }
  };

  // Se ejecuta al inicio para llenar el Dashboard con información fresca.
  useEffect(() => {
    if (user?.role === 'ADMIN') {
        fetchUsers();
        fetchPendingProducts();
        fetchSecurityLogs();
    }
  }, [user]);

  // Permite activar, desactivar o BLOQUEAR usuarios directamente desde la tabla.
  const handleUserStatusChange = async (userId: string, newStatus: string) => {
    try {
      await api.patch(`users/${userId}/status/`, { status: newStatus });
      fetchUsers(); // Refrescamos la lista para ver el cambio
    } catch (err) {
      alert("Lo siento, no pudimos cambiar el estado del usuario. Intenta de nuevo.");
    }
  };

  // La función maestra para decidir si un producto sale a la venta o se devuelve al vendedor.
  const handleProductStatusChange = async (productId: string, newStatus: string, reason: string = '') => {
    try {
      await api.patch(`products/create/${productId}/`, { 
        status: newStatus,
        rejection_reason: reason 
      });
      fetchPendingProducts(); // Actualizamos la lista de pendientes
      setIsRejectModalOpen(false);
      setRejectionComment('');
      setRejectingProductId(null);
    } catch (err) {
      alert("Hubo un problema al actualizar el producto. Verifica tu conexión.");
    }
  };


  if (authLoading) {
      return (
          <div className="flex h-screen items-center justify-center">
              <Icon icon="eos-icons:bubble-loading" className="text-secondary" width={60} />
          </div>
      );
  }

  return (
    <div className="w-full">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">
            Centro de <span className="text-secondary">Control Maestro</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Sesión blindada con Inmunidad Técnica activa.</p>
        </div>
        <div className="flex gap-2">
            <Badge color="success" size="lg" className="px-4 py-2 border border-green-200">
                <HiLightningBolt className="mr-1 inline" /> Sistema Online
            </Badge>
        </div>
      </div>
      
      {/* --- CONTENEDOR PRINCIPAL CON EFECTO CRISTAL --- */}
      <div className="bg-white/40 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] border border-gray-100 dark:border-slate-800 p-2 md:p-4 overflow-hidden shadow-2xl min-h-[600px]">
        
        {currentView === 0 && (
          <div className="py-6 px-2 animate-fade-in space-y-6">
              {/* --- CONTROL MAESTRO: ESTADÍSTICAS DE SEGURIDAD Y GESTIÓN --- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-white/80 dark:bg-slate-900/90 border-none shadow-lg rounded-3xl">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-primary/10 rounded-2xl"><Icon icon="solar:users-group-rounded-bold-duotone" className="text-primary" height={32} /></div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase">Usuarios Totales</p>
                            <h3 className="text-4xl font-black text-gray-900 dark:text-white">{users.length}</h3>
                        </div>
                    </div>
                  </Card>
                  <Card className="bg-white/80 dark:bg-slate-900/90 border-none shadow-lg rounded-3xl">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-secondary/10 rounded-2xl"><Icon icon="solar:box-minimalistic-bold-duotone" className="text-secondary" height={32} /></div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase">Pendientes Aprobar</p>
                            <h3 className="text-4xl font-black text-gray-900 dark:text-white">{pendingProducts.length}</h3>
                        </div>
                    </div>
                  </Card>
                  <Card className="bg-white/80 dark:bg-slate-900/90 border-none shadow-lg rounded-3xl border-l-4 border-l-red-500">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-2xl"><MdSecurity className="text-red-600" size={32} /></div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase">Alertas Seguridad</p>
                            <h3 className="text-4xl font-black text-red-600">{auditLogs.length}</h3>
                        </div>
                    </div>
                  </Card>
              </div>

              {/* --- ANALÍTICA PREMIUM: TRABAJO DEL COLABORADOR --- */}
              <div className="grid grid-cols-12 gap-6">
                <div className="lg:col-span-8 col-span-12">
                  <RevenueForecast/>
                </div>
                <div className="lg:col-span-4 col-span-12">
                  <div className="grid grid-cols-12 h-full items-stretch gap-6">
                    <div className="col-span-12">
                      <NewCustomers />
                    </div>
                    <div className="col-span-12">
                      <TotalIncome />
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-8 col-span-12">
                  <ProductRevenue />
                </div>
                <div className="lg:col-span-4 col-span-12 flex">
                  <DailyActivity />
                </div>
                <div className="col-span-12">
                  <BlogCards />
                </div>
              </div>
          </div>
        )}

        {currentView === 1 && (
          <div className="mt-4 animate-fade-in">
            <div className="panel-card border-t-4 border-t-primary p-6">
               <CategoryComponent showAdminManagement={true} />
            </div>
          </div>
        )}

        {currentView === 2 && (
          <div className="mt-4 animate-fade-in">
            <div className="glass-panel p-8 rounded-[2.5rem] overflow-visible">
              <h2 className="text-3xl font-black text-[#0A014A] dark:text-white mb-8 flex items-center gap-3 tracking-tighter italic uppercase">
                <HiUserCircle className="text-primary text-4xl" /> Usuarios en el Sistema
              </h2>
              {loading ? <TableSkeleton /> : (
                <div className="overflow-visible">
                    <Table hoverable className="text-center">
                    <Table.Head className="bg-indigo-50/50 dark:bg-slate-800/50 border-b border-indigo-100 dark:border-white/5">
                        <Table.HeadCell className="py-4 text-[#3A17E4] dark:text-indigo-300 font-extrabold text-xs uppercase tracking-widest">Email</Table.HeadCell>
                        <Table.HeadCell className="py-4 text-[#3A17E4] dark:text-indigo-300 font-extrabold text-xs uppercase tracking-widest">Usuario</Table.HeadCell>
                        <Table.HeadCell className="py-4 text-[#3A17E4] dark:text-indigo-300 font-extrabold text-xs uppercase tracking-widest">Rol</Table.HeadCell>
                        <Table.HeadCell className="py-4 text-[#3A17E4] dark:text-indigo-300 font-extrabold text-xs uppercase tracking-widest">Estado</Table.HeadCell>
                        <Table.HeadCell className="py-4 text-[#3A17E4] dark:text-indigo-300 font-extrabold text-xs uppercase tracking-widest">Acciones</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y divide-gray-100/50 dark:divide-white/5">
                        {users.map((u) => (
                        <Table.Row key={u.id} className="bg-transparent hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                            <Table.Cell className="font-medium text-gray-900 dark:text-white">{u.email}</Table.Cell>
                            <Table.Cell>{u.username}</Table.Cell>
                            <Table.Cell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                u.role === 'VENDEDOR' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                                {u.role}
                            </span>
                            </Table.Cell>
                            <Table.Cell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                u.status === 'BLOCKED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                                {u.status}
                            </span>
                            </Table.Cell>
                            <Table.Cell>
                            <div className="flex justify-center">
                                <Select
                                value={u.status}
                                onChange={(e) => handleUserStatusChange(u.id, e.target.value)}
                                className="w-40"
                                sizing="sm"
                                >
                                <option value="ACTIVE">Activo</option>
                                <option value="INACTIVE">Inactivo</option>
                                <option value="PENDING">Pendiente</option>
                                <option value="BLOCKED">Bloqueado</option>
                                </Select>
                            </div>
                            </Table.Cell>
                        </Table.Row>
                        ))}
                    </Table.Body>
                    </Table>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 3 && (
          <div className="mt-4 animate-fade-in">
            <div className="glass-panel p-8 rounded-[2.5rem] overflow-visible">
              <h2 className="text-3xl font-black text-[#0A014A] dark:text-white mb-8 flex items-center gap-3 tracking-tighter italic uppercase">
                <MdOutlinePendingActions className="text-secondary text-4xl" /> Productos Pendientes
              </h2>
              {loading ? <TableSkeleton /> : (
                <div className="overflow-visible">
                    <Table hoverable className="text-center">
                    <Table.Head className="bg-indigo-50/50 dark:bg-slate-800/50 border-b border-indigo-100 dark:border-white/5">
                        <Table.HeadCell className="py-4 text-[#3A17E4] dark:text-indigo-300 font-extrabold text-xs uppercase tracking-widest">Imagen</Table.HeadCell>
                        <Table.HeadCell className="py-4 text-[#3A17E4] dark:text-indigo-300 font-extrabold text-xs uppercase tracking-widest">Nombre</Table.HeadCell>
                        <Table.HeadCell className="py-4 text-[#3A17E4] dark:text-indigo-300 font-extrabold text-xs uppercase tracking-widest">Categoría</Table.HeadCell>
                        <Table.HeadCell className="py-4 text-[#3A17E4] dark:text-indigo-300 font-extrabold text-xs uppercase tracking-widest">Precio</Table.HeadCell>
                        <Table.HeadCell className="py-4 text-[#3A17E4] dark:text-indigo-300 font-extrabold text-xs uppercase tracking-widest">Vendedor</Table.HeadCell>
                        <Table.HeadCell className="py-4 text-[#3A17E4] dark:text-indigo-300 font-extrabold text-xs uppercase tracking-widest">Acciones</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y divide-gray-100/50 dark:divide-white/5">
                        {pendingProducts.length === 0 ? (
                        <Table.Row>
                            <Table.Cell colSpan={6} className="py-8 text-gray-500">No hay productos pendientes de aprobación.</Table.Cell>
                        </Table.Row>
                        ) : (
                            pendingProducts.map((p) => (
                                <Table.Row key={p.id} className="bg-transparent hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                                    <Table.Cell className="flex justify-center">
                                        <img 
                                        src={p.images?.[0]?.url_image || "https://placehold.co/60x60?text=PS"} 
                                        alt={p.name} 
                                        className="h-12 w-12 object-cover rounded cursor-pointer hover:scale-110 transition-transform shadow-sm"
                                        onClick={() => openPreview(
                                        p.images?.[0]?.url_image || "https://placehold.co/600x400?text=Sin+imagen",
                                        p.name
                                        )}
                                        />
                                    </Table.Cell>
                                    <Table.Cell className="font-bold text-gray-900 dark:text-white">{p.name}</Table.Cell>
                                    <Table.Cell>
                                        <Badge color="indigo" size="sm" className="whitespace-nowrap">{p.category_name || "Sin categoría"}</Badge>
                                    </Table.Cell>
                                    <Table.Cell className="font-black text-primary">${Number(p.price || 0).toLocaleString()}</Table.Cell>
                                    <Table.Cell className="text-xs">{p.vendor_name || p.vendor}</Table.Cell>
                                    <Table.Cell>
                                        <div className="flex justify-center gap-2">
                                        <Button color="success" size="xs" onClick={() => handleProductStatusChange(p.id, 'ACTIVE')}>
                                            <HiCheck className="mr-1 h-4 w-4" /> Aprobar
                                        </Button>
                                        <Button color="failure" size="xs" onClick={() => openRejectModal(p.id)}>
                                            <HiX className="mr-1 h-4 w-4" /> Rechazar
                                        </Button>
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            ))
                        )}
                    </Table.Body>
                    </Table>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 4 && (
          <div className="mt-4 animate-fade-in">
            <div className="glass-panel p-8 rounded-[2.5rem] overflow-visible">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-red-700 dark:text-red-400 flex items-center gap-3 tracking-tighter italic uppercase">
                    <MdSecurity className="text-4xl" /> Monitoreo de Seguridad
                </h2>
                <Button color="light" size="sm" onClick={fetchSecurityLogs}>Actualizar</Button>
              </div>

              {logsLoading ? <TableSkeleton /> : (
                <div className="overflow-visible">
                    <Table hoverable className="text-center">
                        <Table.Head className="bg-red-50/50 dark:bg-red-900/10 border-b border-red-100 dark:border-white/5">
                            <Table.HeadCell className="py-4 text-red-800 dark:text-red-300 font-extrabold text-xs uppercase tracking-widest">Alerta</Table.HeadCell>
                            <Table.HeadCell className="py-4 text-red-800 dark:text-red-300 font-extrabold text-xs uppercase tracking-widest">Objeto</Table.HeadCell>
                            <Table.HeadCell className="py-4 text-red-800 dark:text-red-300 font-extrabold text-xs uppercase tracking-widest">IP Origen</Table.HeadCell>
                            <Table.HeadCell className="py-4 text-red-800 dark:text-red-300 font-extrabold text-xs uppercase tracking-widest">Fecha</Table.HeadCell>
                            <Table.HeadCell className="py-4 text-red-800 dark:text-red-300 font-extrabold text-xs uppercase tracking-widest">Riesgo</Table.HeadCell>
                        </Table.Head>
                        <Table.Body className="divide-y divide-red-100/50 dark:divide-white/5">
                            {auditLogs.length === 0 ? (
                                <Table.Row>
                                    <Table.Cell colSpan={5} className="py-8 text-green-600 font-bold">No se han detectado intrusiones sospechosas recientemente.</Table.Cell>
                                </Table.Row>
                            ) : (
                                auditLogs.map((l) => (
                                    <Table.Row key={l.id} className="bg-red-50/20 dark:hover:bg-red-900/10 transition-colors">
                                        <Table.Cell className="font-bold text-red-700 dark:text-red-400">{l.action_type}</Table.Cell>
                                        <Table.Cell className="text-xs">{l.object_repr}</Table.Cell>
                                        <Table.Cell className="font-mono text-xs">{l.ip_address}</Table.Cell>
                                        <Table.Cell className="text-xs">{new Date(l.timestamp).toLocaleString()}</Table.Cell>
                                        <Table.Cell>
                                            <Badge color="failure" size="xs">CRÍTICO</Badge>
                                        </Table.Cell>
                                    </Table.Row>
                                ))
                            )}
                        </Table.Body>
                    </Table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ImagePreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        imageUrl={previewUrl} 
        title={previewTitle} 
      />

      <Modal show={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} size="md">
        <Modal.Header>Motivo de Rechazo</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Informa al vendedor por qué se rechaza su producto.</p>
            <div>
              <Label htmlFor="rejection-reason" value="Razón de rechazo" />
              <TextInput
                id="rejection-reason"
                placeholder="Ej: Imagen insuficiente..."
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                required
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="failure" onClick={() => rejectingProductId && handleProductStatusChange(rejectingProductId, 'REJECTED', rejectionComment)}>Confirmar</Button>
          <Button color="gray" onClick={() => setIsRejectModalOpen(false)}>Cancelar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
