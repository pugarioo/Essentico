import React, { useContext, useState } from "react";
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CartContext from "../contexts/CartContext";
import "./Cart.css";
import cartBg from '../assets/images/products-bg.jpg';

function CartItem({ item, updateQuantity, removeItem }) {
  const imagePath = require(`../assets/images/${item.image_filename}`);
  return (
    <div key={item.id} className="cart-item">
        <input type="checkbox" className="cart-item-checkbox" />

        

      <img src={imagePath} alt={item.name} className="cart-item-image" />

      <div className="cart-item-details">
        <h4>{item.name}</h4>
        <p>Color: {item.color}</p>
        <h3>₱ {item.price}</h3>
      </div>

      <div className="cart-item-actions">
        <button
          className="trash-btn"
          onClick={() => removeItem(item.id)}
          title="Remove item">
            <i className="fa-solid fa-trash trash-btn"></i>
        </button>

        <div className="quantity-controls">
          <button onClick={() => updateQuantity(item.id, -1)}>-</button>
            <span>{item.quantity}</span>
          <button onClick={() => updateQuantity(item.id, 1)}>+</button>
        </div>

      </div>
    </div>
  )
}

function Cart () {
  const cart = useContext(CartContext);

  const deliveryFee = 36;

  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const total = subtotal + deliveryFee;

  return (
    <div className="cart-container">
      <div
      className="cart-bg"
      style={{ backgroundImage: `url(${cartBg})` }}
      ></div>
      <h2 className="cart-title">Your Cart</h2>

      <div className="cart-content">
        {/* LEFT: Items */}
        <div className="cart-items">
          {cartItems.map((item) => (
            <CartItem 
            key={item.id}
            item={item}
            updateQuantity={updateQuantity}
            removeItem={removeItem} />
          ))}
        </div>

        {/* RIGHT: Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className='summary-breakdown'>

            <div className="summary-item">
              <span>Subtotal</span>
              <span>₱ {subtotal}</span>
            </div>

            <div className="summary-item">
              <span>Delivery Fee</span>
              <span>₱ {deliveryFee}</span>
            </div>

          </div>
          <hr />
          <div className="summary-item total">
            <span>Total</span>
            <span>₱ {total}</span>
          </div>

          <div className="promo-section">
            <input type="text" placeholder="Add promo code" />
            <button className="apply-btn">Apply</button>
          </div>
          <Button variant="dark" as={Link} to="/checkout" className="checkout-btn">
            Go to Checkout →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;