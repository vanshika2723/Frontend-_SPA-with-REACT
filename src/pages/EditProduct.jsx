import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProducts,
  updateProduct,
} from "../services/productApi";

const categoryOptions = [
  "Electronics",
  "Clothing",
  "Accessories",
  "Home & Kitchen",
  "Books",
  "Beauty",
  "Sports",
  "Other",
];

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "0",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({});

  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getProducts();

        const products = Array.isArray(result)
          ? result
          : result?.data || result?.products || [];

        const product = products.find((item) => item._id === id);

        if (cancelled) return;

        if (!product) {
          setError("Product nahi mila. Products page par wapas jao.");
          return;
        }

        setForm({
          name: product.name || "",
          description: product.description || "",
          price: String(product.price ?? ""),
          category: product.category || "",
          stock: String(product.stock ?? 0),
        });
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Product load nahi hua.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const handleBlur = (event) => {
    setTouched((current) => ({
      ...current,
      [event.target.name]: true,
    }));
  };

  const getFieldError = (name) => {
    if (!touched[name]) return "";

    switch (name) {
      case "name":
        if (form.name.trim().length < 2) {
          return "Name must contain at least 2 characters.";
        }
        if (form.name.trim().length > 100) {
          return "Name cannot exceed 100 characters.";
        }
        break;

      case "description":
        if (form.description.length > 1000) {
          return "Description cannot exceed 1000 characters.";
        }
        break;

      case "price":
        if (
          form.price === "" ||
          !Number.isFinite(Number(form.price)) ||
          Number(form.price) < 0
        ) {
          return "Enter a valid non-negative price.";
        }
        break;

      case "category":
        if (!form.category.trim()) {
          return "Please enter a category.";
        }
        break;

      case "stock":
        if (
          form.stock === "" ||
          !Number.isInteger(Number(form.stock)) ||
          Number(form.stock) < 0
        ) {
          return "Stock must be a non-negative whole number.";
        }
        break;

      default:
        break;
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const updatedProduct = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category.trim(),
      stock: Number(form.stock),
    };

    if (updatedProduct.name.length < 2) {
      setError("Product name must contain at least 2 characters.");
      return;
    }

    if (updatedProduct.name.length > 100) {
      setError("Product name cannot exceed 100 characters.");
      return;
    }

    if (updatedProduct.description.length > 1000) {
      setError("Description cannot exceed 1000 characters.");
      return;
    }

    if (
      form.price === "" ||
      !Number.isFinite(updatedProduct.price) ||
      updatedProduct.price < 0
    ) {
      setError("Please enter a valid non-negative price.");
      return;
    }

    if (!updatedProduct.category) {
      setError("Please enter a product category.");
      return;
    }

    if (
      form.stock === "" ||
      !Number.isInteger(updatedProduct.stock) ||
      updatedProduct.stock < 0
    ) {
      setError("Stock must be a non-negative whole number.");
      return;
    }

    try {
      setSaving(true);

      await updateProduct(id, updatedProduct);

      navigate("/products", {
        state: {
          notice: "Product updated successfully!",
        },
      });
    } catch (err) {
      setError(err.message || "Product update nahi hua.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="form-page">
        <p className="status-message">Loading product details...</p>
      </section>
    );
  }

  if (error && !form.name && !form.category && !form.description) {
    return (
      <section className="form-page">
        <div className="error-message" role="alert">
          {error}
        </div>

        <button
          type="button"
          className="secondary-btn"
          onClick={() => navigate("/products")}
        >
          ← Back to Products
        </button>
      </section>
    );
  }

  const stock = Number(form.stock) || 0;

  const stockStatus =
    stock === 0 ? "out" : stock <= 5 ? "low" : "available";

  const formattedPrice =
    form.price !== "" &&
    Number.isFinite(Number(form.price)) &&
    Number(form.price) >= 0
      ? Number(form.price).toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 2,
        })
      : "₹0.00";

  return (
    <section className="form-page add-product-page">
      <div className="form-page-heading">
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate("/products")}
        >
          ← Back to Products
        </button>

        <p className="eyebrow">INVENTORY MANAGEMENT</p>

        <h1>Edit Product</h1>

        <p className="muted">
          Update your product details and review the live preview.
        </p>
      </div>

      <div className="add-product-layout">
        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-section-heading">
            <span className="section-number">01</span>
            <div>
              <h2>Product Information</h2>
              <p>Keep your product details up to date.</p>
            </div>
          </div>

          <label htmlFor="edit-name">
            Product Name <span className="required-mark">*</span>
            <input
              id="edit-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter product name"
              minLength={2}
              maxLength={100}
              required
              aria-invalid={Boolean(getFieldError("name"))}
            />
            {getFieldError("name") && (
              <small className="field-error">{getFieldError("name")}</small>
            )}
            <small className="field-hint">
              {form.name.length}/100 characters
            </small>
          </label>

          <label htmlFor="edit-description">
            Description
            <textarea
              id="edit-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Describe your product..."
              rows={5}
              maxLength={1000}
              aria-invalid={Boolean(getFieldError("description"))}
            />
            {getFieldError("description") && (
              <small className="field-error">
                {getFieldError("description")}
              </small>
            )}
            <small className="field-hint">
              {form.description.length}/1000 characters
            </small>
          </label>

          <label htmlFor="edit-category">
            Category <span className="required-mark">*</span>
            <input
              id="edit-category"
              name="category"
              value={form.category}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter or select category"
              list="edit-category-options"
              maxLength={60}
              required
              aria-invalid={Boolean(getFieldError("category"))}
            />

            <datalist id="edit-category-options">
              {categoryOptions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>

            {getFieldError("category") && (
              <small className="field-error">
                {getFieldError("category")}
              </small>
            )}
          </label>

          <div className="form-section-heading pricing-heading">
            <span className="section-number">02</span>
            <div>
              <h2>Pricing & Stock</h2>
              <p>Update the price and available quantity.</p>
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="edit-price">
              Price (₹) <span className="required-mark">*</span>
              <input
                id="edit-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0.00"
                required
                aria-invalid={Boolean(getFieldError("price"))}
              />
              {getFieldError("price") && (
                <small className="field-error">
                  {getFieldError("price")}
                </small>
              )}
            </label>

            <label htmlFor="edit-stock">
              Stock Quantity <span className="required-mark">*</span>
              <input
                id="edit-stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                aria-invalid={Boolean(getFieldError("stock"))}
              />
              {getFieldError("stock") && (
                <small className="field-error">
                  {getFieldError("stock")}
                </small>
              )}
            </label>
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate("/products")}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="button primary"
              disabled={saving}
            >
              {saving ? "Saving Changes..." : "✓ Save Changes"}
            </button>
          </div>
        </form>

        <aside className="product-preview-panel">
          <div className="preview-heading">
            <span className="preview-label">LIVE PREVIEW</span>
            <span className="preview-indicator">● Updating</span>
          </div>

          <article className="product-preview-card">
            <div className="preview-product-art">📦</div>

            <div className="preview-product-details">
              <span className="product-category">
                {form.category.trim() || "Product Category"}
              </span>

              <h2>{form.name.trim() || "Your Product Name"}</h2>

              <p className="preview-description">
                {form.description.trim() ||
                  "Your product description will appear here."}
              </p>

              <div className="preview-price">{formattedPrice}</div>

              <div className="preview-stock-row">
                <span>Available quantity</span>
                <strong>{stock} units</strong>
              </div>

              <span className={`stock-badge ${stockStatus}`}>
                {stockStatus === "out"
                  ? "Out of Stock"
                  : stockStatus === "low"
                    ? "Low Stock"
                    : "In Stock"}
              </span>
            </div>
          </article>

          <div className="preview-tip">
            <span>💡</span>
            <p>
              <strong>Before saving</strong>
              <br />
              Check your product name, price, category and stock quantity.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}