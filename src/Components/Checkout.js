import React, { useContext, useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom"
import "./Checkout.css";
import checkoutbg from "../assets/images/products-bg.jpg"
import CartContext from "../contexts/CartContext";
import UserContext from "../contexts/UserContext";

const Checkout = () => {
  const { user } = useContext(UserContext);
  const { cart, directBuy, setDirectBuy, clearBought } = useContext(CartContext)
  const [selectedOption, setSelectedOption] = useState("Delivery");
  const [selectedPayment, setSelectedPayment] = useState("paypal"); // state for selected payment
  const [order, setOrder] = useState(null);
  const navigate = useNavigate()
  const [shippingAddress, setShippingAddress] = useState("");
  const [cardName, setCardName] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);

  // Auto-populate shipping address and card name from user profile
  useEffect(() => {
    if (user) {
      if (user.address && !shippingAddress) {
        setShippingAddress(user.address);
      }
      if (user.name && !cardName) {
        setCardName(user.name);
      }
    }
  }, [user]);

  useEffect(() => {  
    // If directBuy is set, create an order based on it
    if (directBuy !== null) {
      setOrder(directBuy);
      console.log("Order set from directBuy:", directBuy);
    } else {
      // Otherwise, create an order based on checked items in the cart
      const checkedItems = cart.filter(item => item.isChecked);
      if (checkedItems.length > 0) {
        setOrder(checkedItems);
        console.log("Order set from cart:", checkedItems);
      } else {
        setOrder(null);
        console.log("No checked items in cart");
      }
    }
  }, [cart, directBuy]);

  // handle Pay Now button
  const handlePayNow = async () => {
    // Validation checks
    if (!user || !user.id) {
      alert("Please log in to place an order.");
      navigate("/login");
      return;
    }

    if (!order || (Array.isArray(order) && order.length === 0)) {
      alert("No items selected for order. Please add items to your cart.");
      return;
    }

    if (!shippingAddress.trim()) {
      alert("Please enter a shipping address.");
      return;
    }

    setIsOrdering(true);
    
    try {
      // Prepare order items in the format backend expects
      // Backend expects: items[0].details.id and items[0].details.price
      let orderItems = [];
      
      if (directBuy !== null) {
        // For direct buy, format as single item with nested details
        orderItems = [{
          details: {
            id: directBuy.details.id,
            price: directBuy.details.price
          },
          quantity: directBuy.quantity
        }];
      } else {
        // For cart items, map to backend format with nested details
        const checkedItems = cart.filter(item => item.isChecked);
        if (checkedItems.length === 0) {
          alert("No checked items in cart.");
          setIsOrdering(false);
          return;
        }
        orderItems = checkedItems.map(item => ({
          details: {
            id: item.details.id,
            price: item.details.price
          },
          quantity: item.quantity
        }));
      }

      const orderData = {
        user_id: user.id,
        items: orderItems,
        total_amount: total,
        status: "pending",
        payment_method: selectedPayment,
        delivery_address: shippingAddress,
      };

      console.log("Submitting order:", orderData);

      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:8082/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        alert("Payment Successful! Thank you for your purchase.");
        navigate("/products");
        directBuy === null ? clearBought() : setDirectBuy(null);
      } else {
        // Handle Laravel validation errors
        let errorMessage = "Payment Failed! Please try again.";
        
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        }
        
        // If there are validation errors, show them
        if (responseData.errors) {
          const errorMessages = Object.values(responseData.errors)
            .flat()
            .filter(msg => msg)
            .join('\n');
          if (errorMessages) {
            errorMessage = errorMessages;
          }
        }
        
        alert(errorMessage);
        console.error("Order failed - Full response:", responseData);
        console.error("Order data sent:", orderData);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Payment Failed! Please try again.");
    } finally {
      setIsOrdering(false);
    }
  };

  // handle Back button
  const handleBack = () => {
    window.history.back();
  };

  const subtotal = () => {
        if (directBuy !== null) {
          return directBuy.details.price * directBuy.quantity
        }
        else {
          return cart.reduce((total, item) => {
            
            if (item.isChecked) {
                return total + (item.details.price * item.quantity);
            }
            return total;
          }, 0);
        }
  }
  const deliveryFee = subtotal() > 0 ? 50 : 0;
  const total = subtotal() + deliveryFee;

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
              <Form.Control type="text" placeholder="Enter address" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} />
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
              <Form.Control 
                type="text" 
                placeholder="Enter name" 
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
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

            <div className="summary-items">
                  { 
                     (directBuy !== null) ? (
                      <div className="summary-item-products">
                                <span>x{directBuy.quantity} {directBuy.details.name}</span>
                                <span>{directBuy.details.currency}{directBuy.details.price}</span>
                      </div>  
                     ) : (
                      cart.map(item => (
                          <div className="summary-item-products">
                                <span>x{item.quantity} {item.details.name}</span>
                                <span>{item.details.currency}{item.details.price}</span>
                          </div>  
                      ))
                     )
                  }
            </div>

            <hr/>
            <div className="summary-item">
              <span>Subtotal</span>
              <span>₱ {subtotal().toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span>Delivery Fee</span>
              <span>₱ {deliveryFee.toFixed(2)}</span>
            </div>
            <div className="summary-item total">
              <span>Order Total</span>
              <span>₱ {total.toFixed(2)}</span>
            </div>

            <div className="promo">
              <input type="text" placeholder="Add promo code" />
              <button>Apply</button>
            </div>

            <button className="pay-now" onClick={handlePayNow} disabled={isOrdering}>
              {isOrdering ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </div>

        {/* BACK BUTTON BELOW */}
        <button className="back-btn" onClick={handleBack}>
          <i className="fa-solid fa-arrow-left arrow"></i> 
        </button>
      </div>
    </div>
  );
};

export default Checkout;
