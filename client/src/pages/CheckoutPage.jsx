import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../api";
import { StoreContext } from "../context/StoreContext";

const initialForm = {
  fullName: "",
  phone: "",
  pincode: "",
  city: "",
  state: "",
  addressLine: ""
};

function formatPrice(value) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartSummary, clearCart } = useContext(StoreContext);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function placeOrder(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(apiUrl("/api/orders"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          address: form,
          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity
          }))
        })
      });

      const data = await response.json();
      clearCart();
      navigate(`/order-confirmation/${data.order.id}`, { state: { order: data.order } });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!cartItems.length) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="page-container checkout-layout">
      <form className="section-card address-form" onSubmit={placeOrder}>
        <div className="section-eyebrow">Step 2 of 2</div>
        <h2>Delivery Address</h2>
        <div className="form-grid">
          {Object.entries(initialForm).map(([field]) => (
            <label key={field}>
              <span>{field.replace(/([A-Z])/g, " $1")}</span>
              <input
                required
                value={form[field]}
                onChange={(event) =>
                  setForm((current) => ({ ...current, [field]: event.target.value }))
                }
              />
            </label>
          ))}
        </div>
        <button className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Placing order..." : "Confirm Order"}
        </button>
      </form>

      <aside className="section-card checkout-summary">
        <h3>Order Summary</h3>
        {cartItems.map((item) => (
          <div key={item.id} className="checkout-item">
            <span>
              {item.title} x {item.quantity}
            </span>
            <strong>{formatPrice(item.price.current * item.quantity)}</strong>
          </div>
        ))}
        <div className="price-detail-row total">
          <span>Total</span>
          <strong>{formatPrice(cartSummary.total)}</strong>
        </div>
        <p className="assurance-copy">
          Order ID will be generated instantly after confirmation.
        </p>
      </aside>
    </div>
  );
}
