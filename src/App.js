import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Popup from './components/Popup';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import Cart from './components/Cart.js'
import Checkout from './components/Checkout';
import CartContext  from './contexts/CartContext';
import ProductContext from './contexts/ProductContext'
import PopupContext from './contexts/PopupContext';
import data from './data/sampledata.json';


function App() {
    const [cart, updateCart] = useState([]);
    const [directBuy, setDirectBuy] = useState(null)
    const [popup, setPopup] = useState({
        isVisible: false,
        product: null,
        quantity: null
    })

    function addToCart(product, quantity=1) {
        updateCart(prevCart => {
            const existingItem = prevCart.find(
                item => item.details.product_id === product.product_id 
            )

            if (existingItem) {
                return prevCart.map(item =>
                item.details.product_id === product.product_id
                    ? { ...item, quantity: item.quantity + quantity } 
                    : item 
                );
            }
            else {
                return [...prevCart, {details: product, quantity: quantity, isChecked: true}]
            }
        }

        )
    }
    
    function removeFromCart (cartItem) {
        updateCart(prevCart => prevCart.filter(item => item.details.product_id !== cartItem.details.product_id))
    }

    function addQuantity (cartItem) {
		updateCart(prevCart => 
			prevCart.map(item =>
                item.details.product_id === cartItem.details.product_id
                    ? { ...item, quantity: item.quantity + 1 } 
                    : item 
            ))
    }

	function subtractQuantity (cartItem) {

		if (cartItem.quantity === 1) {
			removeFromCart(cartItem)
			return
		}

		updateCart(prevCart => 
			prevCart.map(item =>
                item.details.product_id === cartItem.details.product_id
                    ? { ...item, quantity: item.quantity - 1 } 
                    : item 
            ))
    }

    function clearBought () {
        updateCart(prevCart => prevCart.filter(item => !item.isChecked))
    }

	function buyProduct(item) {
        
		setDirectBuy(item);
	}

	function toggleItemChecked(cartItem) {
        updateCart(prevCart => 
            prevCart.map(item => 
                item.details.product_id === cartItem.details.product_id
                    ? { ...item, isChecked: !item.isChecked } // Toggles the boolean
                    : item
            )
        );
    }
    function showPopup (product, onConfirmCallback) {
        setPopup({
            isVisible: true,
            product: product,
            // 'onConfirm' will be a function that takes a quantity
            onConfirm: (quantity) => onConfirmCallback(quantity) 
        });
    };

    function hidePopup () {
        setPopup({ isVisible: false, product: null, onConfirm: null });
    };
    

	const cartContextValue = {
        cart,
        addToCart,
        removeFromCart,
        addQuantity,
        subtractQuantity,
        toggleItemChecked,
        buyProduct,
        directBuy,
        setDirectBuy,
        clearBought
	};

    const popupContextValue = {
        popup,
        showPopup,
        hidePopup,
    }
    
    return (
        <Router>
            <div className="App">
                <Navbar />
                <ProductContext.Provider value={data}>
                    <CartContext.Provider value={cartContextValue}>
                        <PopupContext.Provider value={popupContextValue}>
                            <main className="main-content">
                                <Routes>
                                    <Route path="/" element={<Home/>} />
                                    <Route path="/products" element={<ProductList />} />
                                    <Route path="/products/:id" element={<ProductDetails/>} />
                                    <Route path="/cart" element={<Cart/>}/>
                                    <Route path="/checkout" element={<Checkout />} />
                                </Routes>
                            </main>
                            <Popup/>
                        </PopupContext.Provider>
                    </CartContext.Provider>
                </ProductContext.Provider>
            </div>
        </Router>
    );
}	

export default App;