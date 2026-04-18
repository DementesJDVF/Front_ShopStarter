import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router';
import { Card, Table, Button, Select, Tabs, Badge, Modal, Label, TextInput, TabsRef } from 'flowbite-react';
import { HiUserCircle, HiCheck, HiX, HiOutlineChartPie } from 'react-icons/hi';
import { MdCategory, MdOutlinePendingActions } from 'react-icons/md';
import { Icon } from '@iconify/react';
import api from '../../utils/axios';
import CategoryComponent from '../../components/categorias/category';
import ImagePreviewModal from '../../components/shared/ImagePreviewModal';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  status: string;
  is_active: boolean;
}

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const [currentView, setCurrentView] = useState(0);

  const [users, setUsers] = useState<User[]>([]);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sincronizar vista con URL
  useEffect(() => {
    if (location.pathname.includes('usuarios')) setCurrentView(2);
    else if (location.pathname.includes('categorias')) setCurrentView(1);
    else if (location.pathname.includes('productos/aprobar')) setCurrentView(3);
    else setCurrentView(0); // Resumen
  }, [location.pathname]);
  
  // Estados para el visor de imágenes
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // Estado para el rechazo de productos
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingProductId, setRejectingProductId] = useState<string | null>(null);
  const [rejectionComment, setRejectionComment] = useState('');

  const openPreview = (url: string, title: string) => {
    setPreviewUrl(url);
    setPreviewTitle(title);
    setIsPreviewOpen(true);
  };

  // Fetch users (admin view)
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('users/list/');
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingProducts = async () => {
    try {
      const res = await api.get('products/create/?status=PENDING');
      setPendingProducts(res.data.results || res.data);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPendingProducts();
  }, []);

  const handleUserStatusChange = async (userId: string, newStatus: string) => {
    try {
      await api.patch(`users/${userId}/status/`, { status: newStatus });
      fetchUsers();
    } catch (err) {
      alert("Error al cambiar el estado del usuario");
    }
  };

  const handleProductStatusChange = async (productId: string, newStatus: string, reason: string = '') => {
    try {
      await api.patch(`products/create/${productId}/`, { 
        status: newStatus,
        rejection_reason: reason 
      });
      fetchPendingProducts();
      setIsRejectModalOpen(false);
      setRejectionComment('');
      setRejectingProductId(null);
    } catch (err) {
      alert("Error al actualizar el producto");
    }
  };

  const openRejectModal = (productId: string) => {
    setRejectingProductId(productId);
    setIsRejectModalOpen(true);
  };

  return (
    <div className="w-full">
      <div className="mb-10">
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">
          Centro de <span className="text-secondary">Control Maestro</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Gestiona usuarios, productos y categorías con precisión quirúrgica.</p>
      </div>
      
      <div className="bg-white/40 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-gray-100 dark:border-slate-800 p-2 md:p-4 overflow-hidden shadow-sm">
        
        {currentView === 0 && (
          <div className="py-6 px-2 animate-fade-in">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-secondary to-purple-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                <Card className="relative bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-none shadow-xl p-8 md:p-20 text-center rounded-[2.5rem] overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Icon icon="solar:crown-minimalistic-bold-duotone" width={250} />
                  </div>
                  
                  <div className="relative z-10 flex flex-col items-center gap-8">
                    <div className="p-6 bg-gradient-to-br from-secondary to-purple-700 rounded-3xl shadow-xl transform hover:rotate-6 transition duration-500">
                      <Icon icon="solar:shield-star-bold-duotone" className="text-white" height={56} />
                    </div>
                    <div className="max-w-2xl">
                      <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic leading-none">
                        Consola Administrativa <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-purple-500">Próximamente por Papayo</span>
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 mt-6 text-base md:text-lg font-medium leading-relaxed">
                        La super-visión de ShopStarter está en camino. Supervisa el flujo de ventas global, 
                        gestiona la reputación de los vendedores y domina el mercado desde un solo lugar.
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                       <Badge color="purple" className="px-5 py-2 rounded-full font-black uppercase text-xs">Métricas Globales</Badge>
                       <Badge color="indigo" className="px-5 py-2 rounded-full font-black uppercase text-xs">Control Total</Badge>
                       <Badge color="pink" className="px-5 py-2 rounded-full font-black uppercase text-xs">Soporte Master</Badge>
                    </div>
                  </div>
                </Card>
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
            <div className="panel-card p-6 overflow-visible">
              <h2 className="text-2xl font-bold text-dark dark:text-white mb-6 flex items-center gap-2">
                <HiUserCircle className="text-primary text-3xl" /> Usuarios Registrados
              </h2>
              <div className="overflow-visible">
                <Table hoverable className="text-center">

                  <Table.Head className="bg-gray-50 dark:bg-dark-light">
                    <Table.HeadCell>Email</Table.HeadCell>
                    <Table.HeadCell>Usuario</Table.HeadCell>
                    <Table.HeadCell>Rol</Table.HeadCell>
                    <Table.HeadCell>Estado</Table.HeadCell>
                    <Table.HeadCell>Acciones</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {users.map((u) => (
                      <Table.Row key={u.id} className="bg-white dark:bg-dark-light">
                        <Table.Cell className="font-medium text-gray-900 dark:text-white">
                          {u.email}
                        </Table.Cell>
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
            </div>

          </div>
        )}
        {currentView === 3 && (
          <div className="mt-4 animate-fade-in">
            <div className="panel-card p-6 overflow-visible">
              <h2 className="text-2xl font-bold text-dark dark:text-white mb-6 flex items-center gap-2">
                <MdOutlinePendingActions className="text-primary text-3xl" /> Productos Pendientes
              </h2>
              <div className="overflow-visible">
                <Table hoverable className="text-center">

                  <Table.Head className="bg-gray-50 dark:bg-dark-light text-[11px] uppercase tracking-wider">
                    <Table.HeadCell>Imagen</Table.HeadCell>
                    <Table.HeadCell>Nombre</Table.HeadCell>
                    <Table.HeadCell>Categoría</Table.HeadCell>
                    <Table.HeadCell>Descripción</Table.HeadCell>
                    <Table.HeadCell>Precio</Table.HeadCell>
                    <Table.HeadCell>Vendedor</Table.HeadCell>
                    <Table.HeadCell>Acciones</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {pendingProducts.length === 0 ? (
                      <Table.Row>
                        <Table.Cell colSpan={7} className="py-8 text-gray-500">No hay productos pendientes de aprobación.</Table.Cell>
                      </Table.Row>
                    ) : (
                      pendingProducts.map((p) => (
                        <Table.Row key={p.id} className="bg-white dark:bg-dark-light">
                          <Table.Cell className="flex justify-center">
                            <img 
                              src={p.images?.[0]?.url_image || "https://placehold.co/60x60?text=PS"} 
                              alt={p.name} 
                              className="h-12 w-12 object-cover rounded cursor-pointer hover:scale-110 transition-transform shadow-sm"
                              title="Haz clic para ver en grande"
                              onClick={() => openPreview(p.images?.[0]?.url_image, p.name)}
                            />
                          </Table.Cell>
                          <Table.Cell className="font-bold text-gray-900 dark:text-white">{p.name}</Table.Cell>
                          <Table.Cell>
                            <Badge color="indigo" size="sm" className="whitespace-nowrap">{p.category_name || "Sin categoría"}</Badge>
                          </Table.Cell>
                          <Table.Cell className="text-xs text-left max-w-[200px]">
                            <p className="truncate" title={p.description}>{p.description || "Sin descripción"}</p>
                          </Table.Cell>
                          <Table.Cell className="font-black text-primary">${parseFloat(p.price).toLocaleString()}</Table.Cell>
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
            </div>

          </div>
        )}
      </div>

      {/* Visor de Imágenes Global */}
      <ImagePreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        imageUrl={previewUrl} 
        title={previewTitle} 
      />

      {/* Modal de Motivo de Rechazo */}
      <Modal show={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} size="md">
        <Modal.Header>Motivo de Rechazo</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Por favor, indica por qué estás rechazando este producto. Este comentario será enviado al vendedor.
            </p>
            <div>
              <Label htmlFor="rejection-reason" value="Comentario / Razón" />
              <TextInput
                id="rejection-reason"
                placeholder="Ej: La imagen no es clara, El precio no corresponde..."
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                required
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            color="failure" 
            disabled={!rejectionComment.trim()} 
            onClick={() => rejectingProductId && handleProductStatusChange(rejectingProductId, 'REJECTED', rejectionComment)}
          >
            Confirmar Rechazo
          </Button>
          <Button color="gray" onClick={() => setIsRejectModalOpen(false)}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
