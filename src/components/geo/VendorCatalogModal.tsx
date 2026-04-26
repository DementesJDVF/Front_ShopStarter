import React, { useEffect, useState } from 'react';
import { Modal, Card, Badge, Spinner, Button } from 'flowbite-react';
import { Icon } from '@iconify/react';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import { getProductImage, getFullImageUrl } from '../../utils/imageHelpers';
import StarRating from '../StarRating/StarRating';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_name: string;
  images: any[];
  stock: number;
}

interface VendorCatalogModalProps {
  vendorId: string | null;
  isOpen: boolean;
  onClose: () => void;
  vendorName?: string;
}

const VendorCatalogModal: React.FC<VendorCatalogModalProps> = ({ vendorId, isOpen, onClose, vendorName }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && vendorId) {
      fetchVendorProducts();
    } else {
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

  const handleBuy = async (productId: string) => {
    if (!user) {
      toast.error("Inicia sesión para comprar.");
      return;
    }
    try {
      setBuyingId(productId);
      await api.post('orders/', { product: productId, quantity: 1 });
      toast.success("¡Producto reservado! Tienes 15 minutos para concretar la compra con el vendedor.");
      // Refrescar para ver si el stock cambió
      await fetchVendorProducts();
    } catch (error: any) {
      const msg = error.response?.data?.error || "Error al procesar la compra.";
      toast.error(msg);
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="4xl" dismissible>
      <Modal.Header className="border-b-0 pb-0">
        <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
                <Icon icon="solar:shop-2-bold-duotone" className="text-primary" height={24} />
            </div>
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">
                Catálogo de <span className="text-primary">{vendorName || 'Vendedor'}</span>
            </h2>
        </div>
      </Modal.Header>
      <Modal.Body className="bg-gray-50/30">
        {loading ? (
          <div className="flex justify-center items-center py-20">
             <Spinner size="xl" color="info" />
          </div>
        ) : fetchError ? (
          <div className="text-center py-20">
             <Icon icon="solar:danger-triangle-broken" className="mx-auto text-red-300 mb-4" height={60}/>
             <p className="text-gray-500 font-bold">Error al cargar el catálogo.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
             <Icon icon="solar:box-minimalistic-broken" className="mx-auto text-gray-300 mb-4" height={60}/>
             <p className="text-gray-400 font-medium">Este vendedor no tiene productos disponibles en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="border-none shadow-xl rounded-3xl overflow-hidden hover:scale-[1.02] transition-transform">
                <div className="flex flex-col md:flex-row gap-4 h-full">
                    <div className="w-full md:w-1/3 h-48 md:h-full bg-gray-100 rounded-2xl overflow-hidden relative">
                        <img 
                          src={getFullImageUrl(getProductImage(product.images))} 
                          alt={product.name} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute top-2 left-2">
                            <Badge color="info" className="rounded-lg font-bold shadow-sm">
                                {product.category_name}
                            </Badge>
                        </div>
                    </div>
                    <div className="w-full md:w-2/3 flex flex-col justify-between py-2">
                        <div>
                            <h3 className="text-lg font-black text-gray-800 line-clamp-1">{product.name}</h3>
                            <p className="text-gray-500 text-sm line-clamp-3 mt-2 font-medium leading-relaxed">
                                {product.description}
                            </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-2xl font-black text-indigo-600">
                                ${parseFloat(product.price.toString()).toLocaleString()}
                            </span>
                            {user?.role === 'CLIENTE' && (
                                <Button 
                                  size="sm" 
                                  color="indigo" 
                                  className="rounded-xl font-bold shadow-lg shadow-indigo-200"
                                  onClick={() => handleBuy(product.id)}
                                  disabled={buyingId === product.id}
                                >
                                    {buyingId === product.id ? <Spinner size="xs" /> : "COMPRAR"}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        <div className="mt-8 pt-8 border-t border-gray-100">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Reputación del Vendedor</h3>
            {vendorId && (
                <StarRating 
                    vendorId={vendorId} 
                    interactive={!!user && user.role === 'CLIENTE'} 
                    username={user?.username} 
                />
            )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default VendorCatalogModal;
