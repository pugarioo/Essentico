import React, { useState } from "react";

import "./cart.css";

// import { FaTrashAlt } from "react-icons/fa";



const Cart = () => {

  const [cartItems, setCartItems] = useState([

    {

      id: 1,

      name: "Bean Bag Soft and comfortable Lounger chair",

      color: "Orange",

      price: 360,

      quantity: 1,

      image: "/images/beanorange.jpg", // place your image in public/images/

    },

    {

      id: 2,

      name: "Bath Towel",

      color: "Pink",

      price: 200,

      quantity: 1,

      image: "/images/towel.jpg", // place your image in public/images/

    },

  ]);



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

      <h2 className="cart-title">Your Cart</h2>



      <div className="cart-content">

        {/* LEFT: Items */}

        <div className="cart-items">

          {cartItems.map((item) => (

            <div key={item.id} className="cart-item">

              <img src={item.image} alt={item.name} className="cart-item-image" />



              <div className="cart-item-details">

                <h4>{item.name}</h4>

                <p>Color: {item.color}</p>

                <h3>₱ {item.price}</h3>

              </div>



              <div className="cart-item-actions">

                <button

                  className="trash-btn"

                  onClick={() => removeItem(item.id)}

                  title="Remove item"

                >

                  {/* <FaTrashAlt /> */}

                </button>



                <div className="quantity-controls">

                  <button onClick={() => updateQuantity(item.id, -1)}>-</button>

                  <span>{item.quantity}</span>

                  <button onClick={() => updateQuantity(item.id, 1)}>+</button>

                </div>

              </div>

            </div>

          ))}

        </div>



        {/* RIGHT: Summary */}

        <div className="order-summary">

          <h3>Order Summary</h3>

          <div className="summary-item">

            <span>Subtotal</span>

            <span>₱ {subtotal}</span>

          </div>

          <div className="summary-item">

            <span>Delivery Fee</span>

            <span>₱ {deliveryFee}</span>

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



          <button className="checkout-btn">Go to Checkout →</button>

        </div>

      </div>

    </div>

  );

};



export default Cart;
