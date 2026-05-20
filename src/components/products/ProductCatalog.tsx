import React, { useEffect, useState, useMemo } from "react";
import { optimizeImageUrl } from "../../utils/imageOptimizer";
import { getAbsoluteImageUrl } from "../../utils/urlHelper";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Badge, Button, Label, Select, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import "./ProductCatalog.css";
import api from "../../utils/axios";
import ImagePreviewModal from "../shared/ImagePreviewModal";
import { useMap } from "../../context/MapContext";
import { useConfirm } from "../../context/ConfirmContext";
import { showSuccessAlert, showErrorAlert } from "../../utils/Alerts";

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
  stock: boolean;
  status: string;
  vendor: string | number;
  vendor_name: string;
  categories: Array<{ id: number; name: string }>;
  category_names: string[];
  is_featured: boolean;
  images: ApiProductImage[];
  created_at: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
};

export function ProductCatalog() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation("product");

  const { userLocation, radius, setRadius } = useMap();
  const confirm = useConfirm();

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const openPreview = (url: string, title: string) => {
    setPreviewUrl(url);
    setPreviewTitle(title);
    setIsPreviewOpen(true);
  };

  const handleReserve = async (productId: number) => {
    const confirmed = await confirm(t("reserveConfirm"));
    if (!confirmed) return;
    try {
      await api.post('orders/', { product: productId, quantity : 1 });
      showSuccessAlert(t("reserveSuccess"));
      loadData(userLocation?.lat, userLocation?.lng, radius);
    } catch (e: any) {
      showErrorAlert(e.response?.data?.error || t("reserveError"));
    }
  };




  async function loadData(lat?: number, lng?: number, currentRadius?: number) {
    try {
      setLoading(true);
      setError(null);
      let prodUrl = "products/catalog/";
      if (lat && lng) {
        const r = currentRadius && currentRadius > 0 ? currentRadius : 12742;
        prodUrl = `products/nearby/?lat=${lat}&lng=${lng}&radius=${r}`;
      }
      const [prodRes, catRes] = await Promise.all([
        api.get(prodUrl),
        api.get("products/get-categories/")
      ]);
      let prods = prodRes.data.results || prodRes.data;
      setProducts(prods);
      const cats = catRes.data.results || catRes.data;
      setCategories(cats.filter((v: any, i: number, a: any[]) => a.findIndex((t: any) => t.name === v.name) === i));
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || t("serverError"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(userLocation?.lat, userLocation?.lng, radius);
  }, [userLocation, radius]);

  // Filtrado reactivo optimizado — soporta múltiples categorías
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const categoryMatch =
        selectedCategories.length === 0 ||
        p.categories?.some((c: any) => selectedCategories.includes(c.id));
      const distanceMatch = radius === 0 || (p.distance !== undefined && p.distance <= radius);
      return categoryMatch && distanceMatch;
    });
  }, [products, selectedCategories, radius]);

  const toggleCategory = (catId: number) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const clearCategories = () => {
    setSelectedCategories([]);
  };

  if (loading) return (
    <div className="flex justify-center p-20 font-[var(--main-font)]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  );

  if (error) return (
    <div className="text-center p-20 text-red-500 font-[var(--main-font)]">
      <p>Error: {error}</p>
      <Button color="gray" className="mt-4 mx-auto" onClick={() => loadData()}>{t("retry")}</Button>
    </div>
  );

  return (
    <section className="catalog font-[var(--main-font)]">
      <div className="mb-8 border-b border-primary dark:border-gray-300 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{t("catalogTitle")}</h2>
            <p className="text-black dark:text-white mt-2 text-lg font-bold">{t("catalogSub")}</p>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-auto">
            {userLocation && (
              <div className="flex items-center gap-2 mt-2">
                <Label htmlFor="radius" value={t("filterByDistance")} className="text-xs whitespace-nowrap" />
                <Select id="radius" sizing="sm" value={radius} onChange={(e) => setRadius(parseInt(e.target.value))}>
                  <option value={0}>{t("anyDistance")}</option>
                  <option value={5}>{t("lessThan5")}</option>
                  <option value={10}>{t("lessThan10")}</option>
                  <option value={20}>{t("lessThan20")}</option>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Filtros de Categoría — multi-select con chips */}
        <div className="flex gap-2 mt-8 overflow-x-auto pb-2 scrollbar-hide flex-wrap items-center">
          <button
            onClick={clearCategories}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${selectedCategories.length === 0
                ? 'bg-primary text-white border-b border-white shadow-lg shadow-black/50 scale-105'
                : 'bg-gray-50 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-600'
              }`}
          >
            {t("all")}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${selectedCategories.includes(cat.id)
                  ? 'bg-primary text-white border-b border-white shadow-lg shadow-black/50 scale-105'
                  : 'bg-gray-50 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-600'
                }`}
            >
              {cat.name}
            </button>
          ))}
          {selectedCategories.length > 0 && (
            <button
              onClick={clearCategories}
              className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition-all ml-2"
            >
              <Icon icon="solar:trash-bin-minimalistic-linear" height={18} />
              {t("clear", "Quitar categorías")}
            </button>
          )}
        </div>
      </div>

      <div className="catalog__grid">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400 italic bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
            {t("noProducts")}
          </div>
        ) : (
          filteredProducts.map((p) => {
            const rawImage = p.images?.find((img) => img.is_main)?.url_image || p.images?.[0]?.url_image;
            const mainImage = getAbsoluteImageUrl(rawImage);
            const isOutOfStock = !p.stock;
            return (
              <article key={p.id} className={`product-card group hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden border border-gray-100`}>
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  {mainImage ? (
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                      src={optimizeImageUrl(mainImage, 600)}
                      alt={p.name}
                      onClick={() => openPreview(mainImage, p.name)}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 italic text-sm">
                      {t("noImage")}
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
                    {/* Multi-category badges on product card */}
                    {p.categories && p.categories.length > 0 ? (
                      <div className="flex gap-1 flex-wrap max-w-[100%]">
                        {p.categories.map((cat: any) => (
                          <span key={cat.id} className="bg-info text-white backdrop-blur px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-primary shadow-sm truncate">
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                        {t("uncategorized", "Sin categoría")}
                      </span>
                    )}
                    {isOutOfStock && (
                      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-red-500/30">
                        {t("outOfStock")}
                      </div>
                    )}
                    {p.status?.toUpperCase() === 'RESERVED' && (
                      <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-yellow-500/30">
                        {t("reserved")}
                      </div>
                    )}
                    {p.status?.toUpperCase() === 'SOLD' && (
                      <div className="bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-green-600/30">
                        {t("sold")}
                      </div>
                    )}
                  </div>

                  {p.distance !== undefined && (
                    <div className="absolute top-3 right-3 bg-gray-100 dark:bg-gray-900 backdrop-blur px-3 py-1 rounded-full
                      text-[10px] font-bold text-black dark:text-white shadow-sm flex items-center gap-1 z-20">
                      <Icon icon="solar:map-point-linear" className="text-black dark:text-white" />
                      {p.distance} km
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white line-clamp-1 flex-1">{p.name}</h3>
                  </div>

                  <p className="text-black dark:text-white text-sm line-clamp-2 min-h-[40px] font-medium">
                    {p.description}
                  </p>

                  <div className="text-xl font-black text-primary dark:text-gray-100 min-w-0 truncate">
                    ${parseFloat(p.price).toLocaleString()}
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-900 dark:border-gray-50">

                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        className="bg-gray-50 dark:bg-darkgray text-gray-900 dark:text-gray-50 p-2.5 rounded-xl
                          hover:bg-gray-300 dark:hover:bg-gray-800 transition-all duration-300 border border-gray-400
                          dark:border-gray-700 shadow-sm"
                        title={t("viewDetail")}
                        onClick={() => navigate(`/app/products/${p.id}`)}
                      >
                        <Icon icon="solar:eye-linear" height={22} />
                      </button>

                      <button
                        className={`p-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs font-black flex-1 uppercase tracking-tight
                          bg-primary text-white hover:bg-indigo-700 shadow-primary/20 cursor-pointer active:scale-95`}
                        onClick={() => handleReserve(p.id)}
                        title={t("res_now")}
                      >
                        <Icon icon={"solar:calendar-mark-bold-duotone"} height={22} />
                        <span>{t("res_now")}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Visor de Imágenes */}
      <ImagePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        imageUrl={previewUrl}
        title={previewTitle}
      />
    </section>
  );
}