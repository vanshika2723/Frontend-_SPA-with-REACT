import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const getNavClass = ({ isActive }) =>
    `nav-item${isActive ? " active" : ""}`;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink
          to="/"
          className="brand"
          onClick={closeMenu}
          aria-label="ProductHub home"
        >
          <span className="brand-icon" aria-hidden="true">
            P
          </span>

          <span>
            Product<span className="brand-highlight">Hub</span>
            <small className="brand-caption">INVENTORY MANAGER</small>
          </span>
        </NavLink>

        <button
          type="button"
          className={`menu-toggle${menuOpen ? " is-open" : ""}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="main-navigation"
          className={`nav-links${menuOpen ? " menu-open" : ""}`}
          aria-label="Main navigation"
        >
          <NavLink
            to="/"
            end
            className={getNavClass}
            onClick={closeMenu}
          >
            <span className="nav-icon" aria-hidden="true">
              ◫
            </span>
            Home
          </NavLink>

          <NavLink
            to="/products"
            className={getNavClass}
            onClick={closeMenu}
          >
            <span className="nav-icon" aria-hidden="true">
              ▦
            </span>
            Products
          </NavLink>

          <NavLink
            to="/add-product"
            className={({ isActive }) =>
              `nav-item add-link${isActive ? " active" : ""}`
            }
            onClick={closeMenu}
          >
            <span aria-hidden="true">＋</span>
            Add Product
          </NavLink>
        </nav>
      </div>
    </header>
  );
}