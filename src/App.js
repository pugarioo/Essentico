import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import Cart from './components/Cart.js'
import Checkout from './components/Checkout';
import CartContext  from './contexts/CartContext';
import ProductContext from './contexts/ProductContext'
import data from './data/sampledata.json';


function App() {
    const [cart, updateCart] = useState([]);

    function addToCart(product) {
        updateCart(prevCart => {
            const existingItem = prevCart.find(
                item => item.details.product_id === product.product_id 
            )

            if (existingItem) {
                return prevCart.map(item =>
                item.details.product_id === product.product_id
                    ? { ...item, quantity: item.quantity + 1 } 
                    : item 
                );
            }
            else {
                return [...prevCart, {details: product, quantity: 1, isChecked: false}]
            }
        }

        )
    }
    
    function removeFromCart (cartItem) {
        updateCart(prevCart => prevCart.filter(item => item.details.product_id !== cartItem.details.product_id))
    }

    function addQuantity (cartItem) {
      
    }

    return (
        <Router>
            <div className="App">
                <Navbar />
                <ProductContext.Provider value={  data}>
                    <CartContext.Provider value={{cart}}>
                    <main className="main-content">
                        <Routes>
                            <Route path="/" element={<Home/>} />
                            <Route path="/products" element={<ProductList />} />
                            <Route path="/products/:id" element={<ProductDetails/>} />
                            <Route path="/cart" element={<Cart/>}/>
                            <Route path="/Checkout" element={<Checkout />} />
                        </Routes>
                    </main>
                    </CartContext.Provider>
                </ProductContext.Provider>
            </div>
        </Router>
    );
}	

export default App;