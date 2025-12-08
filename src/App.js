// src/App.js (Final Code)

import React from 'react';
import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Popup from './components/Popup';

// Pages
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import Cart from './components/cart.js'
import Checkout from './components/Checkout'; 
import Accounts from './pages/Accounts';
import AdminLogin from './pages/AdminLogin'; 
import Login from './pages/Login';
import Register from './pages/Register';

// Context Providers
import { ProductProvider } from './contexts/ProductContext';
import { CartProvider } from './contexts/CartContext';
import { PopupProvider } from './contexts/PopupContext';
import { AlertProvider } from './contexts/AlertContext';
import { AuthProvider } from './contexts/AuthContext'; // Using the Auth one we made earlier
import { UserProvider } from './contexts/UserContext';


import AuthContext from './contexts/AuthContext';
import UserContext from './contexts/UserContext';
import AdminDashboard from './pages/AdminDashboard';
   


function App() {

    return (
        <Router>
            <div className="App">
                <AuthProvider>
                    <UserProvider>
                        <ProductProvider>
                            <CartProvider>
                                <PopupProvider>
                                    <AlertProvider>
                                        <AppContent />
                                    </AlertProvider>
                                </PopupProvider>
                            </CartProvider>
                        </ProductProvider>
                    </UserProvider>
                </AuthProvider>
            </div>
        </Router>
    );
}

function AppContent() {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <>
            {!isAdminRoute && <Navbar />}
            <AppRoutes />
            {!isAdminRoute && <Popup />}
        </>
    );
}


function AppRoutes() {
    const { isAuthenticated, isCheckingAuth } = useContext(AuthContext);
    const { user } = useContext(UserContext);
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');
    
    // Check if user is admin
    const isAdmin = user && user.role === 'admin';

    // Show loading or nothing while checking auth
    if (isCheckingAuth) {
        return <main className="main-content"><div>Loading...</div></main>;
    }
    
    // Admin routes don't use main-content wrapper
    if (isAdminRoute) {
        return (
            <Routes>
                {/* Admin login - only accessible if not authenticated or not admin */}
                <Route 
                    path="/admin/login" 
                    element={
                        !isAuthenticated || !isAdmin ? <AdminLogin /> : <Navigate to="/admin" replace />
                    } 
                />
                {/* Admin dashboard - only accessible if authenticated AND admin */}
                <Route 
                    path="/admin/*" 
                    element={
                        isAuthenticated && isAdmin ? (
                            <AdminDashboard />
                        ) : (
                            <Navigate to="/admin/login" replace />
                        )
                    } 
                />
            </Routes>
        );
    }
    
    // If admin tries to access user routes, redirect to admin dashboard
    if (isAuthenticated && isAdmin) {
        return <Navigate to="/admin" replace />;
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