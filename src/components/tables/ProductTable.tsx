import { Badge, Dropdown, Progress, Table, Spinner, Button, Modal, Label, TextInput, Select, Textarea, FileInput, Tooltip, ToggleSwitch } from "flowbite-react";
import { resizeImageForAI } from "../../utils/clientResizer";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Icon } from "@iconify/react";
import React, { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router";
import api from "../../utils/axios";
import ImagePreviewModal from "../shared/ImagePreviewModal";
import { useTranslation } from "react-i18next";
import { generateAIDescription } from "../../services/aiService";
// ===== NUEVO: Sprint IA y Funcionalidad =====
import IAErrorAlert from "../ia/IAErrorAlert";
import IACriticalBadge from "../ia/IACriticalBadge";
// ===== FIN NUEVO =====
import { optimizeImageUrl } from "../../utils/imageOptimizer";
import { useConfirm } from "../../context/ConfirmContext";
import { showSuccessAlert, showErrorAlert, showWarningAlert } from "../../utils/Alerts";

interface Product {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  status: string;
  stock: boolean;
  categories: Array<{ id: number; name: string }>;
  category_names: string[];
  images: Array<{ url_image: string; is_main: boolean }>;
  is_deleted?: boolean;
}

interface Category {
  id: string | number;
  name: string;
}

const PLACEHOLDER_IMAGE = "https://placehold.co/400x400?text=Imagen+no+disponible";

const MemoizedTableBody = memo(({ products, t, openPreview, handleDelete, handleEdit, navigate, tableActionData, handleToggleStock, togglingId }: any) => (
  <Table.Body className="divide-y divide-border dark:divide-darkborder">
    {products.length === 0 ? (
      <Table.Row>
        <Table.Cell colSpan={5} className="text-center py-10 opacity-50">
          {t('table.noProducts')}
        </Table.Cell>
      </Table.Row>
    ) : (
      products.map((product: any, index: number) => (
        <Table.Row key={product.id || index}>
          <Table.Cell className="whitespace-nowrap ps-6">
            <div className="flex gap-3 items-center">
              <img
                src={optimizeImageUrl(product.images?.[0]?.url_image || PLACEHOLDER_IMAGE, 200)}
                alt="product"
                className="h-[60px] w-[60px] rounded-md object-cover shadow-sm bg-gray-50 cursor-zoom-in"
                onError={(e: any) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
                onClick={() => openPreview(product.images?.[0]?.url_image || PLACEHOLDER_IMAGE, product.name)}
              />
              <div className="truncat line-clamp-2 sm:text-wrap max-w-56">
                <h6 className="text-sm font-semibold">{product.name}</h6>
              </div>
            </div>
          </Table.Cell>
<Table.Cell>
             <div className="flex gap-1 flex-wrap">
               {product.category_names && product.category_names.length > 0 ? (
                 product.category_names.map((cn: string, i: number) => (
                   <Badge key={i} color="info" className="capitalize text-[10px]">{cn}</Badge>
                 ))
               ) : (
                 <Badge color="gray">{t('table.category.none')}</Badge>
               )}
             </div>
           </Table.Cell>
          <Table.Cell>
            <h5 className="text-base font-bold text-wrap">
              ${parseFloat(product.price.toString()).toLocaleString()}
            </h5>
            <div className="flex items-center gap-2 mt-2">
              <ToggleSwitch
                checked={product.stock}
                label=""
                onChange={() => handleToggleStock(product.id)}
                disabled={togglingId === product.id}
                sizing="sm"
              />
              <Badge color={product.stock ? "success" : "failure"} className="w-fit">
                {product.stock ? t('table.inStock') : t('table.outOfStock')}
              </Badge>
            </div>
          </Table.Cell>
          <Table.Cell>
            <Badge
              color={product.status==='AVAILABLE'?'success':
                product.status==='PENDING'||product.status==='RESERVED'?'warning':
                product.status==='REJECTED'?'failure':'lightsecondary'}
              className={product.status==='PENDING'||product.status==='RESERVED'?'uppercase rounded-lg px-3 py-1 font-bold text-black':
                'uppercase rounded-lg px-3 py-1 font-bold'}
            >
              {t('table.status.'+product.status)}
            </Badge>
          </Table.Cell>
          <Table.Cell>
            <Dropdown
              label=""
              dismissOnClick={true}
              renderTrigger={() => (
                <span className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
                  <HiOutlineDotsVertical size={22} />
                </span>
              )}
            >
              {tableActionData.map((items: any, index: number) => (
                <Dropdown.Item
                  key={index}
                  className="flex gap-3"
                  onClick={() => {
                    if (items.listtitle === "Borrar") {
                      handleDelete(product.id);
                    } else if (items.listtitle === "Editar") {
                      handleEdit(product);
                    } else if (items.listtitle === "Ver Detalle") {
                      navigate(`/app/products/${product.id}`);
                    }
                  }}
                >
                  <Icon icon={`${items.icon}`} height={18} />
                  <span>
                    {items.listtitle === "Borrar" ? t('table.action.delete')
                      : items.listtitle === "Editar" ? t('table.action.edit')
                        : items.listtitle === "Ver Detalle" ? t('table.action.view')
                          : items.listtitle
                    }
                  </span>
                </Dropdown.Item>
              ))}
            </Dropdown>
          </Table.Cell>
        </Table.Row>
      ))
    )}
  </Table.Body>
));

const ProductTable = () => {
  const { t } = useTranslation("productTable");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [togglingId, setTogglingId] = useState<string | number | null>(null);
  const navigate = useNavigate();
  const confirm = useConfirm();

  // Estados para el visor de imágenes
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const openPreview = (url: string, title: string) => {
    setPreviewUrl(url);
    setPreviewTitle(title);
    setIsPreviewOpen(true);
  };

const [newProduct, setNewProduct] = useState({
     name: '',
     description: '',
     price: '',
     stock: true as boolean,
     categories: [] as number[],
     image_file: null as File | null,
     preview_url: ''
   });

  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('products/create/');
      setProducts(response.data.results || response.data);
    } catch (error) {
      console.error(t('fetch.errorProducts'), error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('products/get-categories/');
      console.log(t('fetch.categoriesLoaded'), response.data);

      let cats: Category[] = [];
      const data = response.data;

      if (Array.isArray(data)) {
        cats = data;
      } else if (data && data.results && Array.isArray(data.results)) {
        cats = data.results;
      }

      setCategories(cats.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i));
      if (cats.length === 0) {
        console.warn(t('fetch.noCategories'));
      }
    } catch (error: any) {
      console.error(t('fetch.errorCategories'), error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();

    // Cleanup de URLs de previsualización al desmontar
    return () => {
      if (newProduct.preview_url && newProduct.preview_url.startsWith('blob:')) {
        URL.revokeObjectURL(newProduct.preview_url);
      }
    };
  }, []);

  // Cleanup de URL anterior cuando cambia la imagen
  useEffect(() => {
    return () => {
      // Este efecto se ejecuta antes de que preview_url cambie o el componente se desmonte
    };
  }, [newProduct.preview_url]);

  const handleDelete = async (id: string | number) => {
    const confirmed = await confirm(t('confirm.delete'), { isDestructive: true });
    if (!confirmed) return;
    try {
      await api.delete(`products/create/${id}/`);
      showSuccessAlert(t('alert.deleteSuccess', 'Producto eliminado'));
      fetchProducts();
    } catch (error) {
      console.error(t('error.deleteProduct'), error);
      showErrorAlert(t('alert.deleteError'));
    }
  };

  const handleToggleStock = async (id: string | number) => {
    setTogglingId(id);
    // Actualización optimista en UI
    setProducts(prev =>
      prev.map(p => p.id === id ? { ...p, stock: !p.stock } : p)
    );
    try {
      const res = await api.patch(`products/create/${id}/toggle-stock/`);
      // Sincronizar con el valor real del servidor
      setProducts(prev =>
        prev.map(p => p.id === id ? { ...p, stock: res.data.stock } : p)
      );
    } catch (error: any) {
      // Revertir si hubo error
      setProducts(prev =>
        prev.map(p => p.id === id ? { ...p, stock: !p.stock } : p)
      );
      showErrorAlert(error.response?.data?.detail || 'No se pudo cambiar la disponibilidad.');
    } finally {
      setTogglingId(null);
    }
  };

   const handleEdit = (product: Product) => {
     setEditingId(product.id);
     setNewProduct({
       name: product.name,
       description: product.description || '',
       price: product.price.toString(),
       stock: product.stock,
       categories: product.categories?.map(c => c.id) || [],
       image_file: null,
       preview_url: product.images?.[0]?.url_image || ''
     });
     setShowModal(true);
   };

  const handleSuggestAI = async () => {
    const hasImage = newProduct.image_file || newProduct.preview_url;
    if (!hasImage) {
      showWarningAlert(t('form.selectImageFirst'));
      return;
    }

    setGeneratingAI(true);
    setAiError(null);

    try {
      const formData = new FormData();
      if (newProduct.image_file) {
        formData.append('image_file', newProduct.image_file);
      } else {
        formData.append('image_url', newProduct.preview_url);
      }

      if (editingId) {
        formData.append('product_id', editingId.toString());
      }

      const result = await generateAIDescription(formData);

      // Efecto Typewriter para fluidez máxima
      let currentText = "";
      const words = result.split(" ");
      for (let i = 0; i < words.length; i++) {
        currentText += words[i] + (i < words.length - 1 ? " " : "");
        setNewProduct(prev => ({ ...prev, description: currentText }));
        await new Promise(r => setTimeout(r, 40)); // Pequeña pausa entre palabras
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('alert.aiError');
      console.error(t('error.ai'), err);
      showErrorAlert(message);
      setAiError(message);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
const data: any = {
         name: newProduct.name,
         description: newProduct.description,
         price: parseFloat(newProduct.price),
         stock: newProduct.stock,
         categories: newProduct.categories,
       };

      if (newProduct.image_file) {
        const base64 = await toBase64(newProduct.image_file);
        data.images = [{ url_image: base64, is_main: true }];
      } else if (!editingId) {
        showWarningAlert(t('form.imageRequired'));
        setSubmitting(false);
        return;
      }

      if (editingId) {
        await api.put(`products/create/${editingId}/`, data);
      } else {
        await api.post('products/create/', data);
      }

      setShowModal(false);
      setEditingId(null);
setNewProduct({
         name: '',
         description: '',
         price: '',
         stock: true,
         categories: [],
         image_file: null,
         preview_url: ''
       });
       showSuccessAlert(editingId ? "Producto actualizado correctamente" : "Producto creado correctamente");
      fetchProducts();
    } catch (error: any) {
      const backendError = error.response?.data;
      let errorMessage = t('alert.processError');

      if (backendError) {
        // Si el backend devuelve un objeto de errores, extraemos el primer mensaje legible
        const firstError: any = Object.values(backendError)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : (typeof firstError === 'string' ? firstError : JSON.stringify(firstError));
      }

      console.error(t('error.processProduct'), error);
      showErrorAlert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  /*Table Action*/
  const tableActionData = [
    {
      icon: "solar:eye-outline",
      listtitle: "Ver Detalle",
    },
    {
      icon: "solar:pen-new-square-broken",
      listtitle: "Editar",
    },
    {
      icon: "solar:trash-bin-trash-outline",
      listtitle: "Borrar",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center p-10 font-[var(--main-font)]">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
        <div className="flex justify-between items-center mb-4 font-[var(--main-font)]">
            <h5 className="card-title text-xl font-bold">{t('table.title')}</h5>
            <div className="flex gap-2">
              <Button color="primary" onClick={() => {
                setEditingId(null);
                 setNewProduct({
                   name: '',
                   description: '',
                   price: '',
                   stock: true,
                   categories: [],
                   image_file: null,
                   preview_url: ''
                 });
                setShowModal(true);
              }}>
                <div className="flex items-center gap-2">
                  <Icon icon="solar:add-circle-outline" height={20} />
                  <span>{t('action.addProduct')}</span>
                </div>
              </Button>
            </div>
        </div>
        <div className="mt-3">
          <div className="overflow-x-auto font-[var(--main-font)]">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell className="p-6">{t('table.head.product')}</Table.HeadCell>
                <Table.HeadCell>{t('table.head.category')}</Table.HeadCell>
                <Table.HeadCell>{t('table.head.priceStock')}</Table.HeadCell>
                <Table.HeadCell>{t('table.head.status')}</Table.HeadCell>
                <Table.HeadCell></Table.HeadCell>
              </Table.Head>
              <MemoizedTableBody
                products={products}
                t={t}
                openPreview={openPreview}
                handleDelete={handleDelete}
                handleEdit={handleEdit}
                navigate={navigate}
                PLACEHOLDER_IMAGE={PLACEHOLDER_IMAGE}
                tableActionData={tableActionData}
                handleToggleStock={handleToggleStock}
                togglingId={togglingId}
              />
            </Table>
          </div>
        </div>
      </div>

      {/* Modal para añadir producto */}
      <Modal show={showModal} onClose={() => { setShowModal(false); setEditingId(null); }} size="md">
        <Modal.Header>{editingId ? t('modal.editHeader') : t('modal.addHeader')}</Modal.Header>
        <Modal.Body>
          <form className="flex flex-col gap-4" onSubmit={handleCreate}>
            {/* 1. Nombre */}
            <div>
              <Label htmlFor="name" value={t('form.name')} />
              <TextInput
                id="name"
                required
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </div>

            {/* 2. Imagen y Preview */}
            <div>
              <Label htmlFor="image" value={t('form.image')} />
              <FileInput
                id="image"
                accept="image/*"
                required={!editingId}
                helperText={t('form.image.helper')}
                onChange={async (e) => {
                  if (e.target.files?.[0]) {
                    const originalFile = e.target.files[0];
                    try {
                      // Redimensionar en el cliente para proteger la RAM de Railway
                      const resizedBlob = await resizeImageForAI(originalFile);
                      const file = new File([resizedBlob], originalFile.name, { type: 'image/jpeg' });

                      // Revocar URL anterior si existe para liberar memoria
                      if (newProduct.preview_url && newProduct.preview_url.startsWith('blob:')) {
                        URL.revokeObjectURL(newProduct.preview_url);
                      }
                      setNewProduct({
                        ...newProduct,
                        image_file: file,
                        preview_url: URL.createObjectURL(file)
                      });
                    } catch (err) {
                      console.error("Error al redimensionar imagen:", err);
                      setNewProduct({
                        ...newProduct,
                        image_file: originalFile,
                        preview_url: URL.createObjectURL(originalFile)
                      });
                    }
                  }
                }}
              />
              {newProduct.preview_url && (
                <div className="mt-2 text-center">
                  <img
                    src={newProduct.preview_url}
                    alt="preview"
                    className="h-32 mx-auto rounded-lg border shadow-sm object-cover"
                    onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
                  />
                </div>
              )}
            </div>

            {/* ===== NUEVO: Sprint IA y Funcionalidad ===== */}
            <IAErrorAlert visible={!!aiError} mensaje={aiError || "Error en el servicio de IA"} />
            <div className="flex justify-center mt-1"><IACriticalBadge label="Descripcion IA" severity="alta" /></div>
            {/* ===== FIN NUEVO ===== */}

            {/* 3. Botón IA */}
            <div className="flex justify-center">
              <Tooltip
                content={!newProduct.image_file && !newProduct.preview_url ? "Sube una imagen para habilitar la sugerencia de IA" : "Generar descripción automática"}
                placement="top"
              >
                <Button
                  color="light"
                  pill
                  size="sm"
                  onClick={handleSuggestAI}
                  disabled={generatingAI || (!newProduct.image_file && !newProduct.preview_url)}
                >
                  {generatingAI ? (
                    <><Spinner size="sm" className="mr-2" /> {t('ai.processing')}</>
                  ) : (
                    <><Icon icon="solar:magic-stick-3-bold-duotone" className="mr-2 text-indigo-500" /> {t('ai.suggest')}</>
                  )}
                </Button>
              </Tooltip>
            </div>

            {/* 4. Descripción */}
            <div>
              <Label htmlFor="description" value={t('form.descriptionLabel')} />
              <Textarea
                id="description"
                required
                rows={4}
                value={newProduct.description}
                placeholder={t('form.descriptionPlaceholder')}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
            </div>

            {/* 5. Precio / Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" value={t('form.price')} />
                <TextInput
                  id="price"
                  type="number"
                  required
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="stock" value={t('table.availability')} />
                <div className="mt-2">
                  <ToggleSwitch
                    id="stock"
                    checked={newProduct.stock}
                    label={newProduct.stock ? t('table.inStock') : t('table.outOfStock')}
                    onChange={(val) => setNewProduct({...newProduct, stock: val})}
                  />
                </div>
              </div>
            </div>

{/* 6. Categorías */}
             <div>
               <Label htmlFor="categories" value={t('form.categories')} />
               <div className="flex flex-wrap gap-2 mt-1">
                 {categories.map((cat) => (
                   <label key={cat.id} className="flex items-center gap-1 cursor-pointer">
                     <input
                       type="checkbox"
                       checked={newProduct.categories.includes(Number(cat.id))}
                       onChange={(e) => {
                         const updated = e.target.checked
                           ? [...newProduct.categories, Number(cat.id)]
                           : newProduct.categories.filter(id => id !== Number(cat.id));
                         setNewProduct({ ...newProduct, categories: updated });
                       }}
                       className="rounded"
                     />
                     <span className="text-sm">{cat.name}</span>
                   </label>
                 ))}
               </div>
             </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button color="gray" onClick={() => setShowModal(false)}>{t('form.cancel')}</Button>
              <Button color="primary" type="submit" disabled={submitting}>
                {submitting ? <Spinner size="sm" /> : t('form.save')}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
      <ImagePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        imageUrl={previewUrl}
        title={previewTitle}
      />
    </>
  );
};

export { ProductTable };