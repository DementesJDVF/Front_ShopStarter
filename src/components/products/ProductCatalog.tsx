import React, { useEffect, useState } from "react";
import "./ProductCatalog.css";

type Product = {
  id: number;
  title: string;
  price: number;
  category: string;
  image: string;
};

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("https://fakestoreapi.com/products");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: Product[] = await res.json();
        if (!cancelled) setProducts(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error desconocido");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="catalog__status">Cargando catálogo...</p>;
  if (error) return <p className="catalog__status catalog__status--error">Error: {error}</p>;

  return (
    <section className="catalog">
      <h2 className="catalog__title">Catálogo</h2>

      <div className="catalog__grid">
        {products.map((p) => (
          <article key={p.id} className="product-card">
            <div className="product-card__imageWrap">
              <img
                className="product-card__image"
                src={p.image}
                alt={p.title}
                loading="lazy"
              />
            </div>

            <div className="product-card__category">{p.category}</div>
            <div className="product-card__price">${p.price.toFixed(2)}</div>
            <div className="product-card__title">{p.title}</div>
          </article>
        ))}
      </div>
    </section>
  );
}