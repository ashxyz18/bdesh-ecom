const API_URL = process.env.REACT_APP_API_URL;

async function fetchWithErrorHandling(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchConfig() {
  return fetchWithErrorHandling(`${API_URL}/config`);
}

export async function fetchProducts(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${API_URL}/products?${queryString}` : `${API_URL}/products`;
  return fetchWithErrorHandling(url);
}

export async function fetchProductById(id) {
  return fetchWithErrorHandling(`${API_URL}/products/${id}`);
}

export async function fetchCollections() {
  return fetchWithErrorHandling(`${API_URL}/collections`);
}

export async function fetchCart() {
  return fetchWithErrorHandling(`${API_URL}/cart`);
}

export async function addToCart(productId, quantity = 1, variantId = null) {
  return fetchWithErrorHandling(`${API_URL}/cart`, {
    method: 'POST',
    body: JSON.stringify({ productId, quantity, variantId }),
  });
}
