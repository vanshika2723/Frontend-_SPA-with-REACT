
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // Safely handle JSON and empty responses
  const contentType = response.headers.get("content-type");
  let result = {};

  if (contentType?.includes("application/json")) {
    result = await response.json();
  } else {
    const text = await response.text();
    result = text ? { message: text } : {};
  }

  if (!response.ok) {
    throw new Error(
      result.message || `Request failed with status ${response.status}`
    );
  }

  return result;
}

// Fetch all products
export const getProducts = () => request("/products");

// Create a product
export const createProduct = (product) =>
  request("/products", {
    method: "POST",
    body: JSON.stringify(product),
  });

// Update an existing product
export const updateProduct = (id, productData) =>
  request(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });

// Delete a product
export const deleteProduct = (id) =>
  request(`/products/${id}`, {
    method: "DELETE",
  });
