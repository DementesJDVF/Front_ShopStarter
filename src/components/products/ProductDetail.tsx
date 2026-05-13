import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import api from '../../utils/axios';
import { getAbsoluteImageUrl } from '../../utils/urlHelper';
import { optimizeImageUrl } from '../../utils/imageOptimizer';
import { Icon } from '@iconify/react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('product');

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await api.get('products/' + id + '/');
        setProduct(res.data);
        setError(null);
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Error al cargar el producto';
        setError(msg);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center p-20 font-[var(--main-font)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-20 text-red-500 font-[var(--main-font)]">
        <Icon icon="solar:danger-triangle-bold" className="text-6xl mb-4" />
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary hover:underline">
          Volver
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center p-20 font-[var(--main-font)]">
        Producto no encontrado
      </div>
    );
  }

  const mainImage = getAbsoluteImageUrl(
    product.images?.find((img: any) => img.is_main)?.url_image ||
    product.images?.[0]?.url_image
  );

  const stockNum = Number(product.stock || 0);
  const priceNum = Number(product.price || 0);
  const isOutOfStock = stockNum <= 0;
  const statusUpper = String(product.status || '').toUpperCase();
  const isNotAvailable = !product.status || !statusUpper.includes('AVAILABLE');
  const canPurchase = !isOutOfStock && !isNotAvailable;

  return (
    <div className="max-w-4xl mx-auto p-6 font-[var(--main-font)]">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center text-primary hover:underline">
        Volver
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-2xl p-6 md:p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-slate-900">
            {mainImage ? (
              <img src={optimizeImageUrl(mainImage, 800)} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 italic text-sm">
                Sin imagen
              </div>
            )}
            {isOutOfStock && (
              <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg">
                Sin stock
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">{product.name}</h1>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-black text-primary">${priceNum.toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-2xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Stock</p>
                  <p className={`text-xl font-black ${stockNum === 0 ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                    {stockNum} unidades
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-2xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Vendedor</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{product.vendor_name || 'N/A'}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Descripcion</p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{product.description || 'Sin descripcion disponible.'}</p>
              </div>

              {product.status && (
                <div className="mb-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    product.status === 'AVAILABLE'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : product.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {product.status}
                  </span>
                </div>
              )}
            </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
