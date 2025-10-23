import React, { useContext } from "react";
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CartContext from "../contexts/CartContext";
import "./Cart.css";
import cartBg from '../assets/images/products-bg.jpg';

// This is a new helper function for formatting currency
const formatCurrency = (value) => {
    return value.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });
}

function CartItem({ item }) {
    // These functions now come from context
    const { addQuantity, subtractQuantity, removeFromCart, toggleItemChecked } = useContext(CartContext);
    
    // FIX: Access properties inside 'item.details'
    const imagePath = require(`../assets/images/${item.details.image_filename}`);
    
    // Calculate subtotal for this item
    const itemSubtotal = item.details.price * item.quantity;

    return (
        <div className="cart-item">

            <input 
              type="checkbox" 
              className="cart-item-checkbox" 
              checked={item.isChecked}  
              onChange={() => toggleItemChecked(item)}
            />

            <img src={imagePath} alt={item.details.name} className="cart-item-image" />

            <div className="cart-item-details">
                <h4>{item.details.name}</h4>
                <h3>{formatCurrency(itemSubtotal)}</h3>
            </div>

            <div className="cart-item-actions">
                <button
                    className="trash-btn"
                    onClick={() => removeFromCart(item)}
                    title="Remove item">
                    <i className="fa-solid fa-trash trash-btn"></i>
                </button>

                <div className="quantity-controls">
                    {/* FIX: Swapped functions. '-' should call subtractQuantity */}
                    <button onClick={() => subtractQuantity(item)}>-</button>
                    <span>{item.quantity}</span>
                    {/* FIX: Swapped functions. '+' should call addQuantity */}
                    <button onClick={() => addQuantity(item)}>+</button>
                </div>
            </div>
        </div>
    );
}

function Cart () {
    const { cart } = useContext(CartContext);
    
    // --- CALCULATIONS ---
    // We only sum items that are checked
    const subtotal = cart.reduce((total, item) => {
        if (item.isChecked) {
            return total + (item.details.price * item.quantity);
        }
        return total;
    }, 0); // Start total at 0

    // Set a fixed delivery fee (you can make this dynamic later)
    const deliveryFee = subtotal > 0 ? 50 : 0;
    
    
    const total = subtotal + deliveryFee;
    
    const isCheckoutDisabled = subtotal === 0

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
                    {cart.length > 0 ? (
                        cart.map((item) => (
                            // FIX: Added the required 'key' prop for React
                            <CartItem key={item.details.product_id} item={item} />
                        ))
                    ) : (
                        <p>Your cart is empty.</p>
                    )}
                </div>

                {/* RIGHT: Summary */}
                <div className="order-summary">
                    <h3>Order Summary</h3>
                    <div className='summary-breakdown'>

                        <div className="summary-item">
                            <span>Subtotal</span>
                            {/* FIX: Display calculated subtotal */}
                            <span>{formatCurrency(subtotal)}</span>
                        </div>

                        <div className="summary-item">
                            <span>Delivery Fee</span>
                            {/* FIX: Display calculated delivery fee */}
                            <span>{formatCurrency(deliveryFee)}</span>
                        </div>

                    </div>
                    <hr />
                    <div className="summary-item total">
                        <span>Total</span>
                        {/* FIX: Display calculated total */}
                        <span>{formatCurrency(total)}</span>
                    </div>

                    <div className="promo-section">
                        <input type="text" placeholder="Add promo code" />
                        <button className="apply-btn">Apply</button>
                    </div>
                    {isCheckoutDisabled ? (
                            <Button 
                                variant="dark" 
                                className="checkout-btn" 
                                disabled
                            >
                                Go to Checkout →
                            </Button>
                        ) : (
                            <Button 
                                variant="dark" 
                                as={Link} 
                                to="/checkout" 
                                className="checkout-btn"
                            >
                                Go to Checkout →
                            </Button>
                        )}
                </div>
            </div>
        </div>
    );
};

export default Cart;