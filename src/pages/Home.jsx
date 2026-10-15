
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="eyebrow">PRODUCT MANAGEMENT MADE SIMPLE</p>

        <h1>
          Manage your products.
          <br />
          <span>Grow your business.</span>
        </h1>

        <p className="hero-description">
          Organize your inventory, track product details, and manage
          your catalog from one simple dashboard.
        </p>

        <div className="hero-actions">
          <Link to="/products" className="button primary">
            View Products
          </Link>

          <Link to="/add-product" className="button secondary">
            + Add Product
          </Link>
        </div>
      </div>

      <div className="hero-card">
        <div className="hero-icon">📦</div>
        <p className="card-label">YOUR INVENTORY</p>
        <h2>ProductHub</h2>
        <p className="muted">
          One place to manage your product catalog.
        </p>
        <div className="status">
          <span className="status-dot"></span>
          Ready to organize
        </div>
      </div>
    </section>
  );
}
