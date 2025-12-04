import React, { createContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, updateCart] = useState([]);
    const [directBuy, setDirectBuy] = useState(null);

    function addToCart(product, quantity = 1) {
        updateCart(prevCart => {
            const existingItem = prevCart.find(item => item.details.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.details.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                return [...prevCart, { details: product, quantity, isChecked: true }];
            }
        });
    }

    function removeFromCart(cartItem) {
        updateCart(prevCart => prevCart.filter(item => item.details.product_id !== cartItem.details.product_id));
    }

    function addQuantity(cartItem) {
        updateCart(prevCart =>
            prevCart.map(item =>
                item.details.product_id === cartItem.details.product_id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    }

    function subtractQuantity(cartItem) {
        if (cartItem.quantity === 1) {
            removeFromCart(cartItem);
            return;
        }
        updateCart(prevCart =>
            prevCart.map(item =>
                item.details.product_id === cartItem.details.product_id
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        );
    }

    function clearBought() {
        updateCart(prevCart => prevCart.filter(item => !item.isChecked));
    }

    function buyProduct(item) {
        setDirectBuy(item);
    }

    function toggleItemChecked(cartItem) {
        updateCart(prevCart =>
            prevCart.map(item =>
                item.details.product_id === cartItem.details.product_id
                    ? { ...item, isChecked: !item.isChecked }
                    : item
            )
        );
    }

    const value = {
        cart,
        directBuy,
        setDirectBuy,
        addToCart,
        removeFromCart,
        addQuantity,
        subtractQuantity,
        clearBought,
        buyProduct,
        toggleItemChecked
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;