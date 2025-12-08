import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthContext from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, updateCart] = useState([]);
    const [directBuy, setDirectBuy] = useState(null);
    const [isLoadingCart, setIsLoadingCart] = useState(false);
    const [cartError, setCartError] = useState(null);
    const { isAuthenticated } = useContext(AuthContext);

    // Fetch cart items from backend
    const fetchCartItems = async () => {
        const token = localStorage.getItem("token");
        if (!token || !isAuthenticated) {
            updateCart([]);
            return;
        }

        setIsLoadingCart(true);
        setCartError(null);

        try {
            const response = await fetch('http://localhost:8082/api/cart', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Transform backend cart items to frontend format
                // Assuming backend returns: [{ id, product_id, quantity, product: {...} }]
                // or [{ id, product_id, quantity, ...product_details }]
                const transformedCart = Array.isArray(data) ? data.map(item => {
                    // Handle different backend response structures
                    const product = item.product || item;
                    return {
                        id: item.id, // cart item id from backend
                        details: {
                            id: product.id || item.product_id,
                            name: product.name,
                            price: product.price,
                            image_filename: product.image_filename,
                            description: product.description,
                            ...product
                        },
                        quantity: item.quantity,
                        isChecked: true
                    };
                }) : [];
                updateCart(transformedCart);
            } else if (response.status === 404) {
                // Cart doesn't exist yet, start with empty cart
                updateCart([]);
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch cart items');
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            setCartError(error.message);
            // Don't clear cart on error, keep existing state
        } finally {
            setIsLoadingCart(false);
        }
    };

    // Fetch cart when user logs in or when component mounts
    useEffect(() => {
        if (isAuthenticated) {
            fetchCartItems();
        } else {
            // Clear cart when user logs out
            updateCart([]);
        }
    }, [isAuthenticated]);

    const addToCart = async (product, quantity = 1) => {
        const token = localStorage.getItem("token");
        if (!token || !isAuthenticated) {
            // If not authenticated, just update local state (for guest users)
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
            return;
        }

        try {
            // Check if item already exists in cart
            const existingItem = cart.find(item => item.details.id === product.id);
            
            if (existingItem) {
                // Update quantity via PUT
                const newQuantity = existingItem.quantity + quantity;
                const response = await fetch(`http://localhost:8082/api/cart/${existingItem.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ quantity: newQuantity })
                });

                if (response.ok) {
                    // Update local state
                    updateCart(prevCart =>
                        prevCart.map(item =>
                            item.id === existingItem.id
                                ? { ...item, quantity: newQuantity }
                                : item
                        )
                    );
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to update cart item');
                }
            } else {
                // Add new item via POST
                const response = await fetch('http://localhost:8082/api/cart', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        product_id: product.id,
                        quantity: quantity
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    // Transform response to frontend format
                    const newItem = {
                        id: data.id,
                        details: {
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image_filename: product.image_filename,
                            description: product.description,
                            ...product
                        },
                        quantity: data.quantity || quantity,
                        isChecked: true
                    };
                    updateCart(prevCart => [...prevCart, newItem]);
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to add item to cart');
                }
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert(error.message || 'Failed to add item to cart');
        }
    };

    const removeFromCart = async (cartItem) => {
        const token = localStorage.getItem("token");
        
        // Optimistically update UI
        updateCart(prevCart => prevCart.filter(item => 
            item.id !== cartItem.id && item.details.id !== cartItem.details.id
        ));

        if (!token || !isAuthenticated) {
            return; // Already updated for guest users
        }

        try {
            const response = await fetch(`http://localhost:8082/api/cart/${cartItem.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                // Revert on error
                fetchCartItems();
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to remove item from cart');
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            // Revert by fetching cart again
            fetchCartItems();
            alert(error.message || 'Failed to remove item from cart');
        }
    };

    const addQuantity = async (cartItem) => {
        const newQuantity = cartItem.quantity + 1;
        
        // Optimistically update UI
        updateCart(prevCart =>
            prevCart.map(item =>
                item.id === cartItem.id
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );

        const token = localStorage.getItem("token");
        if (!token || !isAuthenticated) {
            return; // Already updated for guest users
        }

        try {
            const response = await fetch(`http://localhost:8082/api/cart/${cartItem.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ quantity: newQuantity })
            });

            if (!response.ok) {
                // Revert on error
                fetchCartItems();
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update quantity');
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            // Revert by fetching cart again
            fetchCartItems();
            alert(error.message || 'Failed to update quantity');
        }
    };

    const subtractQuantity = async (cartItem) => {
        if (cartItem.quantity === 1) {
            removeFromCart(cartItem);
            return;
        }

        const newQuantity = cartItem.quantity - 1;
        
        // Optimistically update UI
        updateCart(prevCart =>
            prevCart.map(item =>
                item.id === cartItem.id
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );

        const token = localStorage.getItem("token");
        if (!token || !isAuthenticated) {
            return; // Already updated for guest users
        }

        try {
            const response = await fetch(`http://localhost:8082/api/cart/${cartItem.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ quantity: newQuantity })
            });

            if (!response.ok) {
                // Revert on error
                fetchCartItems();
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update quantity');
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            // Revert by fetching cart again
            fetchCartItems();
            alert(error.message || 'Failed to update quantity');
        }
    };

    const clearBought = async () => {
        const token = localStorage.getItem("token");
        const checkedItems = cart.filter(item => item.isChecked);
        
        if (!token || !isAuthenticated) {
            // For guest users, just update local state
            updateCart(prevCart => prevCart.filter(item => !item.isChecked));
            return;
        }

        // Remove all checked items from backend
        try {
            const deletePromises = checkedItems.map(item =>
                fetch(`http://localhost:8082/api/cart/${item.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                })
            );

            await Promise.all(deletePromises);
            
            // Update local state
            updateCart(prevCart => prevCart.filter(item => !item.isChecked));
        } catch (error) {
            console.error('Error clearing cart:', error);
            // Refresh cart from backend
            fetchCartItems();
            alert('Failed to clear cart items');
        }
    };

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
        toggleItemChecked,
        isLoadingCart,
        cartError,
        fetchCartItems
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;