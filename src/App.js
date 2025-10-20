import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import Cart from './components/cart.js'
import Checkout from './components/Checkout';


function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
         <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/products" element />
            <Route path="/products/:id" element />
            <Route path="/about" element />
            <Route path="/cart" element={<Cart/>}/>
            <Route path="/profile" element />
            <Route path="/Checkout" element={<Checkout />} />
            
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
