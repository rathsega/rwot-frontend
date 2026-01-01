import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchProducts, getProductsFromCache } from "../services/productsService";

/**
 * useProducts - fetches products list
 *
 * @param {object} options
 * @param {boolean} [options.enabled=true] - enable auto-fetch
 * @returns {{ products: any[], loading: boolean, error: Error|null, refetch: () => Promise<void> }}
 */
export default function useProducts(options = {}) {
  const { enabled = true } = options;
  const initial = getProductsFromCache();
  const [products, setProducts] = useState(initial);
  const [loading, setLoading] = useState(enabled && initial.length === 0);
  const [error, setError] = useState(null);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchProducts({ force });
      setProducts(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load products"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled && products.length === 0) {
      load(false);
    } else if (!enabled) {
      setLoading(false);
    }
  }, [enabled, products.length, load]);

  const api = useMemo(
    () => ({ products, loading, error, refetch: () => load(true) }),
    [products, loading, error, load]
  );
  return api;
}
