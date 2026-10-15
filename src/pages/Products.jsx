
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getProducts,
  deleteProduct,
} from "../services/productApi";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [stockFilter, setStockFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [notice, setNotice] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Show messages passed from Add Product and Edit Product.
  useEffect(() => {
    if (location.state?.notice) {
      setNotice(location.state.notice);

      // Clear navigation state so the message doesn't reappear
      // when the user returns to this page.
      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [location.pathname, location.state, navigate]);

  const loadProducts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const result = await getProducts();

      const list = Array.isArray(result)
        ? result
        : result?.data || result?.products || [];

      if (!Array.isArray(list)) {
        throw new Error("Invalid products data received from server.");
      }

      setProducts(list);
    } catch (err) {
      setError(err.message || "Products load nahi hue.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        products
          .map((product) => product.category?.trim())
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b));

    return ["All", ...uniqueCategories];
  }, [products]);

  const totalValue = useMemo(
    () =>
      products.reduce(
        (total, product) =>
          total +
          (Number(product.price) || 0) *
            (Number(product.stock) || 0),
        0
      ),
    [products]
  );

  const lowStockCount = useMemo(
    () =>
      products.filter((product) => {
        const stock = Number(product.stock) || 0;
        return stock > 0 && stock <= 5;
      }).length,
    [products]
  );

  const outOfStockCount = useMemo(
    () =>
      products.filter(
        (product) => (Number(product.stock) || 0) === 0
      ).length,
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = products.filter((product) => {
      const searchableText = [
        product.name,
        product.category,
        product.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(query);

      const matchesCategory =
        category === "All" ||
        product.category?.trim() === category;

      const stock = Number(product.stock) || 0;

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && stock > 0 && stock <= 5) ||
        (stockFilter === "out" && stock === 0) ||
        (stockFilter === "available" && stock > 5);

      return matchesSearch && matchesCategory && matchesStock;
    });

    // Sort a copy to avoid mutating the original product list.
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return (a.name || "").localeCompare(b.name || "");

        case "name-desc":
          return (b.name || "").localeCompare(a.name || "");

        case "price-low":
          return (Number(a.price) || 0) - (Number(b.price) || 0);

        case "price-high":
          return (Number(b.price) || 0) - (Number(a.price) || 0);

        case "stock-low":
          return (Number(a.stock) || 0) - (Number(b.stock) || 0);

        case "stock-high":
          return (Number(b.stock) || 0) - (Number(a.stock) || 0);

        default:
          return 0;
      }
    });
  }, [products, search, category, sortBy, stockFilter]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Kya aap is product ko delete karna chahte hain? Ye action undo nahi hoga."
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setNotice("");

      await deleteProduct(id);

      setProducts((current) =>
        current.filter((product) => product._id !== id)
      );

      setNotice("Product successfully deleted.");
    } catch (err) {
      setError(err.message || "Product delete nahi hua.");
    } finally {
      setDeletingId(null);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setSortBy("newest");
    setStockFilter("all");
  };

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  // Initial loading state only.
  if (loading) {
    return (
      <section className="products-page">
        <div className="inventory-loading">
          <span className="loading-spinner" />
          <h2>Loading your inventory</h2>
          <p>Please wait while we fetch your products.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="products-page">
      {/* Page heading */}
      <header className="page-heading">
        <div>
          <span className="page-eyebrow">
            INVENTORY MANAGEMENT
          </span>

          <h1>My Products</h1>

          <p>
            Manage, search and organize your product catalog.
          </p>
        </div>

        <div className="heading-actions">
          <button
            className="refresh-btn"
            type="button"
            onClick={() => loadProducts(true)}
            disabled={refreshing}
          >
            {refreshing ? "↻ Refreshing..." : "↻ Refresh"}
          </button>

          <button
            className="primary-btn"
            type="button"
            onClick={() => navigate("/add-product")}
          >
            + Add Product
          </button>
        </div>
      </header>

      {/* Error notification */}
      {error && (
        <div className="error-message" role="alert">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => loadProducts(true)}
            disabled={refreshing}
          >
            {refreshing ? "Retrying..." : "Try again"}
          </button>
        </div>
      )}

      {/* Success notification */}
      {notice && (
        <div className="success-message" role="status">
          <span>✓ {notice}</span>

          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}

      {/* Inventory statistics */}
      <div className="inventory-stats">
        <article className="stat-card">
          <span className="stat-icon purple">▦</span>
          <div>
            <p>Total Products</p>
            <h2>{products.length}</h2>
          </div>
        </article>

        <article className="stat-card">
          <span className="stat-icon blue">▤</span>
          <div>
            <p>Categories</p>
            <h2>{categories.length - 1}</h2>
          </div>
        </article>

        <article className="stat-card">
          <span className="stat-icon orange">⚠</span>
          <div>
            <p>Low Stock</p>
            <h2>{lowStockCount}</h2>
          </div>
        </article>

        <article className="stat-card">
          <span className="stat-icon red">↓</span>
          <div>
            <p>Out of Stock</p>
            <h2>{outOfStockCount}</h2>
          </div>
        </article>

        <article className="stat-card inventory-value-card">
          <span className="stat-icon green">₹</span>
          <div>
            <p>Inventory Value</p>
            <h2>{formatCurrency(totalValue)}</h2>
          </div>
        </article>
      </div>

      {/* Search and filters */}
      <div className="products-toolbar">
        <div className="search-wrapper">
          <span className="search-icon" aria-hidden="true">
            ⌕
          </span>

          <input
            className="search-input"
            type="search"
            placeholder="Search name, category or description..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search products"
          />

          {search && (
            <button
              className="clear-search-btn"
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="filter-controls">
          <select
            className="filter-select"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter by category"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Categories" : item}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={stockFilter}
            onChange={(event) => setStockFilter(event.target.value)}
            aria-label="Filter by stock status"
          >
            <option value="all">All Stock</option>
            <option value="available">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>

          <select
            className="filter-select"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            aria-label="Sort products"
          >
            <option value="newest">Default Order</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="stock-low">Stock: Low to High</option>
            <option value="stock-high">Stock: High to Low</option>
          </select>
        </div>
      </div>

      {/* Catalog heading */}
      <div className="results-heading">
        <div>
          <h2>Product Catalog</h2>
          <p>
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        <button
          type="button"
          className="text-btn"
          onClick={resetFilters}
        >
          Reset filters
        </button>
      </div>

      {/* Empty state or product cards */}
      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>

          <h2>
            {products.length === 0
              ? "Your catalog is empty"
              : "No matching products"}
          </h2>

          <p>
            {products.length === 0
              ? "Add your first product to start managing your inventory."
              : "Try another search term or change your filters."}
          </p>

          {products.length === 0 ? (
            <button
              className="primary-btn"
              type="button"
              onClick={() => navigate("/add-product")}
            >
              + Add Your First Product
            </button>
          ) : (
            <button
              className="secondary-btn"
              type="button"
              onClick={resetFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => {
            const stock = Number(product.stock) || 0;

            const stockStatus =
              stock === 0
                ? "out"
                : stock <= 5
                  ? "low"
                  : "available";

            return (
              <article
                className="product-card"
                key={product._id}
              >
                <div className="product-card-top">
                  <div
                    className="product-placeholder"
                    aria-hidden="true"
                  >
                    📦
                  </div>

                  <span className={`stock-badge ${stockStatus}`}>
                    {stockStatus === "out"
                      ? "Out of Stock"
                      : stockStatus === "low"
                        ? "Low Stock"
                        : "In Stock"}
                  </span>
                </div>

                <div className="product-card-content">
                  <span className="product-category">
                    {product.category || "General"}
                  </span>

                  <h2>
                    {product.name || "Untitled Product"}
                  </h2>

                  <p className="product-description">
                    {product.description ||
                      "No description available."}
                  </p>

                  <div className="product-meta">
                    <div>
                      <span>Price</span>
                      <strong>
                        {formatCurrency(product.price)}
                      </strong>
                    </div>

                    <div>
                      <span>Available Stock</span>
                      <strong>{stock} units</strong>
                    </div>
                  </div>
                </div>

                <div className="product-actions">
                  <button
                    className="edit-btn"
                    type="button"
                    onClick={() =>
                      navigate(`/edit-product/${product._id}`)
                    }
                  >
                    ✎ Edit
                  </button>

                  <button
                    className="delete-btn"
                    type="button"
                    disabled={deletingId === product._id}
                    onClick={() => handleDelete(product._id)}
                  >
                    {deletingId === product._id
                      ? "Deleting..."
                      : "⌫ Delete"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
