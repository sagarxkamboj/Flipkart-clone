import { useContext } from "react";
import { Link } from "react-router-dom";
import { StoreContext } from "../context/StoreContext";

function formatPrice(value) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

export default function WishlistPage() {
  const { wishlistItems, toggleWishlist, addToCart } = useContext(StoreContext);

  if (!wishlistItems.length) {
    return (
      <div className="empty-state">
        <h2>Your wishlist is empty</h2>
        <p>Save products here so you can review them before checkout.</p>
        <Link to="/" className="btn btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="section-card">
        <div className="section-eyebrow">Saved for later</div>
        <h2>My Wishlist ({wishlistItems.length})</h2>
        <div className="wishlist-grid">
          {wishlistItems.map((item) => (
            <article key={item.id} className="wishlist-card">
              <Link to={`/product/${item.id}`} className="wishlist-image-link">
                <img src={item.images[0]} alt={item.title} className="wishlist-image" />
              </Link>
              <div className="wishlist-content">
                <div className="product-brand">{item.brand}</div>
                <h3>{item.title}</h3>
                <div className="product-rating-row">
                  <div className="product-rating">
                    {item.rating} {"\u2605"}
                  </div>
                  <span className="reviews-copy">{item.reviews}</span>
                </div>
                <div className="current-price">{formatPrice(item.price.current)}</div>
                <p className="delivery-copy">{item.delivery}</p>
                <div className="wishlist-actions">
                  <button className="btn btn-warning" onClick={() => addToCart(item.id, 1)}>
                    Add to Cart
                  </button>
                  <button className="text-button" onClick={() => toggleWishlist(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
