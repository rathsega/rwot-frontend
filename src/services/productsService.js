import apiFetch from "../utils/api";

let _productsCache = null;
let _inflight = null;

export function getProductsFromCache() {
  return Array.isArray(_productsCache) ? _productsCache : [];
}

export function clearProductsCache() {
  _productsCache = null;
}

export async function fetchProducts(options = {}) {
  const { force = false } = options;
  if (_productsCache && !force) {
    return _productsCache;
  }
  if (_inflight) {
    return _inflight;
  }

  _inflight = apiFetch("/banks/products", { method: "GET" })
    .then((res) => {
      const list = res?.products || [];
      _productsCache = Array.isArray(list) ? list : [];
      return _productsCache;
    })
    .finally(() => {
      _inflight = null;
    });

  return _inflight;
}

export default { fetchProducts, getProductsFromCache, clearProductsCache };
