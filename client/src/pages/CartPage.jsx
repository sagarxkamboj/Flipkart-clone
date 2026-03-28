import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../context/StoreContext";

function formatPrice(value) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, cartSummary, updateQuantity, removeFromCart } =
    useContext(StoreContext);

  if (!cartItems.length) {
    return (
      <div className="empty-state">
        <h2>Your cart is empty</h2>
        <p>Add a few items from the homepage to continue shopping.</p>
        <Link to="/" className="btn btn-primary">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container cart-layout">
      <section className="cart-list">
        <div className="section-card">
          <div className="section-eyebrow">Step 1 of 2</div>
          <h2>My Cart ({cartSummary.totalItems})</h2>
          {cartItems.map((item) => (
            <article key={item.id} className="cart-item">
              <img src={item.images[0]} alt={item.title} />
              <div className="cart-copy">
                <h3>{item.title}</h3>
                <p>{item.brand}</p>
                <p className="delivery-copy">{item.delivery}</p>
                <div className="current-price">{formatPrice(item.price.current)}</div>
                <div className="cart-actions">
                  <div className="quantity-switcher">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                  <button className="text-button" onClick={() => removeFromCart(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="price-panel section-card">
        <h3>Price Details</h3>
        <div className="price-detail-row">
          <span>Price ({cartSummary.totalItems} items)</span>
          <strong>{formatPrice(cartSummary.subtotal)}</strong>
        </div>
        <div className="price-detail-row">
          <span>Discount</span>
          <strong className="success-text">- {formatPrice(cartSummary.discount)}</strong>
        </div>
        <div className="price-detail-row">
          <span>Delivery Charges</span>
          <strong>{formatPrice(cartSummary.deliveryFee)}</strong>
        </div>
        <div className="price-detail-row total">
          <span>Total Amount</span>
          <strong>{formatPrice(cartSummary.total)}</strong>
        </div>
        <p className="assurance-copy">
          Safe and Secure Payments. Easy returns. 100% genuine products.
        </p>
        <button className="btn btn-primary block" onClick={() => navigate("/checkout")}>
          Place Order
        </button>
      </aside>
    </div>
  );
}
