import React, { useContext, useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom"
import "./Checkout.css";
import checkoutbg from "../assets/images/products-bg.jpg"
import CartContext from "../contexts/CartContext";
import UserContext from "../contexts/UserContext";
import ProductContext from "../contexts/ProductContext";

const Checkout = () => {
  const { user } = useContext(UserContext);
  const { cart, directBuy, setDirectBuy, clearBought } = useContext(CartContext);
  const { validateDiscountCode } = useContext(ProductContext);
  const [selectedOption, setSelectedOption] = useState("Delivery");
  const [selectedPayment, setSelectedPayment] = useState("paypal"); // state for selected payment
  const [order, setOrder] = useState(null);
  const navigate = useNavigate()
  const [shippingAddress, setShippingAddress] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiration, setExpiration] = useState("");
  const [cvv, setCvv] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState("");

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

    // Validate all required fields
    if (!shippingAddress.trim()) {
      alert("Please enter a shipping address.");
      return;
    }

    if (!cardName.trim()) {
      alert("Please enter the name on card.");
      return;
    }

    if (!cardNumber.trim()) {
      alert("Please enter your card number.");
      return;
    }

    // Validate card number format (basic check - should be 13-19 digits)
    const cardNumberDigits = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cardNumberDigits)) {
      alert("Please enter a valid card number (13-19 digits).");
      return;
    }

    if (!expiration.trim()) {
      alert("Please enter the card expiration date.");
      return;
    }

    // Validate expiration format (MM/YY)
    if (!/^\d{2}\/\d{2}$/.test(expiration.trim())) {
      alert("Please enter expiration date in MM/YY format.");
      return;
    }

    if (!cvv.trim()) {
      alert("Please enter the CVV.");
      return;
    }

    // Validate CVV format (3-4 digits)
    if (!/^\d{3,4}$/.test(cvv.trim())) {
      alert("Please enter a valid CVV (3-4 digits).");
      return;
    }

    if (!termsAccepted) {
      alert("Please accept the Terms and Conditions to proceed.");
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
        delivery_method: selectedOption,
      };
      
      // Include discount code and discount value if discount is applied
      if (appliedDiscount && appliedDiscount.discount_code) {
        orderData.discount_code = appliedDiscount.discount_code;
        
        // Get discount value (check both 'value' and 'discount_value' field names)
        const discountValue = appliedDiscount.value !== undefined && appliedDiscount.value !== null 
          ? appliedDiscount.value 
          : (appliedDiscount.discount_value !== undefined && appliedDiscount.discount_value !== null 
              ? appliedDiscount.discount_value 
              : null);
        
        if (discountValue !== null) {
          orderData.discount_value = discountValue;
        }
      }

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
  
  // Calculate discount using percentage value
  let discountAmount = 0;
  if (appliedDiscount) {
      // Check for both 'value' and 'discount_value' field names (backend compatibility)
      const discountPercentage = appliedDiscount.value !== undefined && appliedDiscount.value !== null 
          ? appliedDiscount.value 
          : (appliedDiscount.discount_value !== undefined && appliedDiscount.discount_value !== null 
              ? appliedDiscount.discount_value 
              : null);
      
      if (discountPercentage !== null && discountPercentage > 0) {
          // discount value is a percentage (e.g., 10 means 10%)
          discountAmount = (subtotal() * discountPercentage) / 100;
          // Ensure discount doesn't exceed subtotal (prevent negative totals)
          discountAmount = Math.min(discountAmount, subtotal());
      }
  }
  
  const total = Math.max(0, subtotal() + deliveryFee - discountAmount);
  
  const handleApplyDiscount = () => {
    if (!discountCode.trim()) {
      setDiscountError("Please enter a discount code");
      return;
    }
    
    const validation = validateDiscountCode(discountCode);
    if (validation.valid) {
      setAppliedDiscount(validation.discount);
      setDiscountError("");
    } else {
      setAppliedDiscount(null);
      setDiscountError(validation.message);
    }
  };
  
  const handleRemoveDiscount = () => {
    setDiscountCode("");
    setAppliedDiscount(null);
    setDiscountError("");
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
              <Form.Label>Card number *</Form.Label>
              <div className="card-input">
                <Form.Control 
                  type="text" 
                  placeholder="Enter card number" 
                  value={cardNumber}
                  onChange={(e) => {
                    // Allow only digits and spaces, format as user types
                    const value = e.target.value.replace(/\D/g, '');
                    // Add space every 4 digits
                    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                    setCardNumber(formatted);
                  }}
                  maxLength={19}
                  required
                />
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
                <Form.Label>Expiration *</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="MM/YY" 
                  value={expiration}
                  onChange={(e) => {
                    // Format as MM/YY
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.substring(0, 2) + '/' + value.substring(2, 4);
                    }
                    setExpiration(value);
                  }}
                  maxLength={5}
                  required
                />
              </Form.Group>
              <Form.Group className='fgroup'>
                <Form.Label>CVV *</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="CVV" 
                  value={cvv}
                  onChange={(e) => {
                    // Allow only digits, max 4
                    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
                    setCvv(value);
                  }}
                  maxLength={4}
                  required
                />
              </Form.Group>
            </div>

            <div className="terms">
              <Form.Check
                type="checkbox"
                label="I have read and agree to the Terms and Conditions *"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
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
            {appliedDiscount && (
              <div className="summary-item" style={{ color: '#28a745' }}>
                <span>Discount ({appliedDiscount.discount_code})</span>
                <span>-₱ {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-item total">
              <span>Order Total</span>
              <span>₱ {total.toFixed(2)}</span>
            </div>

            <div className="promo">
              {appliedDiscount ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                    <span style={{ flex: 1, color: '#28a745', fontSize: '14px' }}>
                      {appliedDiscount.discount_code} applied
                    </span>
                    <button onClick={handleRemoveDiscount} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <input 
                    type="text" 
                    placeholder="Add promo code" 
                    value={discountCode}
                    onChange={(e) => {
                      setDiscountCode(e.target.value);
                      setDiscountError("");
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleApplyDiscount();
                      }
                    }}
                  />
                  <button onClick={handleApplyDiscount}>Apply</button>
                </>
              )}
              {discountError && (
                <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px' }}>
                  {discountError}
                </div>
              )}
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
