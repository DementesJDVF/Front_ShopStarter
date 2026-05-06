import React, { useEffect, useState } from 'react';
import { Card, Button, Badge } from 'flowbite-react';
import api from '../../utils/axios';
import RoleBasedMap from '../shared/RoleBasedMap';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

const ClienteHome = () => {
  const { t } = useTranslation('client');
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const results = await Promise.allSettled([
          api.get('products/get_products/'),
          api.get('products/get-categories/')
        ]);
        const prodResults = results[0].status === 'fulfilled' 
          ? results[0].value.data.results || results[0].value.data
          : [];
        const catResults = results[1].status === 'fulfilled' 
          ? results[1].value.data
          : [];
        setProducts(prodResults);
        setCategories(catResults);
      } catch (err: any) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-[var(--main-font)]">
      {/* Mapa en la parte superior */}
      <div className="h-[400px] md:h-[500px] bg-white dark:bg-slate-800">
        <RoleBasedMap />
      </div>

      {/* Sección de categorías */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase mb-8">
          {t('browseCategories')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat: any) => (
            <Card key={cat.id} className="p-4 cursor-pointer hover:scale-105 transition-all border-0 shadow-lg">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">{cat.emoji || '🏪'}</span>
                </div>
                <p className="font-black text-sm text-gray-800 dark:text-white">{cat.name}</p>
                <Badge color="gray" className="mt-2 text-xs">
                  {cat.product_count} {t('items')}
                </Badge>
              </div>
            </Card>
          ))}
        </div>

        {/* Productos destacados */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
              {t('featuredProducts')}
            </h2>
            <Button color="light" onClick={() => navigate('/cliente/browse')}>
              {t('seeAll')}
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-white/50 rounded-2xl">
              <p className="text-gray-500">{t('noProducts')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((product: any) => (
                <Card key={product.id} className="overflow-hidden hover:scale-[1.02] transition-all border-0 shadow-xl">
                  <div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-lg mb-4 flex items-center justify-center">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300';
                        }}
                      />
                    ) : (
                      <span className="text-4xl">🛍️</span>
                    )}
                  </div>
                  <h3 className="font-black text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-primary font-bold text-xl mb-2">
                    ${Number(product.price).toLocaleString()}
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge color="info" className="text-xs">
                      {product.vendor_name}
                    </Badge>
                    <Button 
                      size="sm"
                      onClick={() => navigate(`/cliente/browse/${product.id}`)}
                      className="rounded-xl"
                    >
                      {t('viewDetails')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClienteHome;
