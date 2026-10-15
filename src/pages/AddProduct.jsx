
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../services/productApi";

const initialForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "0",
};

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

export default function AddProduct() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState({});

  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  }

  function handleBlur(event) {
    setTouched((current) => ({
      ...current,
      [event.target.name]: true,
    }));
  }

  function getFieldError(name) {
    if (!touched[name]) return "";

    switch (name) {
      case "name":
        if (form.name.trim().length < 2) {
          return "Product name must contain at least 2 characters.";
        }
        break;

      case "description":
        if (!form.description.trim()) {
          return "Please enter a product description.";
        }
        break;

      case "price":
        if (
          form.price === "" ||
          !Number.isFinite(Number(form.price)) ||
          Number(form.price) < 0
        ) {
          return "Please enter a valid non-negative price.";
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

      case "category":
        if (!form.category.trim()) {
          return "Please select or enter a category.";
        }
        break;

      default:
        break;
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    setTouched({
      name: true,
      description: true,
      category: true,
      price: true,
      stock: true,
    });

    const normalizedForm = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
    };

    if (normalizedForm.name.length < 2) {
      setError("Product name must contain at least 2 characters.");
      return;
    }

    if (!normalizedForm.description) {
      setError("Please enter a product description.");
      return;
    }

    if (
      form.price === "" ||
      !Number.isFinite(normalizedForm.price) ||
      normalizedForm.price < 0
    ) {
      setError("Please enter a valid non-negative price.");
      return;
    }

    if (
      form.stock === "" ||
      !Number.isInteger(normalizedForm.stock) ||
      normalizedForm.stock < 0
    ) {
      setError("Stock must be a non-negative whole number.");
      return;
    }

    if (!normalizedForm.category) {
      setError("Please select or enter a category.");
      return;
    }

    try {
      setSaving(true);

      await createProduct(normalizedForm);

      navigate("/products", {
        state: {
          notice: "Product created successfully!",
        },
      });
    } catch (err) {
      setError(
        err.message || "Product create nahi hua. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  const stockNumber =
    form.stock !== "" && Number.isFinite(Number(form.stock))
      ? Math.max(0, Number(form.stock))
      : 0;

  const previewStockStatus =
    stockNumber === 0
      ? "Out of Stock"
      : stockNumber <= 5
        ? "Low Stock"
        : "In Stock";

  const formattedPrice =
    form.price !== "" &&
    Number.isFinite(Number(form.price)) &&
    Number(form.price) >= 0
      ? Number(form.price).toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "₹0.00";

  return (
    <section className="form-page add-product-page">
      {/* Back navigation */}
      <div className="add-page-top">
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate("/products")}
          disabled={saving}
        >
          <span aria-hidden="true">←</span>
          Back to Products
        </button>
      </div>

      {/* Page heading */}
      <header className="add-page-title">
        <p className="eyebrow">INVENTORY MANAGEMENT</p>

        <h1>Add a Product</h1>

        <p className="muted">
          Add product details and preview your inventory item before saving.
        </p>
      </header>

      {/* Main form and preview */}
      <div className="add-product-layout">
        <form
          className="product-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Basic information */}
          <div className="form-section-heading">
            <span className="section-number">01</span>

            <div>
              <h2>Basic Information</h2>
              <p>Tell us about your product.</p>
            </div>
          </div>

          <div className="add-form-fields">
            <div className="form-group">
              <label htmlFor="product-name">
                Product Name <span className="required-mark">*</span>
              </label>

              <input
                id="product-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Wireless Headphones"
                minLength={2}
                maxLength={100}
                required
                aria-invalid={Boolean(getFieldError("name"))}
              />

              {getFieldError("name") && (
                <small className="field-error">
                  {getFieldError("name")}
                </small>
              )}

              <small className="field-hint">
                {form.name.length}/100 characters
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="product-description">
                Description <span className="required-mark">*</span>
              </label>

              <textarea
                id="product-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Describe the product, its features and benefits..."
                rows={4}
                maxLength={1000}
                required
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
            </div>

            <div className="form-group">
              <label htmlFor="product-category">
                Category <span className="required-mark">*</span>
              </label>

              <input
                id="product-category"
                name="category"
                value={form.category}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Select or enter a category"
                list="product-category-options"
                maxLength={60}
                required
                aria-invalid={Boolean(getFieldError("category"))}
              />

              <datalist id="product-category-options">
                {categoryOptions.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>

              {getFieldError("category") && (
                <small className="field-error">
                  {getFieldError("category")}
                </small>
              )}

              <small className="field-hint">
                Choose a suggestion or enter your own category.
              </small>
            </div>
          </div>

          {/* Pricing and inventory */}
          <div className="form-section-heading pricing-heading">
            <span className="section-number">02</span>

            <div>
              <h2>Pricing & Inventory</h2>
              <p>Set the selling price and available quantity.</p>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="product-price">
                Price (₹) <span className="required-mark">*</span>
              </label>

              <input
                id="product-price"
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter price"
                min="0"
                step="0.01"
                required
                aria-invalid={Boolean(getFieldError("price"))}
              />

              {getFieldError("price") && (
                <small className="field-error">
                  {getFieldError("price")}
                </small>
              )}

              <small className="field-hint">
                Enter the price in Indian rupees.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="product-stock">
                Stock Quantity <span className="required-mark">*</span>
              </label>

              <input
                id="product-stock"
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter quantity"
                min="0"
                step="1"
                required
                aria-invalid={Boolean(getFieldError("stock"))}
              />

              {getFieldError("stock") && (
                <small className="field-error">
                  {getFieldError("stock")}
                </small>
              )}

              <small className="field-hint">
                Use a whole number, including zero.
              </small>
            </div>
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          {/* Form actions */}
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
              {saving ? "Saving Product..." : "✓ Create Product"}
            </button>
          </div>
        </form>

        {/* Live preview */}
        <aside className="product-preview-panel">
          <div className="preview-heading">
            <div>
              <span className="preview-label">LIVE PREVIEW</span>
              <h2 className="preview-title">Your product card</h2>
            </div>

            <span className="preview-indicator">Updating</span>
          </div>

          <article className="product-preview-card">
            <div className="preview-product-art" aria-hidden="true">
              📦
            </div>

            <div className="preview-product-details">
              <span className="product-category">
                {form.category.trim() || "Product Category"}
              </span>

              <h3>{form.name.trim() || "Your Product Name"}</h3>

              <p className="preview-description">
                {form.description.trim() ||
                  "Your product description will appear here as you type."}
              </p>

              <div className="preview-price">{formattedPrice}</div>

              <div className="preview-stock-row">
                <span>Available quantity</span>
                <strong>{stockNumber} units</strong>
              </div>

              <div
                className={`preview-stock-status ${
                  stockNumber === 0
                    ? "out-of-stock"
                    : stockNumber <= 5
                      ? "low-stock"
                      : "in-stock"
                }`}
              >
                <span className="preview-stock-dot" />
                {previewStockStatus}
              </div>
            </div>
          </article>

          <div className="preview-tip">
            <span className="preview-tip-icon" aria-hidden="true">
              💡
            </span>

            <div>
              <strong>Quick tip</strong>
              <p>
                Use a clear product name, a helpful description and the correct
                stock quantity to keep your catalog organized.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
