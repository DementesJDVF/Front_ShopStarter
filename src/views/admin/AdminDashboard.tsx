import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, TextInput, Select, Badge } from 'flowbite-react';
import { HiOutlineTrash, HiOutlinePencil, HiOutlinePlus } from 'react-icons/hi';
import api from '../../utils/axios';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  status: string;
  is_active: boolean;
}

const AdminDashboard: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');

  // Fetch categories (admin view)
  const fetchCategories = async () => {
    const res = await api.get('/products/categories/admin/');
    setCategories(res.data);
  };

  // Fetch users (admin view)
  const fetchUsers = async () => {
    const res = await api.get('/users/list/');
    setUsers(res.data);
  };

  useEffect(() => {
    fetchCategories();
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryDesc('');
    setShowCategoryModal(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryDesc(cat.description || '');
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async () => {
    if (editingCategory) {
      // Update
      await api.put(`/products/categories/admin/${editingCategory.id}/`, {
        name: categoryName,
        description: categoryDesc,
      });
    } else {
      // Create
      await api.post('/products/categories/admin/', {
        name: categoryName,
        description: categoryDesc,
      });
    }
    setShowCategoryModal(false);
    fetchCategories();
  };

  const handleDeleteCategory = async (id: string) => {
    await api.delete(`/products/categories/admin/${id}/`);
    fetchCategories();
  };

  const handleUserStatusChange = async (userId: string, newStatus: string) => {
    await api.patch(`/users/${userId}/status/`, { status: newStatus });
    fetchUsers();
  };

  return (
    <div className="p-6 space-y-8">
      {/* Categories Section */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-dark dark:text-white">Gestión de Categorías</h2>
          <Button color="primary" onClick={openCreateModal}>
            <HiOutlinePlus className="mr-2 h-4 w-4" /> Crear Categoría
          </Button>
        </div>
        <Table hoverable>
          <Table.Head className="bg-gray-50 dark:bg-dark-light">
            <Table.HeadCell>Nombre</Table.HeadCell>
            <Table.HeadCell>Descripción</Table.HeadCell>
            <Table.HeadCell>Acciones</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {categories.map((cat) => (
              <Table.Row key={cat.id} className="bg-white dark:bg-dark-light">
                <Table.Cell>{cat.name}</Table.Cell>
                <Table.Cell>{cat.description}</Table.Cell>
                <Table.Cell className="flex gap-2">
                  <Button size="xs" color="gray" outline onClick={() => openEditModal(cat)}>
                    <HiOutlinePencil className="h-4 w-4" /> Editar
                  </Button>
                  <Button size="xs" color="failure" outline onClick={() => handleDeleteCategory(cat.id)}>
                    <HiOutlineTrash className="h-4 w-4" /> Eliminar
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>

      {/* Users Section */}
      <Card>
        <h2 className="text-2xl font-bold text-dark dark:text-white mb-4">Gestión de Usuarios</h2>
        <Table hoverable>
          <Table.Head className="bg-gray-50 dark:bg-dark-light">
            <Table.HeadCell>Email</Table.HeadCell>
            <Table.HeadCell>Rol</Table.HeadCell>
            <Table.HeadCell>Estado</Table.HeadCell>
            <Table.HeadCell>Acciones</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {users.map((u) => (
              <Table.Row key={u.id} className="bg-white dark:bg-dark-light">
                <Table.Cell>{u.email}</Table.Cell>
                <Table.Cell>{u.role}</Table.Cell>
                <Table.Cell>{u.status}</Table.Cell>
                <Table.Cell className="flex gap-2">
                  <Select
                    value={u.status}
                    onChange={(e) => handleUserStatusChange(u.id, e.target.value)}
                    className="w-48"
                  >
                    <option value="ACTIVE">Activo</option>
                    <option value="INACTIVE">Inactivo</option>
                    <option value="PENDING">Pendiente</option>
                    <option value="BLOCKED">Bloqueado</option>
                  </Select>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>

      {/* Category Modal */}
      <Modal show={showCategoryModal} onClose={() => setShowCategoryModal(false)}>
        <Modal.Header>{editingCategory ? 'Editar Categoría' : 'Crear Categoría'}</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Nombre</label>
              <TextInput value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
            </div>
            <div>
              <label className="block mb-1 font-medium">Descripción</label>
              <TextInput value={categoryDesc} onChange={(e) => setCategoryDesc(e.target.value)} />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="primary" onClick={handleCategorySubmit}>
            {editingCategory ? 'Actualizar' : 'Crear'}
          </Button>
          <Button color="gray" onClick={() => setShowCategoryModal(false)}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
