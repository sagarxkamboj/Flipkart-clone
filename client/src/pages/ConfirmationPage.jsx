import { Link, useLocation, useParams } from "react-router-dom";

export default function ConfirmationPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="page-container">
      <div className="confirmation-card">
        <div className="confirmation-badge">Order placed successfully</div>
        <h1>Thank you for shopping with us</h1>
        <p>
          Your order ID is <strong>{orderId}</strong>.
        </p>
        {order ? (
          <p>
            Estimated delivery for {order.address.fullName} in {order.address.city}.
          </p>
        ) : null}
        <Link to="/" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
