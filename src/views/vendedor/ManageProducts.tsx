import React from 'react';
import { ProductTable } from '../../components/tables/ProductTable';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

const ManageProducts = () => {
  const { t } = useTranslation('vendedor');
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark dark:text-white">{t('manage.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('manage.subtitle')}</p>
      </div>
      <div className="mb-4">
        <button
          onClick={() => navigate('/vendedor/productos/crear')}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg"
        >
          + {t('product.addTitle')}
        </button>
      </div>
      <ProductTable />
    </div>
  );
};

export default ManageProducts;
