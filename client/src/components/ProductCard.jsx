import { useContext } from "react";
import { Link } from "react-router-dom";
import { StoreContext } from "../context/StoreContext";

function formatPrice(value) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

export default function ProductCard({ product }) {
  const { isWishlisted, toggleWishlist } = useContext(StoreContext);
  const discount = Math.round(
    ((product.price.original - product.price.current) / product.price.original) * 100
  );

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-image-wrap">
        <div className="product-card-tag">{product.assured}</div>
        <button
          type="button"
          className={isWishlisted(product.id) ? "wishlist-btn active" : "wishlist-btn"}
          onClick={(event) => {
            event.preventDefault();
            toggleWishlist(product.id);
          }}
        >
          {isWishlisted(product.id) ? "\u2665" : "\u2661"}
        </button>
        <img src={product.images[0]} alt={product.title} className="product-image" />
      </div>
      <div className="product-content">
        <div className="product-brand">{product.brand}</div>
        <h3>{product.title}</h3>
        <div className="product-rating-row">
          <div className="product-rating">
            {product.rating} {"\u2605"}
          </div>
          <span className="reviews-copy">{product.reviews}</span>
        </div>
        <div className="price-row">
          <span className="current-price">{formatPrice(product.price.current)}</span>
          <span className="original-price">{formatPrice(product.price.original)}</span>
          <span className="discount">{discount}% off</span>
        </div>
        <p className="product-highlight-copy">{product.highlights[0]}</p>
        <p className="delivery-copy">{product.delivery}</p>
      </div>
    </Link>
  );
}
