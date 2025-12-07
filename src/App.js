import React from 'react';
import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Popup from './components/Popup';

// Pages
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import Cart from './components/cart.js'
import Checkout from './components/Checkout.js';
import CartContext  from './contexts/CartContext';
import ProductContext from './contexts/ProductContext'
import PopupContext from './contexts/PopupContext';
import data from './data/sampledata.json';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from "./components/AdminDashboard"; 
import Order from './components/Order';
import Customer from './components/Customer'; 

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

// Context Providers
import { ProductProvider } from './contexts/ProductContext';
import { CartProvider } from './contexts/CartContext';
import { PopupProvider } from './contexts/PopupContext';
import { AuthProvider } from './contexts/AuthContext'; // Using the Auth one we made earlier
import { UserProvider } from './contexts/UserContext';

import AuthContext from './contexts/AuthContext';

function App() {

    return (
        <Router>
            <div className="App">
                <AuthProvider>
                    <UserProvider>
                        <ProductProvider>
                            <CartProvider>
                                <PopupProvider>
                                    <Navbar />
                                    <AppRoutes />
                                    <Popup />
                                </PopupProvider>
                            </CartProvider>
                        </ProductProvider>
                    </UserProvider>
                </AuthProvider>
            </div>
        </Router>
    );
}


function AppRoutes() {
    const { isAuthenticated, isCheckingAuth } = useContext(AuthContext);
    
    // Show loading or nothing while checking auth
    if (isCheckingAuth) {
        return <main className="main-content"><div>Loading...</div></main>;
    }
    
    return (
        <main className="main-content">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/cart" element={isAuthenticated ? <Cart /> : <Navigate to="/login" />} />
                <Route path="/checkout" element={isAuthenticated ? <Checkout /> : <Navigate to="/login" />} />
                <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
                <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
                <Route path="/accounts" element={isAuthenticated ? <Accounts /> : <Navigate to="/login" />} />
            </Routes>
        </main>
    );
}

export default App;