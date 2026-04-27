import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Table, Button, Select, Badge, Spinner } from 'flowbite-react';
import { HiUserCircle, HiCheck, HiLightningBolt, HiTrash, HiShoppingCart } from 'react-icons/hi';
import { MdOutlinePendingActions } from 'react-icons/md';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/axios';
import CategoryComponent from '../../components/categorias/category';
import ImagePreviewModal from '../../components/shared/ImagePreviewModal';
import UnauthorizedScreen from '../../components/shared/UnauthorizedScreen';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import VendorMap from '../../components/geo/VendorMap';

// Componentes Analíticos Premium (Imports por defecto corregidos)
import { RevenueForecast } from '../../components/dashboard/RevenueForecast';
import TotalIncome from '../../components/dashboard/TotalIncome';
import NewCustomers from '../../components/dashboard/NewCustomers';
import ProductRevenue from '../../components/dashboard/ProductRevenue';
import DailyActivity from '../../components/dashboard/DailyActivity';
import BlogCards from '../../components/dashboard/BlogCards';

interface User { id: string; email: string; username: string; role: string; status: string; }
interface Product { id: string; name: string; price: string; status: string; vendor_name?: string; images?: any[]; }
interface Order { id: string; client_name: string; product_name: string; status: string; total: number; created_at: string; }

const TableSkeleton = () => (
    <div className="animate-pulse space-y-4 py-4">
        {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-gray-200/50 dark:bg-slate-800/50 rounded-xl"></div>
        ))}
    </div>
);

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation('admin');
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [currentView, setCurrentView] = useState(0);

  const [users, setUsers] = useState<User[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  if (!authLoading && (!user || user.role !== 'ADMIN')) {
    return <UnauthorizedScreen code={403} message="Solo Administradores." />;
  }

  useEffect(() => {
    if (location.pathname.includes('usuarios')) setCurrentView(2);
    else if (location.pathname.includes('categorias')) setCurrentView(1);
    else if (location.pathname.includes('productos')) setCurrentView(3);
    else if (location.pathname.includes('ventas')) setCurrentView(4);
    else if (location.pathname.includes('mapa')) setCurrentView(5);
    else setCurrentView(0);
  }, [location.pathname]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, pRes, oRes] = await Promise.all([
        api.get('users/list/'),
        api.get('products/create/'),
        api.get('orders/')
      ]);
      const pData = pRes.data.results || pRes.data;
      setUsers(uRes.data);
      setAllProducts(Array.isArray(pData) ? pData : []);
      setPendingProducts(Array.isArray(pData) ? pData.filter((p: any) => p.status === 'PENDING') : []);
      setOrders(oRes.data.results || oRes.data);
    } catch (err) {
      console.error("Error cargando datos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUserStatus = async (id: string, status: string) => {
    try {
        await api.patch(`users/${id}/status/`, { status });
        toast.success("Estado de usuario actualizado");
        fetchData();
    } catch (err) { toast.error("Error al actualizar usuario"); }
  };

  const handleProductStatus = async (id: string, status: string) => {
    try {
      await api.patch(`products/create/${id}/`, { status });
      toast.success(`Producto ${status === 'AVAILABLE' ? 'Aprobado' : 'Rechazado'}`);
      fetchData();
    } catch (err) { toast.error("Error al actualizar producto"); }
  };

  const handleDelete = async (type: 'users' | 'products', id: string) => {
    if (!window.confirm("¿Eliminar permanentemente? Esta acción afectará la base de datos real.")) return;
    try {
      await api.delete(`${type}/${type === 'users' ? id : 'create/' + id}/`);
      toast.success("Eliminado correctamente.");
      fetchData();
    } catch (err) { toast.error("Error al eliminar."); }
  };

  const getProductImage = (images: any[]) => {
      if (!images || images.length === 0) return 'https://via.placeholder.com/150';
      const main = images.find(img => img.is_main) || images[0];
      return main.url_image || 'https://via.placeholder.com/150';
  };

  return (
    <div className="w-full font-[var(--main-font)]">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="text-3xl md:text-5xl font-black text-indigo-900 dark:text-white tracking-tighter uppercase italic">
            ADMIN<span className="text-indigo-500"> DASHBOARD</span>
            </h1>
            <p className="text-gray-500 font-medium italic">Control Maestro y Moderación</p>
        </div>
        <div className="flex gap-2">
            <Badge color="success" size="lg" className="px-4 py-2 border border-green-200">
                <HiLightningBolt className="mr-1 inline" /> SISTEMA ONLINE
            </Badge>
        </div>
      </div>
      
      <div className="bg-white/40 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] border border-gray-100 dark:border-slate-800 p-2 md:p-6 shadow-2xl min-h-[600px]">
        
        {currentView === 0 && (
          <div className="animate-fade-in space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-white/80 dark:bg-slate-900/90 border-none shadow-lg rounded-3xl">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-primary/10 rounded-2xl"><Icon icon="solar:users-group-rounded-bold-duotone" className="text-primary" height="32" /></div>
                        <div><p className="text-sm font-bold text-gray-400 uppercase">Usuarios</p><h3 className="text-4xl font-black text-gray-900 dark:text-white">{users.length}</h3></div>
                    </div>
                  </Card>
                  <Card className="bg-white/80 dark:bg-slate-900/90 border-none shadow-lg rounded-3xl">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-secondary/10 rounded-2xl"><Icon icon="solar:box-minimalistic-bold-duotone" className="text-secondary" height="32" /></div>
                        <div><p className="text-sm font-bold text-gray-400 uppercase">Pendientes</p><h3 className="text-4xl font-black text-gray-900 dark:text-white">{pendingProducts.length}</h3></div>
                    </div>
                  </Card>
                  <Card className="bg-white/80 dark:bg-slate-900/90 border-none shadow-lg rounded-3xl border-l-4 border-l-green-500">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-2xl"><HiShoppingCart className="text-green-600" size={32} /></div>
                        <div><p className="text-sm font-bold text-gray-400 uppercase">Ventas</p><h3 className="text-4xl font-black text-green-600">{orders.length}</h3></div>
                    </div>
                  </Card>
              </div>
              <div className="grid grid-cols-12 gap-6">
                <div className="lg:col-span-8 col-span-12"><RevenueForecast/></div>
                <div className="lg:col-span-4 col-span-12 space-y-6"><NewCustomers /><TotalIncome /></div>
                <div className="lg:col-span-8 col-span-12"><ProductRevenue /></div>
                <div className="lg:col-span-4 col-span-12"><DailyActivity /></div>
                <div className="col-span-12"><BlogCards /></div>
              </div>
          </div>
        )}

        {currentView === 1 && (<div className="animate-fade-in"><CategoryComponent showAdminManagement={true} /></div>)}

        {currentView === 2 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-3xl font-black text-indigo-900 uppercase italic flex items-center gap-3"><HiUserCircle className="text-primary text-4xl" /> Gestión de Usuarios</h2>
            {loading ? <TableSkeleton /> : (
                <Table hoverable>
                    <Table.Head className="bg-indigo-50">
                        <Table.HeadCell>Usuario</Table.HeadCell>
                        <Table.HeadCell>Rol</Table.HeadCell>
                        <Table.HeadCell>Estado</Table.HeadCell>
                        <Table.HeadCell>Acciones</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">
                        {users.map(u => (
                            <Table.Row key={u.id}>
                                <Table.Cell className="font-bold">{u.username}<br/><span className="text-xs font-normal text-gray-400">{u.email}</span></Table.Cell>
                                <Table.Cell><Badge color={u.role === 'ADMIN' ? 'purple' : 'info'}>{u.role}</Badge></Table.Cell>
                                <Table.Cell><Badge color={u.status === 'ACTIVE' ? 'success' : u.status === 'PENDING' ? 'warning' : 'gray'}>{u.status}</Badge></Table.Cell>
                                <Table.Cell className="flex gap-2">
                                    {u.status === 'PENDING' && (
                                        <Button color="success" size="xs" onClick={() => handleUserStatus(u.id, 'ACTIVE')}><HiCheck className="mr-1"/> Aprobar</Button>
                                    )}
                                    <Select value={u.status} onChange={(e) => handleUserStatus(u.id, e.target.value)}>
                                        <option value="ACTIVE">Activo</option>
                                        <option value="INACTIVE">Inactivo</option>
                                        <option value="BLOCKED">Bloqueado</option>
                                    </Select>
                                    <Button color="failure" size="xs" onClick={() => handleDelete('users', u.id)}><HiTrash/></Button>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            )}
          </div>
        )}

        {currentView === 3 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-3xl font-black text-indigo-900 uppercase italic flex items-center gap-3"><MdOutlinePendingActions className="text-secondary text-4xl" /> Aprobación de Productos</h2>
            <p className="text-gray-500 font-medium">Revisa y aprueba los productos enviados por los vendedores antes de que salgan al catálogo público.</p>
            {loading ? <TableSkeleton /> : (
                <Table hoverable>
                    <Table.Head className="bg-indigo-50">
                        <Table.HeadCell>Imagen</Table.HeadCell>
                        <Table.HeadCell>Producto</Table.HeadCell>
                        <Table.HeadCell>Vendedor</Table.HeadCell>
                        <Table.HeadCell>Precio</Table.HeadCell>
                        <Table.HeadCell>Estado</Table.HeadCell>
                        <Table.HeadCell>Moderación</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">
                        {allProducts.filter(p => p.status === 'PENDING' || p.status === 'AVAILABLE').map(p => (
                            <Table.Row key={p.id}>
                                <Table.Cell>
                                    <img src={getProductImage(p.images || [])} alt={p.name} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-gray-100" />
                                </Table.Cell>
                                <Table.Cell className="font-bold">{p.name}</Table.Cell>
                                <Table.Cell className="text-xs">{p.vendor_name}</Table.Cell>
                                <Table.Cell className="font-bold text-indigo-600">${Number(p.price).toLocaleString()}</Table.Cell>
                                <Table.Cell>
                                    <Badge color={p.status === 'AVAILABLE' ? 'success' : 'warning'}>{p.status}</Badge>
                                </Table.Cell>
                                <Table.Cell className="flex gap-2">
                                    {p.status === 'PENDING' && (
                                        <Button color="success" size="xs" onClick={() => handleProductStatus(p.id, 'AVAILABLE')}>
                                            <HiCheck className="mr-1"/> Aprobar
                                        </Button>
                                    )}
                                    <Button color="failure" size="xs" onClick={() => handleDelete('products', p.id)}>
                                        <HiTrash className="mr-1"/> Eliminar
                                    </Button>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            )}
          </div>
        )}

        {currentView === 4 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-3xl font-black text-green-700 uppercase italic flex items-center gap-3"><HiShoppingCart className="text-green-500 text-4xl" /> Auditoría de Ventas</h2>
            {loading ? <TableSkeleton /> : (
                <Table hoverable>
                    <Table.Head className="bg-green-50">
                        <Table.HeadCell>ID</Table.HeadCell>
                        <Table.HeadCell>Cliente</Table.HeadCell>
                        <Table.HeadCell>Producto</Table.HeadCell>
                        <Table.HeadCell>Estado</Table.HeadCell>
                        <Table.HeadCell>Total</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">
                        {orders.map(o => (
                            <Table.Row key={o.id}>
                                <Table.Cell className="text-xs font-mono">{o.id.slice(0,8)}</Table.Cell>
                                <Table.Cell>{o.client_name}</Table.Cell>
                                <Table.Cell className="font-bold">{o.product_name}</Table.Cell>
                                <Table.Cell><Badge color={o.status === 'PAID' ? 'success' : 'warning'}>{o.status}</Badge></Table.Cell>
                                <Table.Cell className="font-black text-indigo-600">${Number(o.total).toLocaleString()}</Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            )}
          </div>
        )}

        {currentView === 5 && (
          <div className="animate-fade-in space-y-6 h-full">
            <h2 className="text-3xl font-black text-blue-700 uppercase italic flex items-center gap-3"><Icon icon="solar:map-point-wave-bold-duotone" className="text-blue-500 text-4xl" /> Vista de Águila (Mapa Global)</h2>
            <div className="h-[500px] w-full">
                <VendorMap isAdmin={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
