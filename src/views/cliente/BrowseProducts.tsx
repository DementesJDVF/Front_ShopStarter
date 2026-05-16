import React from 'react';
import { ProductCatalog } from '../../components/products/ProductCatalog';
import { useTranslation } from 'react-i18next';

const BrowseProducts = () => {
  const { t } = useTranslation('client');

  return (
    <div className="p-6">
      <div className="mb-6 px-4">
        <h1 className="text-2xl font-bold text-dark dark:text-white font-[Outfit]">{t('browse.title')}</h1>
        <p className="text-black dark:text-white mt-2 text-lg font-bold">{t('browse.desc')}</p>
      </div>
      <ProductCatalog />
    </div>
  );
};

export default BrowseProducts;