import React, { useEffect, useState } from 'react';
import { Modal, Spinner, Card, Badge } from 'flowbite-react';
import { Icon } from '@iconify/react';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../StarRating/StarRating';

interface ProductImage {
  id: string;
  url_image: string | null;
  is_main: boolean;
  moderation_status: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: string | number;
  images: ProductImage[];
  category_name?: string;
}

/**
 * Sanitiza y completa la URL de la imagen.
 * Si es una ruta relativa, le añade el host del servidor.
 */
const getFullImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  
  // Obtener la base de la API y limpiar el sufijo /api/
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const baseUrl = apiUrl.replace(/\/api\/?$/, '');
  
  // Asegurar que no haya doble barra
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanUrl}`;
};

/** Picks the main image URL, falling back to the first approved image. */
const getProductImage = (images: ProductImage[]): string | null => {
  if (!Array.isArray(images) || (images?.length || 0) === 0) return null;
  const approved = images.filter(img => img.moderation_status !== 'REJECTED' && img.url_image);
  const main = approved.find(img => img.is_main);
  const rawUrl = (main ?? approved[0])?.url_image ?? null;
  return getFullImageUrl(rawUrl);
};

interface VendorCatalogModalProps {
  vendorId: string | null;
  isOpen: boolean;
  onClose: () => void;
  vendorName?: string;
}

const VendorCatalogModal: React.FC<VendorCatalogModalProps> = ({ vendorId, isOpen, onClose, vendorName }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (isOpen && vendorId) {
      fetchVendorProducts();
    } else {
      // Limpiar estado al cerrar el modal
      setProducts([]);
      setFetchError(false);
    }
  }, [isOpen, vendorId]);

  const fetchVendorProducts = async () => {
    try {
      setLoading(true);
      setFetchError(false);
      const res = await api.get(`products/catalog/?vendor=${vendorId}`);
      const payload = res.data;

      // Garantizar siempre un array: paginated → .results, array plano → directo, otro → []
      if (Array.isArray(payload?.results)) {
        setProducts(payload.results);
      } else if (Array.isArray(payload)) {
        setProducts(payload);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error cargando el catálogo:", error);
      setFetchError(true);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="3xl" dismissible>
      <Modal.Header>
        Catálogo de <span className="text-primary">{vendorName || 'Vendedor'}</span>
      </Modal.Header>
      <Modal.Body className="bg-gray-50/50 dark:bg-dark-light">
        {loading ? (
          <div className="flex justify-center items-center py-20">
             <Spinner size="xl" />
          </div>
        ) : fetchError ? (
          <div className="text-center py-20">
             <Icon icon="solar:danger-triangle-broken" className="mx-auto text-red-300 dark:text-red-500 mb-4" height={60}/>
             <p className="text-gray-500">Error al cargar el catálogo. Intenta de nuevo.</p>
          </div>
        ) : (products?.length || 0) === 0 ? (
          <div className="text-center py-20">
             <Icon icon="solar:box-minimalistic-broken" className="mx-auto text-gray-300 dark:text-gray-600 mb-4" height={60}/>
             <p className="text-gray-500">Este vendedor aún no ha publicado productos activos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <div className="h-40 bg-gray-100 dark:bg-gray-800 -m-4 mb-4 rounded-t-lg overflow-hidden flex items-center justify-center">
                    {(() => {
                      const imgUrl = getProductImage(product.images) ?? undefined;
                      return imgUrl
                        ? <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
                        : <Icon icon="solar:camera-broken" className="text-gray-300" height={40}/>;
                    })()}
                </div>
                <Badge color="light" size="xs" className="w-fit mb-2">
                    {product.category_name || 'General'}
                </Badge>
                <h5 className="text-md font-bold tracking-tight text-gray-900 dark:text-white line-clamp-1">
                  {product.name}
                </h5>
                <p className="font-normal text-gray-700 dark:text-gray-400 text-xs line-clamp-2 mt-1">
                  {product.description}
                </p>
                <div className="mt-4 flex justify-between items-center">
                    <span className="text-lg font-black text-primary">${parseFloat(product.price.toString()).toFixed(2)}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
        {vendorId && <StarRating vendorId={vendorId} interactive={!!user && user.role === 'CLIENTE'} token={token ?? undefined} username={user?.username} />}
      </Modal.Body>
    </Modal>
  );
};

export default VendorCatalogModal;
