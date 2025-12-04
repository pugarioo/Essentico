import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Popup from './components/Popup';

// Pages
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import Cart from './components/cart'; // (Note: capitalize component filename usually: Cart.js)
import Checkout from './components/Checkout';
import Login from './pages/Login';
import Accounts from './pages/Accounts';

// Context Providers
import { ProductProvider } from './contexts/ProductContext';
import { CartProvider } from './contexts/CartContext';
import { PopupProvider } from './contexts/PopupContext';
import { AuthProvider } from './contexts/AuthContext'; // Using the Auth one we made earlier

function App() {
    return (
        <Router>
            <div className="App">
                <AuthProvider>
                    <ProductProvider>
                        <CartProvider>
                            <PopupProvider>
                                
                                <Navbar />
                                
                                <main className="main-content">
                                    <Routes>
                                        <Route path="/" element={<Home />} />
                                        <Route path="/products" element={<ProductList />} />
                                        <Route path="/products/:id" element={<ProductDetails />} />
                                        <Route path="/cart" element={<Cart />} />
                                        <Route path="/checkout" element={<Checkout />} />
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/accounts" element={<Accounts />} />
                                    </Routes>
                                </main>

                                {/* Popup can access PopupContext because it's inside the Provider */}
                                <Popup />

                            </PopupProvider>
                        </CartProvider>
                    </ProductProvider>
                </  AuthProvider>
            </div>
        </Router>
    );
}

export default App;