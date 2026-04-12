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
  const tabsRef = useRef<TabsRef>(null);
  
  const [users, setUsers] = useState<User[]>([]);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sincronizar tab con URL
  useEffect(() => {
    if (location.pathname.includes('usuarios')) tabsRef.current?.setActiveTab(2);
    else if (location.pathname.includes('categorias')) tabsRef.current?.setActiveTab(1);
    else if (location.pathname.includes('productos/aprobar')) tabsRef.current?.setActiveTab(3);
    else tabsRef.current?.setActiveTab(0); // Resumen
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
    <div className="p-6">
      <h1 className="text-3xl font-bold text-dark dark:text-white mb-8">Panel de Administración</h1>
      
      <Tabs aria-label="Tabs with underline" variant="underline" ref={tabsRef}>
        <Tabs.Item active title="Resumen General" icon={HiOutlineChartPie}>
           <div className="mt-4">
              <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-none shadow-xl p-12 text-center overflow-hidden relative">
                <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="p-6 bg-white dark:bg-dark-light rounded-3xl shadow-2xl scale-110">
                    <Icon icon="solar:crown-minimalistic-bold-duotone" className="text-secondary" height={64} />
                  </div>
                  <div className="max-w-md">
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">
                      Próximamente <span className="text-secondary italic">por Papayo</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg font-medium">
                      El centro de control maestro está en desarrollo. Pronto podrás ver analíticas globales, 
                      gestionar el sistema completo y supervisar el crecimiento de ShopStarter.
                    </p>
                  </div>
                  <div className="flex gap-4 mt-4">
                     <Badge color="purple" size="xl" className="font-bold">Métricas Globales</Badge>
                     <Badge color="indigo" size="xl" className="font-bold">Control Total</Badge>
                     <Badge color="pink" size="xl" className="font-bold">Soporte Master</Badge>
                  </div>
                </div>
              </Card>
           </div>
        </Tabs.Item>

        <Tabs.Item title="Gestión de Categorías" icon={MdCategory}>
          <div className="mt-4">
            <Card className="shadow-md border-t-4 border-t-primary">
               <CategoryComponent showAdminManagement={true} />
            </Card>
          </div>
        </Tabs.Item>
        
        <Tabs.Item title="Gestión de Usuarios" icon={HiUserCircle}>
          <div className="mt-4">
            <Card className="shadow-md">
              <h2 className="text-2xl font-bold text-dark dark:text-white mb-6">Usuarios Registrados</h2>
              <div className="overflow-x-auto">
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
            </Card>
          </div>
        </Tabs.Item>
        <Tabs.Item title="Aprobación de Productos" icon={MdOutlinePendingActions}>
          <div className="mt-4">
            <Card className="shadow-md">
              <h2 className="text-2xl font-bold text-dark dark:text-white mb-6">Productos Pendientes</h2>
              <div className="overflow-x-auto">
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
            </Card>
          </div>
        </Tabs.Item>
      </Tabs>

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
