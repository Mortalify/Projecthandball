import { useState, useEffect } from "react";
import type { Product } from "@/lib/printify";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const cache: { products?: Product[]; byId: Record<string, Product> } = {
  byId: {},
};

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(cache.products ?? []);
  const [loading, setLoading] = useState(!cache.products);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache.products) return;
    let cancelled = false;
    setLoading(true);
    fetch(`${BASE}/api/printify/products`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Product[]>;
      })
      .then((data) => {
        if (cancelled) return;
        cache.products = data;
        setProducts(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load products");
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { products, loading, error };
}

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<Product | null>(
    id ? (cache.byId[id] ?? null) : null
  );
  const [loading, setLoading] = useState(!!(id && !cache.byId[id]));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || cache.byId[id]) return;
    let cancelled = false;
    setLoading(true);
    fetch(`${BASE}/api/printify/products/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Product>;
      })
      .then((data) => {
        if (cancelled) return;
        cache.byId[id] = data;
        setProduct(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Product not found");
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  return { product, loading, error };
}
