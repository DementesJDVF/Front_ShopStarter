import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { useConfirm } from '../../context/ConfirmContext';
import { showSuccessAlert, showErrorAlert } from '../../utils/Alerts';
import VendorMap from '../../components/geo/VendorMap';
import { getAbsoluteImageUrl } from '../../utils/urlHelper';
import VendorCatalogModal from '../../components/geo/VendorCatalogModal';
import { Users, UserCheck, UserPlus, ShieldCheck } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

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

interface SelectedVendor { id: string; name: string; }

const TableSkeleton = () => (
  <div className="animate-pulse space-y-4 py-4">
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="h-12 bg-gray-200/50 dark:bg-slate-800/50 rounded-xl"></div>
    ))}
  </div>
);

const COLORS = [
  "#06B6D4",
  "#8B5CF6",
  "#3B82F6",
  "#22C55E"
];

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation('admin');
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [currentView, setCurrentView] = useState(0);

  const [users, setUsers] = useState<User[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de Catálogo (Mapa Eagle View)
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<SelectedVendor | null>(null);
  
  const [openCard, setOpenCard] = useState<string | null>(null);
  const normalize = (val?: string) => (val || "").toLowerCase().trim();
  const toggle = (card: string) => {setOpenCard(prev =>prev === card ? null : card);};

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

  useEffect(() => {
    (window as any).openVendorCatalog = (vendorId: string, vendorName: string) => {
      setSelectedVendor({ id: vendorId, name: vendorName });
      setIsCatalogModalOpen(true);
    };
    return () => { delete (window as any).openVendorCatalog; };
  }, []);

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

  const vendors = useMemo(() => 
    users.filter(u =>normalize(u.role).includes("vendor") || normalize(u.role).includes("vendedor")),[users]);

  const clients = useMemo(() =>
    users.filter(u =>normalize(u.role).includes("client") || normalize(u.role).includes("cliente")),[users]);

  const active = useMemo(() =>
    users.filter(u =>normalize(u.status).includes("active") || normalize(u.status).includes("activo")),[users]);
  
  const inactive = useMemo(() =>
    users.filter(u =>normalize(u.status).includes("inactive") || normalize(u.status).includes("inactivo")),[users]);

  const roleData = vendors.length === 0 && clients.length === 0 ? [{name: t("No data"),value: 1}] : [
    { name: t("Vendors"), value: vendors.length },
    { name: t("Clients"), value: clients.length }];

  const statusData = active.length === 0 && inactive.length === 0 ? [{ name: t("No data"), value: 1 }] : [
    { name: t("Active"), value: active.length },
    { name: t("Inactive"), value: inactive.length }];

  const handleUserStatus = async (id: string, status: string) => {
    try {
      await api.patch(`users/${id}/status/`, { status });
      showSuccessAlert("Estado de usuario actualizado");
      fetchData();
    } catch (err) { showErrorAlert("Error al actualizar usuario"); }
  };

  const handleProductStatus = async (id: string, status: string) => {
    try {
      await api.patch(`products/create/${id}/`, { status });
      showSuccessAlert(`Producto ${status === 'AVAILABLE' ? 'Aprobado' : 'Rechazado'}`);
      fetchData();
    } catch (err) { showErrorAlert("Error al actualizar producto"); }
  };

  const handleDelete = async (type: 'users' | 'products', id: string) => {
    const confirmed = await confirm("¿Eliminar permanentemente? Esta acción afectará la base de datos real.", { isDestructive: true });
    if (!confirmed) return;
    try {
      await api.delete(`${type}/${type === 'users' ? id : 'create/' + id}/`);
      showSuccessAlert("Eliminado correctamente.");
      fetchData();
    } catch (err) { showErrorAlert("Error al eliminar."); }
  };

  const getProductImage = (images: any[]) => {
    if (!images || images.length === 0) return 'https://via.placeholder.com/150';
    const main = images.find(img => img.is_main) || images[0];
    return getAbsoluteImageUrl(main.url_image);
  };

  const renderDetails = (data: User[]) => (
    <div className="mt-4 max-h-72 overflow-auto space-y-3">{
      data.length === 0 ? (
        <p className="text-slate-400">{t("No data")}</p>
      ) : ( data.map(u => (
        <div key={u.id} className="flex justify-between items-center rounded-2xl p-4 border border-slate-700 bg-gradient-to-r
          from-slate-900 via-blue-950 to-indigo-950">
          <div>
            <p className="text-white font-semibold">{u.username}</p>
            <p className="text-slate-400 text-sm">{u.role}</p>
          </div>
            <Badge color={normalize(u.status).includes("active") ? "success" : "failure"}>
              {u.status}
            </Badge>
        </div>
      )))}
    </div>
  );

  return (
    <div className="w-full font-[var(--main-font)]">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-indigo-900 dark:text-white tracking-tighter uppercase italic">
            ADMIN<span className="text-indigo-500"> DASHBOARD</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-medium italic">Control Maestro y Moderación</p>
        </div>
        <div className="flex gap-2">
          <Badge color="success" size="lg" className="px-4 py-2 border border-green-200">
            <HiLightningBolt className="mr-1 inline" /> SISTEMA ONLINE
          </Badge>
        </div>
      </div>
      <div className="bg-white/40 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] border border-gray-100
        dark:border-slate-800 p-2 md:p-6 shadow-2xl min-h-[600px]">
        {currentView === 0 && (
          <div className="min-h-screen p-6 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
            {/* title */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 
                  bg-clip-text text-transparent">
                  {t("Admin Dashboard")}
                </h1>
              </div>
            </div>
            {/* estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                { key: "users", label: t("Users"), data: users, icon: <Users size={30} /> },
                { key: "vendors", label: t("Vendors"), data: vendors, icon: (<UserCheck size={30} />)},
                { key: "clients", label: t("Clients"), data: clients, icon: (<UserPlus size={30} />)},
                { key: "active", label: t("Active"), data: active, icon: (<ShieldCheck size={30} />)}
              ].map(card => (
                <Card key={card.key} onClick={() => toggle(card.key) }
                  className="cursor-pointer rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-900
                    via-blue-950 to-indigo-950 hover:scale-105 hover:shadow-cyan-500/20 transition-all duration-300 shadow-2xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-slate-300">
                        {card.label}
                      </p>
                      <h2 className="text-5xl font-black text-white mt-2">
                        {card.data.length}
                      </h2>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600
                        text-white shadow-lg">
                      {card.icon}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            {/* modal */}
            {openCard && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="w-[95%] md:w-[600px] rounded-3xl p-6 border border-slate-700 bg-gradient-to-br from-slate-900
                  via-blue-950 to-indigo-950 shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-white">
                      {t("Details")}
                    </h3>
                    <button onClick={() =>setOpenCard(null)}
                      className="text-slate-400 hover:text-red-400 text-2xl">
                      ✕
                    </button>
                  </div>
                  {openCard === "users" && renderDetails(users)}
                  {openCard === "vendors" && renderDetails(vendors)}
                  {openCard === "clients" && renderDetails(clients)}
                  {openCard === "active" && renderDetails(active)}
                </div>
              </div>
            )}
            {/* CHARTS */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
              {/* ROLE CHART */}
              <Card className="rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-900 via-blue-950 
                to-indigo-950 shadow-2xl">
                <h5 className="text-2xl font-bold text-white mb-4">{t("Users by role")}</h5>
                <div className="h-72">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={roleData} dataKey="value" outerRadius={100} label>
                        {roleData.map((_, i) => (
                          <Cell key={i} fill={COLORS[ i % COLORS.length ]}/>
                        ))}
                      </Pie><Tooltip /><Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              {/* starus chart */}
              <Card className="rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-900 
                via-blue-950 to-indigo-950 shadow-2xl">
                <h5 className="text-2xl font-bold text-white mb-4">{t("User status")}</h5>
                <div className="h-72">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={statusData} dataKey="value" outerRadius={100} label>
                        {statusData.map((_, i) => (
                          <Cell key={i} fill={COLORS[ i % COLORS.length ]}/>
                        ))}
                      </Pie><Tooltip /><Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
            {/* table */}
            <div className="mt-8 overflow-x-auto">
              <Card className="p-4 rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-900
                via-blue-950 to-indigo-950 shadow-2xl">
                {/* header */}
                <div className="flex items-center justify-between mb-6">
                  <h5 className="text-2xl font-black text-white">{t("Registered users")}</h5>
                  <Badge className="px-3 py-1" color="info">{users.length}{" "}{t("Users")}</Badge>
                </div>
                {/* table */}
                <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 max-h-[400px] overflow-y-auto">
                  <Table hoverable className="bg-slate-900 text-white">
                    {/* head */}
                    <Table.Head className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950">
                      <Table.HeadCell className="text-cyan-300">ID</Table.HeadCell>
                      <Table.HeadCell className="text-cyan-300">{t("User")}</Table.HeadCell>
                      <Table.HeadCell className="text-cyan-300">{t("Role")}</Table.HeadCell>
                      <Table.HeadCell className="text-cyan-300">{t("Status")}</Table.HeadCell>
                    </Table.Head>
                    {/* body */}
                    <Table.Body className="divide-y divide-slate-700">
                      {users.length === 0 ? (
                        <Table.Row className="bg-slate-900">
                          <Table.Cell colSpan={4} className="text-center text-slate-300 y-8">{t("No data")}</Table.Cell>
                        </Table.Row>
                      ) : (users.map((u, index) => (
                        <Table.Row key={u.id} className={`transition-all duration-300 border-b border-slate-700 
                          hover:bg-blue-900/40${index % 2 === 0 ? "bg-slate-900" : "bg-blue-950/60"}`}>
                          {/* id */}
                          <Table.Cell className="text-slate-200">{u.id}</Table.Cell>
                          {/* user */}
                          <Table.Cell className="text-white font-semibold">{u.username}</Table.Cell>
                          {/* role*/}
                          <Table.Cell>
                            <Badge color={normalize(u.role).includes("vendor") || normalize(u.role).includes("vendedor") ? 
                              "info" : normalize(u.role).includes("admin") ? "failure" : "purple"}>
                              {u.role || "N/A"}
                            </Badge>
                          </Table.Cell>
                          {/* status */}
                          <Table.Cell>
                            <Badge color={normalize(u.status).includes("active") || normalize(u.status).includes("activo") ? 
                            "success" : "failure"}>
                              {u.status || "N/A"}
                            </Badge>
                          </Table.Cell>
                        </Table.Row>
                      )))}
                    </Table.Body>
                  </Table>
                </div>
              </Card>
            </div>
          </div>
        )}

        {currentView === 1 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-3xl font-black uppercase italic flex items-center gap-3 mb-2">
              <Icon icon="solar:layers-minimalistic-bold-duotone" className="text-primary text-4xl" />
              <span className="bg-gradient-to-r from-[#7a9dff] to-[#9e7aff] bg-clip-text text-transparent leading-relaxed py-1">
                Gestión de Categorías
              </span>
            </h2>
            <CategoryComponent showAdminManagement={true} />
          </div>
        )}

        {currentView === 2 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-3xl font-black uppercase italic flex items-center gap-3 mb-2">
              <HiUserCircle className="text-primary text-4xl" />
              <span className="bg-gradient-to-r from-[#7a9dff] to-[#9e7aff] bg-clip-text text-transparent leading-relaxed py-1">
                Gestión de Usuarios
              </span>
            </h2>
            {loading ? <TableSkeleton /> : (
              <Table hoverable>
                <Table.Head className="!bg-gradient-to-r !from-[#000351] !to-[#280051]">
                  <Table.HeadCell className="!text-white !bg-transparent">Usuario</Table.HeadCell>
                  <Table.HeadCell className="!text-white !bg-transparent">Rol</Table.HeadCell>
                  <Table.HeadCell className="!text-white !bg-transparent">Estado</Table.HeadCell>
                  <Table.HeadCell className="!text-white !bg-transparent">Acciones</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {users.map(u => (
                    <Table.Row key={u.id}>
                      <Table.Cell>
                        <div className="text-base font-black text-gray-900 dark:text-white">{u.username}</div>
                        <div className="text-sm font-semibold text-indigo-500 dark:text-indigo-400 mt-0.5">{u.email}</div>
                      </Table.Cell>
                      <Table.Cell><Badge color={u.role === 'ADMIN' ? 'purple' : 'info'}>{u.role}</Badge></Table.Cell>
                      <Table.Cell><Badge color={u.status === 'ACTIVE' ? 'success' : u.status === 'PENDING' ? 'warning' : 'gray'}>{u.status}</Badge></Table.Cell>
                      <Table.Cell className="flex gap-2">
                        {u.status === 'PENDING' && (
                          <Button color="success" size="xs" onClick={() => handleUserStatus(u.id, 'ACTIVE')}><HiCheck className="mr-1" /> Aprobar</Button>
                        )}
                        <Select value={u.status} onChange={(e) => handleUserStatus(u.id, e.target.value)}>
                          <option value="ACTIVE">Activo</option>
                          <option value="INACTIVE">Inactivo</option>
                          <option value="BLOCKED">Bloqueado</option>
                        </Select>
                        <Button color="failure" size="xs" onClick={() => handleDelete('users', u.id)}><HiTrash /></Button>
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
            <h2 className="text-3xl font-black uppercase italic flex items-center gap-3 mb-2">
              <MdOutlinePendingActions className="text-secondary text-4xl" />
              <span className="bg-gradient-to-r from-[#7a9dff] to-[#9e7aff] bg-clip-text text-transparent leading-relaxed py-1">
                Aprobación de Productos
              </span>
            </h2>
            <p className="text-gray-500 font-medium">Revisa y aprueba los productos enviados por los vendedores antes de que salgan al catálogo público.</p>
            {loading ? <TableSkeleton /> : (
              <Table hoverable>
                <Table.Head className="!bg-gradient-to-r !from-[#000351] !to-[#280051]">
                  <Table.HeadCell className="!text-white !bg-transparent">Imagen</Table.HeadCell>
                  <Table.HeadCell className="!text-white !bg-transparent">Producto</Table.HeadCell>
                  <Table.HeadCell className="!text-white !bg-transparent">Vendedor</Table.HeadCell>
                  <Table.HeadCell className="!text-white !bg-transparent">Precio</Table.HeadCell>
                  <Table.HeadCell className="!text-white !bg-transparent">Estado</Table.HeadCell>
                  <Table.HeadCell className="!text-white !bg-transparent">Acciones</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {allProducts.filter(p => p.status === 'PENDING').map(p => (
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
                        <Button color="success" size="xs" onClick={() => handleProductStatus(p.id, 'AVAILABLE')}>
                          <HiCheck className="mr-1" /> Aprobar
                        </Button>
                        <Button color="info" size="xs" onClick={() => navigate(`/app/products/${p.id}`)}>
                          <Icon icon="solar:eye-outline" className="mr-1 h-4 w-4" /> Detalle
                        </Button>
                        <Button color="failure" size="xs" onClick={() => handleProductStatus(p.id, 'REJECTED')}>
                          <HiTrash className="mr-1 h-4 w-4" /> {t('products.reject')}
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
            <h2 className="text-3xl font-black uppercase italic flex items-center gap-3 mb-6">
              <HiShoppingCart className="text-primary text-4xl" />
              <span className="bg-gradient-to-r from-[#7a9dff] to-[#9e7aff] bg-clip-text text-transparent leading-relaxed py-1">
                Auditoría de Ventas
              </span>
            </h2>
            {loading ? <TableSkeleton /> : (
              <Table hoverable>
                <Table.Head className="!bg-gradient-to-r !from-[#000351] !to-[#280051]">
                  <Table.HeadCell className="!text-white !bg-transparent">ID</Table.HeadCell>
                  <Table.HeadCell className="!text-white !bg-transparent">Cliente</Table.HeadCell>
                  <Table.HeadCell className="!text-white !bg-transparent">Producto</Table.HeadCell>
                  <Table.HeadCell className="!text-white !bg-transparent">Estado</Table.HeadCell>
                  <Table.HeadCell className="!text-white !bg-transparent">Total</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {orders.map(o => (
                    <Table.Row key={o.id}>
                      <Table.Cell className="text-xs font-mono">{o.id.slice(0, 8)}</Table.Cell>
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
            <h2 className="text-3xl font-black uppercase italic flex items-center gap-3 mb-2">
              <Icon icon="solar:map-point-wave-bold-duotone" className="text-primary text-4xl" />
              <span className="bg-gradient-to-r from-[#7a9dff] to-[#9e7aff] bg-clip-text text-transparent leading-relaxed py-1">
                Vista de Águila (Mapa Global)
              </span>
            </h2>
            <div className="h-[500px] w-full">
              <VendorMap isAdmin={true} />
            </div>
          </div>
        )}
      </div>

      <VendorCatalogModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        vendorId={selectedVendor?.id || null}
        vendorName={selectedVendor?.name}
      />
    </div>
  );
};

export default AdminDashboard;
