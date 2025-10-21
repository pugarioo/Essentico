import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import "./Checkout.css";
import checkoutbg from "../assets/images/products-bg.jpg"

const Checkout = () => {
  const [selectedOption, setSelectedOption] = useState("Delivery");
  const [selectedPayment, setSelectedPayment] = useState("paypal"); // state for selected payment

  // handle Pay Now button
  const handlePayNow = () => {
    alert("Payment Successful! Thank you for your purchase.");
  };

  // handle Back button
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="checkout-container">

      <div className='checkout-bg'
      style={{ backgroundImage: `url(${checkoutbg})` }}>  
      </div>
      <h2 className="checkout-title">Shipping information</h2>

      <div className="checkout-content">
        {/* LEFT + RIGHT SECTIONS */}
        <div className="checkout-sections">
          {/* LEFT SIDE */}
          <div className="shipping-section">
            {/* Delivery / Pickup options */}
            <div className="delivery-options">
              <div
                className={`option ${selectedOption === "Delivery" ? "selected" : ""}`}
                onClick={() => setSelectedOption("Delivery")}
              >
                <span role="img" aria-label="truck">🚚</span> Delivery
              </div>
              <div
                className={`option ${selectedOption === "Pick Up" ? "selected" : ""}`}
                onClick={() => setSelectedOption("Pick Up")}
              >
                <span role="img" aria-label="box">📦</span> Pick Up
              </div>
            </div>

            {/* Shipping Address */}
            <Form.Group className="mb-3 fgroup">
              <Form.Label>Shipping address</Form.Label>
              <Form.Control type="text" placeholder="Enter address" />
            </Form.Group>

            {/* PAYMENT INFORMATION */}
            <h5 className="payment-title">Payment Information</h5>
            <div className="payment-icons">
              {/* Payment buttons */}
              <button
                type="button"
                className={`payment-btn ${selectedPayment === "paypal" ? "selected-payment" : ""}`}
                onClick={() => setSelectedPayment("paypal")}
              >
                <img
                  src={require("../assets/images/paypal.png")}
                  alt="PayPal"
                />
              </button>

              <button
                type="button"
                className={`payment-btn ${selectedPayment === "visa" ? "selected-payment" : ""}`}
                onClick={() => setSelectedPayment("visa")}
              >
                <img
                  src={require("../assets/images/visa.png")}
                  alt="Visa"
                />
              </button>

              <button
                type="button"
                className={`payment-btn ${selectedPayment === "mastercard" ? "selected-payment" : ""}`}
                onClick={() => setSelectedPayment("mastercard")}
              >
                <img
                  src={require("../assets/images/mastercard.png")}
                  alt="Mastercard"
                />
              </button>
            </div>

            <Form.Group className="mb-3 fgroup">
              <Form.Label>Name on card</Form.Label>
              <Form.Control type="text" placeholder="Enter name" />
            </Form.Group>

            <Form.Group className="mb-3 fgroup  ">
              <Form.Label>Card number</Form.Label>
              <div className="card-input">
                <Form.Control type="text" placeholder="Enter card number" />
                <img
                  src={
                    selectedPayment === "paypal"
                      ? require("../assets/images/paypal.png")
                      : selectedPayment === "visa"
                      ? require("../assets/images/visa.png")
                      : require("../assets/images/mastercard.png")
                  }
                  alt={selectedPayment}
                  style={{ width: "30px", marginLeft: "5px" }}
                />
              </div>
            </Form.Group>

            <div className="exp-cvv">
              <Form.Group className='fgroup'>
                <Form.Label>Expiration</Form.Label>
                <Form.Control type="text" placeholder="MM/YY" />
              </Form.Group>
              <Form.Group className='fgroup'>
                <Form.Label>CVV</Form.Label>
                <Form.Control type="text" placeholder="CVV" />
              </Form.Group>
            </div>

            <div className="terms">
              <Form.Check
                type="checkbox"
                label="I have read and agree to the Terms and Conditions"
              />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="order-summary">
            <h3>Order Summary</h3>

            <div className="summary-item">
              <span>x1 Bean Bag Soft and comfortable Lounger chair</span>
              <span>₱ 360</span>
            </div>
            <div className="summary-item">
              <span>x1 Bath Towel</span>
              <span>₱ 200</span>
            </div>

            <div className="summary-item">
              <span>Delivery</span>
              <span>₱ 36</span>
            </div>

            <div className="summary-item total">
              <span>Order Total</span>
              <span>₱ 560</span>
            </div>

            <div className="promo">
              <input type="text" placeholder="Add promo code" />
              <button>Apply</button>
            </div>

            <button className="pay-now" onClick={handlePayNow}>
              Pay Now
            </button>
          </div>
        </div>

        {/* BACK BUTTON BELOW */}
        <button className="back-btn" onClick={handleBack}>
          Back
        </button>
      </div>
    </div>
  );
};

export default Checkout;
