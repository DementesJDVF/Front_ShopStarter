import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router";
import api from "../../utils/axios";
import { getAbsoluteImageUrl } from "../../utils/urlHelper";
import { optimizeImageUrl } from "../../utils/imageOptimizer";
import { useTranslation } from "react-i18next";
import { useCart } from "../../context/CartContext";
import { toast } from "react-hot-toast";

// --- Types ---
type Category = {
  id: number;
  name: string;
  emoji: string;
  description: string;
};

type Product = {
  id: number;
  name: string;
  price: string;
  category_name: string;
  images: { url_image: string; is_main: boolean }[];
  vendor_name: string;
};

// --- ProductCard Component ---
const ProductCard = ({ product }: { product: Product }) => {
  const { t } = useTranslation("product");
  const { addToCart } = useCart();
  
  const rawImage = product.images?.find((img) => img.is_main)?.url_image || product.images?.[0]?.url_image;
  const imageUrl = getAbsoluteImageUrl(rawImage);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: parseFloat(product.price),
      quantity: 1,
      image: imageUrl,
      vendorId: "0", // Fallback
      vendorName: product.vendor_name
    });
    toast.success(t("addedToCart", { name: product.name }));
  };

  return (
    <Link 
      to={`/app/products/${product.id}`}
      className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 dark:border-slate-700 flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-900">
        <img 
          src={optimizeImageUrl(imageUrl, 400)} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
        
        {/* Quick Add Button */}
        <button 
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:bg-indigo-700 active:scale-90"
        >
          <Icon icon="solar:cart-plus-bold" className="text-xl" />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {product.name}
        </h4>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
            ${parseFloat(product.price).toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
};

// --- CategorySection Component ---
const CategorySection = ({ category }: { category: Category }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get(`products/catalog/?category=${category.id}&page_size=4`);
        setProducts(res.data.results || res.data || []);
      } catch (err) {
        console.error(`Error fetching products for category ${category.name}`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category.id]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-12" data-aos="fade-up">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{category.emoji || "🛍️"}</span>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
              {category.name}
            </h3>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {category.description || `Explora lo mejor en ${category.name.toLowerCase()}`}
          </p>
        </div>
        <Link 
          to={`/app/products?category=${category.name}`}
          className="group flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest text-xs hover:gap-3 transition-all"
        >
          {t("visualCatalog.viewAll")}
          <Icon icon="solar:alt-arrow-right-bold" className="text-lg" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-2xl mb-4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            </div>
          ))
        ) : (
          products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </section>
  );
};

const VisualCatalog = () => {
  const { t } = useTranslation("landingPage");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("products/get-categories/");
        setCategories(res.data.results || res.data || []);
      } catch (err) {
        console.error("Error fetching categories", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* --- Section 1: Categories Grid --- */}
      <div className="mb-20" data-aos="fade-down">
        <div className="text-center mb-12">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-400 font-black tracking-[0.2em] uppercase text-xs mb-4 block">
            {t("visualCatalog.tag")}
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
            {t("visualCatalog.title")}
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-3xl" />
            ))
          ) : (
            categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/app/products?category=${cat.name}`}
                className="group relative flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:shadow-indigo-200/50 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                <span className="text-5xl mb-6 transform group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">
                  {cat.emoji || "🛍️"}
                </span>
                <h3 className="text-lg font-black text-slate-800 dark:text-white text-center tracking-tight line-clamp-1">
                  {cat.name}
                </h3>
                <span className="mt-2 text-[10px] font-black text-indigo-600/40 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">
                  {t("visualCatalog.explore")}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* --- Section 2: Dynamic Blocks --- */}
      <div className="space-y-16">
        {categories.slice(0, 5).map((cat) => (
          <CategorySection key={cat.id} category={cat} />
        ))}
      </div>

      {/* View More Button */}
      <div className="mt-20 text-center">
        <Link
          to="/app/products"
          className="inline-flex items-center gap-4 px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl group"
        >
          {t("visualCatalog.fullCatalog")}
          <Icon icon="solar:shop-bold" className="text-2xl group-hover:rotate-12 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default VisualCatalog;
