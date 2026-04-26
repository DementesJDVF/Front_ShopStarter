import { Button, Label, Modal, Select, Spinner, Table, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import api from "../../utils/axios";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

type Category = {
  id: number;
  name: string;
  description?: string;
  emoji?: string;
  isActive?: boolean;
};

const CATEGORY_EMOJIS = [
  "🛍️", "🍔", "📚", "🎮", "💄", "🏡", "⚽", "🐶", "💻", "🎵", "👕", "👟", "⌚", "🕶️", "Cap", "🧸", "🍼", "🧴", "🧼", "🪑", "🛏️", "🍎", "🥗"
];

const EMOJI_CHOICES = Array.from(new Set([...CATEGORY_EMOJIS]));

interface CategoryProps {
  selectedCategoryId?: number | string;
  onChange?: (categoryId: string) => void;
  showAdminManagement?: boolean;
}

const CategoryComponent: React.FC<CategoryProps> = ({ selectedCategoryId, onChange, showAdminManagement = false }) => {
  const { t } = useTranslation('categoryList');
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    emoji: "🛍️"
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? 'products/categories/admin/' : 'products/get-categories/';
      const res = await api.get(endpoint);
      setCategories(res.data.results || res.data);
    } catch (err) {
      setError(t('error.load'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [isAdmin]);

  const handleOpenModal = (cat: Category | null = null) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({
        name: cat.name,
        description: cat.description || "",
        emoji: cat.emoji || "🛍️"
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        emoji: "🛍️"
      });
    }
    setIsModalOpen(true);
  };

  const handleCreateOrUpdate = async () => {
    try {
      if (editingCategory) {
        await api.put(`products/categories/admin/${editingCategory.id}/`, formData);
      } else {
        await api.post('products/categories/admin/', formData);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      alert(t('error.save'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;
    try {
      await api.delete(`products/categories/admin/${id}/`);
      fetchCategories();
    } catch (err) {
      alert(t('error.delete'));
    }
  };

  if (loading && categories.length === 0) return <Spinner />;

  // ADMIN VIEW (Management)
  if (isAdmin && showAdminManagement) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-dark dark:text-white">{t('admin.title')}</h2>
          <Button color="success" onClick={() => handleOpenModal()}>
            <Icon icon="mdi:plus" className="mr-2 h-4 w-4" /> {t('admin.addButton')}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table hoverable className="text-center">
            <Table.Head>
              <Table.HeadCell>{t('admin.table.id')}</Table.HeadCell>
              <Table.HeadCell>{t('admin.table.category')}</Table.HeadCell>
              <Table.HeadCell>{t('admin.table.description')}</Table.HeadCell>
              <Table.HeadCell>{t('admin.table.actions')}</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {categories.map((cat) => (
                <Table.Row key={cat.id}>
                  <Table.Cell>{cat.id}</Table.Cell>
                  <Table.Cell>
                    <span className="flex items-center justify-center gap-2">
                       <span>{cat.emoji || '🛍️'}</span>
                       {cat.name}
                    </span>
                  </Table.Cell>
                  <Table.Cell>{cat.description || '-'}</Table.Cell>
                  <Table.Cell>
                    <div className="flex justify-center gap-2 text-sm italic">
                      <Button size="xs" color="gray" outline onClick={() => handleOpenModal(cat)}>
                         <Icon icon="mdi:pencil" className="mr-1" /> {t('admin.editButton')}
                      </Button>
                      <Button size="xs" color="failure" outline onClick={() => handleDelete(cat.id)}>
                         <Icon icon="mdi:trash-can" className="mr-1" /> {t('admin.deleteButton')}
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>

        {/* Modal for Create/Edit */}
        <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Modal.Header>{editingCategory ? t('modal.titleEdit') : t('modal.titleCreate')}</Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
               <div>
                  <Label value={t('modal.labelName')} />
                  <TextInput 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder={t('modal.placeholderName')}
                  />
               </div>
               <div>
                  <Label value={t('modal.labelEmoji')} />
                  <div className="grid grid-cols-8 gap-2 mt-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                    {EMOJI_CHOICES.map(em => (
                      <button 
                        key={em}
                        type="button"
                        onClick={() => setFormData({...formData, emoji: em})}
                        className={`p-2 text-xl rounded-md transition-all ${formData.emoji === em ? 'bg-primary/20 scale-110 border border-primary' : 'hover:bg-gray-100'}`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
               </div>
               <div>
                  <Label value={t('modal.labelDescription')} />
                  <TextInput 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
               </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
             <Button color="success" onClick={handleCreateOrUpdate}>{t('modal.saveButton')}</Button>
             <Button color="gray" onClick={() => setIsModalOpen(false)}>{t('modal.cancelButton')}</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }

  // PUBLIC VIEW (Selection)
  return (
    <div className="flex flex-col gap-2">
      <Label value={t('public.label')} />
      <Select 
        value={selectedCategoryId || ""} 
        onChange={(e) => onChange && onChange(e.target.value)}
        required
      >
        <option value="" disabled>{t('public.placeholder')}</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.emoji || '🛍️'} {cat.name}
          </option>
        ))}
      </Select>
    </div>
  );
};

export default CategoryComponent;
