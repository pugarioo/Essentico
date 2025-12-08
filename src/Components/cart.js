import React, { useContext, useState } from "react";
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CartContext from "../contexts/CartContext";
import ProductContext from "../contexts/ProductContext";
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
    const imagePath = `http://localhost:8082/storage/products/${item.details.image_filename}`;
    
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
    const { cart, isLoadingCart } = useContext(CartContext);
    const { validateDiscountCode } = useContext(ProductContext);
    const [discountCode, setDiscountCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [discountError, setDiscountError] = useState("");
    
    // --- CALCULATIONS ---
    // We only sum items that are checked
    const subtotal = cart.reduce((total, item) => {
        if (item.isChecked) {
            return total + (item.details.price * item.quantity);
        }
        return total;
    }, 0);

    const deliveryFee = subtotal > 0 ? 50 : 0;
    
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
            discountAmount = (subtotal * discountPercentage) / 100;
            // Ensure discount doesn't exceed subtotal (prevent negative totals)
            discountAmount = Math.min(discountAmount, subtotal);
        }
    }
    
    const total = Math.max(0, subtotal + deliveryFee - discountAmount);
    const isCheckoutDisabled = subtotal === 0;
    
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
        <div className="cart-container">
            <div
                className="cart-bg"
                style={{ backgroundImage: `url(${cartBg})` }}
            ></div>
            <h2 className="cart-title">Your Cart</h2>

            <div className="cart-content">
                {/* LEFT: Items */}
                <div className="cart-items">
                    {isLoadingCart ? (
                        <p>Loading cart...</p>
                    ) : cart.length > 0 ? (
                        cart.map((item) => (
                            // FIX: Added the required 'key' prop for React
                            <CartItem key={item.id || item.details.id} item={item} />
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
                        
                        {appliedDiscount && (
                            <div className="summary-item" style={{ color: '#28a745' }}>
                                <span>Discount ({appliedDiscount.discount_code})</span>
                                <span>-{formatCurrency(discountAmount)}</span>
                            </div>
                        )}

                    </div>
                    <hr />
                    <div className="summary-item total">
                        <span>Total</span>
                        {/* FIX: Display calculated total */}
                        <span>{formatCurrency(total)}</span>
                    </div>

                    <div className="promo-section">
                        {appliedDiscount ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                                <span style={{ flex: 1, color: '#28a745', fontSize: '14px' }}>
                                    {appliedDiscount.discount_code} applied
                                </span>
                                <button className="apply-btn" onClick={handleRemoveDiscount} style={{ backgroundColor: '#dc3545' }}>
                                    Remove
                                </button>
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
                                <button className="apply-btn" onClick={handleApplyDiscount}>Apply</button>
                            </>
                        )}
                        {discountError && (
                            <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px' }}>
                                {discountError}
                            </div>
                        )}
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
}

export default Cart;
