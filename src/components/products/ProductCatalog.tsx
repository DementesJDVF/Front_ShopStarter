import React, { useState, useEffect, useMemo } from 'react';
import { optimizeImageUrl } from '../../utils/imageOptimizer';
import { getAbsoluteImageUrl } from '../../utils/urlHelper';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Label, Select, Spinner, Modal } from 'flowbite-react';
import api from '../../utils/axios';
import { useMap } from '../../context/MapContext';
import { toast } from 'react-hot-toast';

type ApiProductImage = {
  id: number;
  url_image: string;
  is_main: boolean;
};

type ApiProduct = {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  status: string;
  vendor: string | number;
  vendor_name: string;
  category_name: string;
  is_featured: boolean;
  images: ApiProductImage[];
  created_at: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
};

export function ProductCatalog() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const navigate = useNavigate();
  const { t } = useTranslation('product');
  const { userLocation, radius, setRadius } = useMap();

  const openPreview = (url: string, title: string) => {
    setPreviewImage(url);
    setPreviewTitle(title);
  };

  const closePreview = () => {
    setPreviewImage(null);
    setPreviewTitle('');
  };

  const handleReserve = async (productId: number) => {
    if (!window.confirm(t('reserveConfirm'))) return;
    try {
      await api.post('orders/', { product: productId });
      toast.success(t('reserveSuccess'));
      loadData();
    } catch (e: any) {
      toast.error(e.response?.data?.error || t('reserveError'));
    }
  };

  const handleViewVendor = (vendorId: string | number, vendorName: string) => {
    navigate('/cliente/mapa', {
      state: { vendorId: String(vendorId), vendorName },
    });
  };

  async function loadData(lat?: number, lng?: number) {
    try {
      setLoading(true);
      setError(null);
      let prodUrl = 'products/catalog/';
      if (lat && lng) {
        const radiusValue = radius === 0 ? 500 : radius;
        prodUrl = `products/nearby/?lat=${lat}&lng=${lng}&radius=${radiusValue}`;
      }

      const results = await Promise.allSettled([
        api.get(prodUrl).catch(err => { 
          console.warn('Products API error:', err.message);
          return { status: 'rejected', reason: err, value: null };
        }),
        api.get('products/get-categories/').catch(err => { 
          console.warn('Categories API error:', err.message);
          return { status: 'rejected', reason: err, value: null };
        }),
      ]);

      const prodResult = results[0];
      const catResult = results[1];

      if (prodResult.status === 'fulfilled' && prodResult.value && 'data' in prodResult.value) {
        let prods = prodResult.value.data?.results || prodResult.value.data || [];
        setProducts(Array.isArray(prods) ? prods : []);
      } else {
        console.error('Error loading products:', (prodResult as any).reason);
        setProducts([]);
      }

      if (catResult.status === 'fulfilled' && catResult.value && 'data' in catResult.value) {
        const cats = catResult.value.data?.results || catResult.value.data || [];
        const catsArr = Array.isArray(cats) ? cats : [];
        setCategories(catsArr);
      } else {
        setCategories([]);
      }
    } catch (err: any) {
      setError('Error cargando productos. Por favor, intenta de nuevo.');
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      loadData();
    }
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadData(userLocation.lat, userLocation.lng);
    }
  }, [userLocation]);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter(p => {
      const catName = p.category_name || '';
      const catId = categories.find(c => String(c.id) === String(selectedCategory));
      return catName.toLowerCase().includes((catId?.name || selectedCategory).toLowerCase());
    });
  }, [products, selectedCategory, categories]);

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(price));
  };

  return (
    <div className="space-y-6 font-[var(--main-font)]">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="w-full sm:w-auto flex gap-4">
          <Select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="w-full sm:w-auto"
          >
            <option value="">{t('allCategories')}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.name}
              </option>
            ))}
          </Select>
          {userLocation && (
            <Button
              color="gray"
              size="sm"
              onClick={() => loadData(userLocation.lat, userLocation.lng)}
              disabled={loading}
            >
              Actualizar cerca
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{products.length}</span>
          <span>{t('productsFound')}</span>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner size="xl" color="info" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">No hay productos disponibles</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700"
          >
            <div className="relative h-48 bg-gray-100 dark:bg-slate-700 overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={optimizeImageUrl(getAbsoluteImageUrl(product.images[0].url_image), 400)}
                  alt={product.name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => openPreview(optimizeImageUrl(getAbsoluteImageUrl(product.images[0].url_image), 800), product.name)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Sin+Imagen';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-slate-700 cursor-pointer" onClick={() => openPreview('', product.name)}>
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {product.is_featured && (
                <Badge color="warning" className="absolute top-2 left-2">
                  Destacado
                </Badge>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all" />
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                  {product.name}
                </h3>
                {product.distance && (
                  <Badge color="info" className="text-xs">
                    {product.distance < 1000 ? `${Math.round(product.distance)}m` : `${(product.distance / 1000).toFixed(1)}km`}
                  </Badge>
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                {product.description}
              </p>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500">Por {product.vendor_name}</span>
                {product.stock !== undefined && (
                  <Badge color={product.stock > 0 ? 'success' : 'failure'} className="text-xs">
                    {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700">
                <span className="text-xl font-bold text-primary">{formatPrice(product.price)}</span>
                <Button
                  size="sm"
                  color="primary"
                  className="rounded-xl shadow-sm"
                  onClick={() => handleReserve(product.id)}
                  disabled={product.stock === 0}
                >
                  Reservar
                </Button>
              </div>
              <Button
                color="light"
                size="sm"
                className="w-full mt-2 rounded-xl"
                onClick={() => handleViewVendor(product.vendor, product.vendor_name)}
              >
                Ver catálogo
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal show={!!previewImage} onClose={closePreview} size="3xl" popup>
        <Modal.Header>
          <span className="p-4 font-bold text-gray-900 dark:text-white">{previewTitle || 'Vista previa'}</span>
        </Modal.Header>
        <Modal.Body className="p-2">
          <div className="flex justify-center bg-gray-50 dark:bg-slate-800 rounded-lg overflow-hidden">
            <img 
              src={previewImage || ''} 
              alt={previewTitle || 'Vista previa'} 
              className="max-h-[80vh] w-auto object-contain shadow-lg"
            />
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
