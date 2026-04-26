import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Table, Button, Select, Badge, Modal, Label, TextInput, Spinner } from 'flowbite-react';
import { HiUserCircle, HiCheck, HiX, HiLightningBolt, HiTrash, HiShoppingCart } from 'react-icons/hi';
import { MdOutlinePendingActions, MdSecurity } from 'react-icons/md';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/axios';
import CategoryComponent from '../../components/categorias/category';
import ImagePreviewModal from '../../components/shared/ImagePreviewModal';
import UnauthorizedScreen from '../../components/shared/UnauthorizedScreen';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// Componentes Analíticos
import { RevenueForecast } from 'src/components/dashboard/RevenueForecast';
import TotalIncome from 'src/components/dashboard/TotalIncome';
import NewCustomers from 'src/components/dashboard/NewCustomers';

interface User { id: string; email: string; username: string; role: string; status: string; }
interface Product { id: string; name: string; price: string; status: string; vendor_name?: string; }
interface Order { id: string; client_name: string; product_name: string; status: string; total: number; created_at: string; }

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation('admin');
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [currentView, setCurrentView] = useState(0);

  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
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
    else if (location.pathname.includes('seguridad')) setCurrentView(5);
    else setCurrentView(0);
  }, [location.pathname]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, pRes, oRes] = await Promise.all([
        api.get('users/list/'),
        api.get('products/create/'), // El Admin ve todos
        api.get('orders/') // El Admin ve todos
      ]);
      setUsers(uRes.data);
      setProducts(pRes.data.results || pRes.data);
      setOrders(oRes.data.results || oRes.data);
    } catch (err) {
      console.error("Error cargando datos admin", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (type: 'users' | 'products', id: string) => {
    if (!window.confirm("¿Estás seguro? Esta acción es irreversible y afectará la base de datos real.")) return;
    try {
      await api.delete(`${type}/${type === 'users' ? id : 'create/' + id}/`);
      toast.success("Eliminado correctamente.");
      fetchData();
    } catch (err) {
      toast.error("Error al eliminar.");
    }
  };

  const handleProductStatus = async (id: string, status: string) => {
    try {
      await api.patch(`products/create/${id}/`, { status });
      toast.success(`Producto ${status === 'AVAILABLE' ? 'Aprobado' : 'Rechazado'}`);
      fetchData();
    } catch (err) { toast.error("Error al actualizar estado."); }
  };

  return (
    <div className="w-full p-4 font-[var(--main-font)]">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-indigo-900 tracking-tighter uppercase italic">
          CONTROL <span className="text-indigo-500">TOTAL</span>
        </h1>
        <p className="text-gray-500 font-medium">Gestión Maestra de ShopStarter</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
        <Button color={currentView === 0 ? 'indigo' : 'light'} onClick={() => setCurrentView(0)}>Resumen</Button>
        <Button color={currentView === 2 ? 'indigo' : 'light'} onClick={() => setCurrentView(2)}>Usuarios</Button>
        <Button color={currentView === 3 ? 'indigo' : 'light'} onClick={() => setCurrentView(3)}>Inventario</Button>
        <Button color={currentView === 4 ? 'indigo' : 'light'} onClick={() => setCurrentView(4)}>Ventas</Button>
        <Button color={currentView === 1 ? 'indigo' : 'light'} onClick={() => setCurrentView(1)}>Categorías</Button>
      </div>

      <Card className="rounded-[2rem] shadow-2xl border-none">
        {loading ? <div className="flex justify-center py-20"><Spinner size="xl" /></div> : (
          <>
            {currentView === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                 <Card className="bg-indigo-50 border-none">
                    <h3 className="text-sm font-bold text-indigo-400">USUARIOS</h3>
                    <p className="text-4xl font-black text-indigo-900">{users.length}</p>
                 </Card>
                 <Card className="bg-green-50 border-none">
                    <h3 className="text-sm font-bold text-green-400">VENTAS TOTALES</h3>
                    <p className="text-4xl font-black text-green-900">{orders.length}</p>
                 </Card>
                 <Card className="bg-orange-50 border-none">
                    <h3 className="text-sm font-bold text-orange-400">PRODUCTOS</h3>
                    <p className="text-4xl font-black text-orange-900">{products.length}</p>
                 </Card>
                 <div className="col-span-full mt-4">
                    <RevenueForecast />
                 </div>
              </div>
            )}

            {currentView === 2 && (
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>Usuario</Table.HeadCell>
                  <Table.HeadCell>Rol</Table.HeadCell>
                  <Table.HeadCell>Estado</Table.HeadCell>
                  <Table.HeadCell>Acción</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {users.map(u => (
                    <Table.Row key={u.id}>
                      <Table.Cell className="font-bold">{u.username} <br/><span className="text-xs font-normal text-gray-400">{u.email}</span></Table.Cell>
                      <Table.Cell><Badge color={u.role === 'ADMIN' ? 'purple' : 'info'}>{u.role}</Badge></Table.Cell>
                      <Table.Cell>{u.status}</Table.Cell>
                      <Table.Cell>
                        <Button color="failure" size="xs" onClick={() => handleDelete('users', u.id)}><HiTrash/></Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}

            {currentView === 3 && (
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>Producto</Table.HeadCell>
                  <Table.HeadCell>Precio</Table.HeadCell>
                  <Table.HeadCell>Estado</Table.HeadCell>
                  <Table.HeadCell>Moderación</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {products.map(p => (
                    <Table.Row key={p.id}>
                      <Table.Cell className="font-bold">{p.name}</Table.Cell>
                      <Table.Cell>${Number(p.price).toLocaleString()}</Table.Cell>
                      <Table.Cell>
                        <Badge color={p.status === 'AVAILABLE' ? 'success' : 'warning'}>{p.status}</Badge>
                      </Table.Cell>
                      <Table.Cell className="flex gap-2">
                        {p.status === 'PENDING' && (
                          <Button color="success" size="xs" onClick={() => handleProductStatus(p.id, 'AVAILABLE')}><HiCheck/></Button>
                        )}
                        <Button color="failure" size="xs" onClick={() => handleDelete('products', p.id)}><HiTrash/></Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}

            {currentView === 4 && (
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>ID Orden</Table.HeadCell>
                  <Table.HeadCell>Cliente</Table.HeadCell>
                  <Table.HeadCell>Producto</Table.HeadCell>
                  <Table.HeadCell>Estado</Table.HeadCell>
                  <Table.HeadCell>Total</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {orders.map(o => (
                    <Table.Row key={o.id}>
                      <Table.Cell className="text-xs font-mono">{o.id.slice(0,8)}</Table.Cell>
                      <Table.Cell>{o.client_name}</Table.Cell>
                      <Table.Cell className="font-bold">{o.product_name}</Table.Cell>
                      <Table.Cell>
                        <Badge color={o.status === 'PAID' ? 'success' : 'warning'}>{o.status}</Badge>
                      </Table.Cell>
                      <Table.Cell className="font-black text-indigo-600">${Number(o.total).toLocaleString()}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;
