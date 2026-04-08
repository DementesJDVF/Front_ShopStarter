import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, TextInput, Badge, Select } from 'flowbite-react';
import { HiOutlineTrash, HiOutlinePencil, HiOutlinePlus } from 'react-icons/hi';
import api from '../../utils/axios';
import { useAuth } from '../../../context/AuthContext';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Props {
  /** Id de la categoría seleccionada (para usuarios no admin) */
  selectedCategoryId?: string;
  /** Callback cuando el usuario elige una categoría */
  onChange?: (categoryId: string) => void;
}

const CategoryComponent: React.FC<Props> = ({ selectedCategoryId, onChange }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [adminCategories, setAdminCategories] = useState<Category[]>([]);
  const [publicCategories, setPublicCategories] = useState<Category[]>([]);

  // Modal state (solo admin)
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Carga de datos
  const fetchAdminCategories = async () => {
    const res = await api.get('/products/categories/admin/');
    setAdminCategories(res.data);
  };

  const fetchPublicCategories = async () => {
    const res = await api.get('/products/get-categories/');
    setPublicCategories(res.data);
  };

  useEffect(() => {
    if (isAdmin) fetchAdminCategories();
    else fetchPublicCategories();
  }, [isAdmin]);

  // --- Admin helpers -------------------------------------------------------
  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (editingCategory) {
      // Update
      await api.put(`/products/categories/admin/${editingCategory.id}/`, {
        name,
        description,
      });
    } else {
      // Create
      await api.post('/products/categories/admin/', { name, description });
    }
    setShowModal(false);
    fetchAdminCategories();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/products/categories/admin/${id}/`);
    fetchAdminCategories();
  };

  // --- Non‑admin helpers ---------------------------------------------------
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (onChange) onChange(value);
  };

  return (
    <div className="space-y-6">
      {/* ADMIN VIEW */}
      {isAdmin && (
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
              {adminCategories.map((cat) => (
                <Table.Row key={cat.id} className="bg-white dark:bg-dark-light">
                  <Table.Cell>{cat.name}</Table.Cell>
                  <Table.Cell>{cat.description}</Table.Cell>
                  <Table.Cell className="flex gap-2">
                    <Button size="xs" color="gray" outline onClick={() => openEditModal(cat)}>
                      <HiOutlinePencil className="h-4 w-4" /> Editar
                    </Button>
                    <Button size="xs" color="failure" outline onClick={() => handleDelete(cat.id)}>
                      <HiOutlineTrash className="h-4 w-4" /> Eliminar
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      )}

      {/* NON‑ADMIN VIEW */}
      {!isAdmin && (
        <Card>
          <div className="flex flex-col gap-2">
            <label className="font-medium">Selecciona una categoría</label>
            <Select value={selectedCategoryId ?? ''} onChange={handleSelectChange}>
              <option value="" disabled>
                -- Elige una categoría --
              </option>
              {publicCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>
        </Card>
      )}

      {/* Modal (solo admin) */}
      {isAdmin && (
        <Modal show={showModal} onClose={() => setShowModal(false)}>
          <Modal.Header>{editingCategory ? 'Editar Categoría' : 'Crear Categoría'}</Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Nombre</label>
                <TextInput value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="block mb-1 font-medium">Descripción</label>
                <TextInput value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button color="primary" onClick={handleSubmit}>
              {editingCategory ? 'Actualizar' : 'Crear'}
            </Button>
            <Button color="gray" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default CategoryComponent;
