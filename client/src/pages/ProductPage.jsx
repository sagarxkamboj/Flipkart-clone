import { useContext, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { StoreContext } from "../context/StoreContext";

function formatPrice(value) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

export default function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, isWishlisted, toggleWishlist } = useContext(StoreContext);
  const [activeImage, setActiveImage] = useState(0);

  const product = useMemo(
    () => products.find((item) => item.id === productId),
    [productId, products]
  );

  if (!product) {
    return (
      <div className="empty-state">
        <h2>Product not found</h2>
        <Link to="/">Go back to homepage</Link>
      </div>
    );
  }

  const buyNow = () => {
    addToCart(product.id, 1);
    navigate("/checkout");
  };

  const showPreviousImage = () => {
    setActiveImage((current) =>
      current === 0 ? product.images.length - 1 : current - 1
    );
  };

  const showNextImage = () => {
    setActiveImage((current) =>
      current === product.images.length - 1 ? 0 : current + 1
    );
  };

  return (
    <div className="page-container">
      <div className="details-layout">
        <section className="details-gallery">
          <div className="thumbnail-list">
            {product.images.map((image, index) => (
              <button
                key={image}
                className={index === activeImage ? "thumb active" : "thumb"}
                onClick={() => setActiveImage(index)}
              >
                <img src={image} alt={`${product.title} ${index + 1}`} />
              </button>
            ))}
          </div>
          <div className="primary-image-card">
            <div className="gallery-stage">
              <button className="gallery-nav prev" onClick={showPreviousImage}>
                {"<"}
              </button>
              <img src={product.images[activeImage]} alt={product.title} />
              <button className="gallery-nav next" onClick={showNextImage}>
                {">"}
              </button>
            </div>
            <div className="detail-actions">
              <button className="btn btn-warning" onClick={() => addToCart(product.id, 1)}>
                Add to Cart
              </button>
              <button className="btn btn-primary" onClick={buyNow}>
                Buy Now
              </button>
            </div>
          </div>
        </section>

        <section className="details-content">
          <div className="breadcrumb-copy">Home &gt; {product.category} &gt; {product.brand}</div>
          <div className="detail-brand">{product.brand}</div>
          <h1>{product.title}</h1>
          <button
            type="button"
            className={isWishlisted(product.id) ? "wishlist-detail-btn active" : "wishlist-detail-btn"}
            onClick={() => toggleWishlist(product.id)}
          >
            {isWishlisted(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
          </button>
          <div className="product-rating-row">
            <div className="product-rating detail-rating">
              {product.rating} {"\u2605"}
            </div>
            <span className="reviews-copy">{product.reviews}</span>
            <span className="assured-badge">{product.assured}</span>
          </div>
          <div className="detail-price-row">
            <span className="current-price">{formatPrice(product.price.current)}</span>
            <span className="original-price">{formatPrice(product.price.original)}</span>
            <span className="discount">{product.assured}</span>
          </div>
          <p className="stock-copy">
            {product.inStock ? "In stock and ready to ship" : "Currently out of stock"}
          </p>
          <p className="delivery-copy">{product.delivery}</p>
          <div className="seller-copy">
            Seller: <strong>{product.seller}</strong>
          </div>

          <section className="spec-card">
            <h3>Available Offers</h3>
            <ul>
              {product.offers.map((offer) => (
                <li key={offer}>{offer}</li>
              ))}
            </ul>
          </section>

          <section className="spec-card">
            <h3>Highlights</h3>
            <ul>
              {product.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </section>

          <section className="spec-card">
            <h3>Description</h3>
            <p>{product.description}</p>
          </section>

          <section className="spec-card">
            <h3>Specifications</h3>
            <div className="spec-grid">
              {Object.entries(product.specifications).map(([label, value]) => (
                <div key={label} className="spec-row">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
