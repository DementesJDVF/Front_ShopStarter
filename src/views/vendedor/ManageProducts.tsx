import React from 'react';
import { ProductTable } from '../../components/tables/ProductTable';
import { useTranslation } from 'react-i18next';

const ManageProducts = () => {
  const { t } = useTranslation('vendedor');
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark dark:text-white">{t('manage.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('manage.subtitle')}</p>
      </div>
      <ProductTable />
    </div>
  );
};

export default ManageProducts;