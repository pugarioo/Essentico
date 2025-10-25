// src/components/QuantityPopup.js

import React, { useContext, useState, useEffect } from 'react';
import PopupContext from '../contexts/PopupContext';
import './Popup.css'; // We'll reuse/create this for styling

export default function QuantityPopup() {
    // 1. Get state and functions from the context
    const { popup, hidePopup } = useContext(PopupContext);
    
    // 2. Create internal state to manage the quantity
    const [quantity, setQuantity] = useState(1);

    // 3. Reset quantity to 1 every time a new product is shown
    useEffect(() => {
        setQuantity(1);
    }, [popup.product]); // Re-run this when the product changes

    // 4. If not visible, render nothin
    if (!popup.isVisible) {
        return null;
    }

    // 5. Get the product details
    const { product, onConfirm } = popup;

    const handleConfirm = () => {
        onConfirm(quantity); // Pass the final quantity to the confirm function
        hidePopup();         // Close the modal
    };

    return (
        // The 'popup-overlay' darkens the backgroundwa
        <div className="popup-overlay" onClick={hidePopup}>
            {/* The 'popup-content' stops the click from closing the modal */}
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                
                <h3>{product.name}</h3>
                <p>Price: ₱{product.price}</p>
                
                <div className="quantity-controls">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)}>+</button>
                </div>

                <div className="popup-buttons">
                    <button onClick={hidePopup} className="cancel-btn">Cancel</button>
                    <button onClick={handleConfirm} className="confirm-btn">Confirm</button>
                </div>

            </div>
        </div>
    );
}