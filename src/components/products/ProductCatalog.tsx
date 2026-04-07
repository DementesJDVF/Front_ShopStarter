import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "./ProductCatalog.css";
import api from "../../utils/axios";

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
  vendor_name: string;
  category_name: string;
  is_featured: boolean;
  images: ApiProductImage[];
  created_at: string;
};

export function ProductCatalog() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/products/");
        setProducts(res.data.results || res.data);
      } catch (e: any) {
        setError(e.response?.data?.message || e.message || "Error al conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div className="flex justify-center p-20 font-[var(--main-font)]">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-center p-20 text-red-500 font-[var(--main-font)]">
      <p>Error: {error}</p>
    </div>
  );

  return (
    <section className="catalog font-[var(--main-font)]">
      <div className="mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-3xl font-bold text-gray-800">Catálogo de Productos</h2>
        <p className="text-gray-500 mt-2">Nuestros vendedores locales ofrecen lo mejor para ti.</p>
      </div>

      <div className="catalog__grid">
        {products.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400 italic">
            No se encontraron productos disponibles.
          </div>
        ) : (
          products.map((p) => {
            const mainImage = p.images?.find((img) => img.is_main)?.url_image || p.images?.[0]?.url_image;
            
            return (
              <article key={p.id} className="product-card group hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden border border-gray-100 bg-white">
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  {mainImage ? (
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={mainImage}
                      alt={p.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 italic text-sm">
                      Sin imagen
                    </div>
                  )}
                  {p.category_name && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm">
                      {p.category_name}
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-1 flex-1">{p.name}</h3>
                  </div>
                  
                  <p className="text-gray-500 text-sm line-clamp-2 min-h-[40px]">
                    {p.description}
                  </p>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                    <div className="text-xl font-black text-primary">
                      ${parseFloat(p.price).toLocaleString()}
                    </div>
                    <button
                      className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2 text-sm font-bold"
                      onClick={() => navigate(`/products/${p.id}`)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}