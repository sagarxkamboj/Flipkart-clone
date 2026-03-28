import { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { StoreContext } from "../context/StoreContext";

export default function Header() {
  const { searchTerm, setSearchTerm, cartSummary, wishlistCount } = useContext(StoreContext);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand-block">
          <div className="brand-logo">Flipkart</div>
          <div className="brand-subtitle">
            Explore <span>Plus</span>
          </div>
        </Link>

        <div className="header-search">
          <input
            type="search"
            placeholder="Search for products, brands and more"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <nav className="header-nav">
          <NavLink to="/" className="nav-link">
            Store
          </NavLink>
          <NavLink to="/wishlist" className="nav-link cart-link">
            Wishlist <span>{wishlistCount}</span>
          </NavLink>
          <NavLink to="/cart" className="nav-link cart-link">
            Cart <span>{cartSummary.totalItems}</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
