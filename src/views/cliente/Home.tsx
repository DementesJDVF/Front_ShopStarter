import React, { useEffect, useState } from 'react';
import { Card, Button, Spinner, Badge } from 'flowbite-react';
import { Icon } from '@iconify/react';
import api from '../../utils/axios';
import RoleBasedMap from '../shared/RoleBasedMap';
import { useNavigate } from 'react-router';
import AOS from 'aos';
import { useTranslation } from 'react-i18next';

const ClienteHome = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation('client');

  useEffect(() => {
    AOS.refresh();
    const fetchCategories = async () => {
      try {
        const res = await api.get('products/get-categories/');
        const data = res.data.results || res.data;
        setCategories(data.filter((v: any, i: number, a: any[]) => a.findIndex(t => t.name === v.name) === i));
      } catch (err) {
        console.error("Error al obtener las categorías", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="flex flex-col gap-10 pb-20 overflow-x-hidden">

      {/* 🚀 Sección Hero */}
      <section className="relative h-[450px] flex items-center justify-center text-center overflow-hidden bg-gray-900 rounded-3xl mx-6 mt-6 shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-40 scale-110 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
        </div>
        <div className="relative z-10 px-4 max-w-3xl" data-aos="fade-up">
          <Badge color="primary" className="mb-4 mx-auto w-fit uppercase tracking-widest font-black px-4 py-1.5 rounded-full border-2 border-primary/20 bg-primary/10">
            {t('home.welcome_badge')}
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-[0.9]">
            {t('home.hero_title_line1')} <br/>
            <span className="text-primary italic">{t('home.hero_title_line2')}</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl font-medium mb-8 max-w-2xl mx-auto opacity-80">
            {t('home.hero_desc')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="xl" className="rounded-2xl font-black px-8 py-2 bg-primary hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
              onClick={() => navigate('/cliente/productos')}
            >
              {t('home.go_catalog')}
              <Icon icon="solar:arrow-right-bold-duotone" className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* 🏷️ Sección de Categorías */}
      <section className="px-6" data-aos="fade-up" data-aos-delay="200">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight uppercase"
              dangerouslySetInnerHTML={{ __html: t('home.categories_title') }} />
            <p className="text-gray-500">{t('home.categories_subtitle')}</p>
          </div>
          <Button color="gray" outline pill className="font-bold border-2" onClick={() => navigate('/cliente/productos')}>
            {t('home.see_all')}
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 dark:bg-white/5 animate-pulse rounded-3xl"></div>
            ))
          ) : (
            categories.slice(0, 6).map((cat, index) => (
              <div 
                key={cat.id} 
                onClick={() => navigate('/cliente/productos')}
                className="group relative h-40 bg-white dark:bg-dark-light rounded-3xl p-6 flex flex-col items-center justify-center transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20"
                data-aos="zoom-in"
                data-aos-delay={index * 50}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                <span className="text-5xl mb-3 group-hover:scale-125 transition-transform duration-500 drop-shadow-lg z-10">{cat.emoji || '🛍️'}</span>
                <span className="text-sm font-black text-gray-700 dark:text-gray-200 text-center z-10 group-hover:text-primary transition-colors uppercase tracking-tight">{cat.name}</span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 🗺️ Sección del Mapa Interactivo */}
      <section className="px-6" data-aos="fade-up">
        <div className="bg-white dark:bg-dark-light rounded-[40px] p-8 shadow-2xl border border-gray-50 dark:border-gray-800 flex flex-col lg:flex-row gap-10">
          <div className="lg:w-1/3 flex flex-col justify-center">
            <Badge color="warning" className="w-fit mb-4">{t('home.map_badge')}</Badge>
            <h3 className="text-4xl font-black text-gray-800 dark:text-white leading-tight mb-4 uppercase"
              dangerouslySetInnerHTML={{ __html: t('home.map_title') }} />
            <p className="text-gray-500 mb-8 leading-relaxed">
              {t('home.map_desc')}
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-300">
                <Icon icon="solar:check-circle-bold-duotone" className="text-emerald-500" height={22} />
                {t('home.map_list1')}
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-300">
                <Icon icon="solar:check-circle-bold-duotone" className="text-emerald-500" height={22} />
                {t('home.map_list2')}
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-300">
                <Icon icon="solar:check-circle-bold-duotone" className="text-emerald-500" height={22} />
                {t('home.map_list3')}
              </li>
            </ul>
            <Button color="dark" size="lg" className="rounded-2xl font-black"
              onClick={() => navigate('/cliente/mapa')}
            >
              {t('home.open_map')}
            </Button>
          </div>
          <div className="lg:w-2/3 h-[500px] rounded-3xl overflow-hidden shadow-inner border border-gray-100 dark:border-gray-800">
            <RoleBasedMap />
          </div>
        </div>
      </section>

      {/* 🛍️ Llamada a la Acción Final */}
      <section className="px-6 text-center" data-aos="fade-up">
        <div className="bg-gradient-to-r from-[#2CD4D9] via-[#3A17E4] to-[#0A014A] dark:bg-none dark:bg-primary py-20 rounded-[50px] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mt-32 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -mr-32 -mb-32"></div>
          
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter">
            {t('home.call_to_action_title')}
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto font-medium">
            {t('home.call_to_action_desc')}
          </p>
          <Button color="light" size="xl" className="mx-auto rounded-2xl font-black px-12 border-0 shadow-2xl text-primary"
            onClick={() => navigate('/cliente/productos')}
          >
            {t('home.go_catalog')}
          </Button>
        </div>
      </section>

    </div>
  );
};

export default ClienteHome;