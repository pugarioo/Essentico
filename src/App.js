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
import { CartContext } from './contexts/CartContext';
import data from './data/sampledata.json';


function App() {
  const productData = data;
  const [cart, updateCart] = useState([]);

  return (
    <Router>
      <div className="App">
        <Navbar />
        <CartContext.Provider value={{cart, updateCart}}>
        <main className="main-content">
          <Routes>
              <Route path="/" element={<Home/>} />
              <Route path="/products" element={<ProductList productData={productData}/>} />
              <Route path="/products/:id" element={<ProductDetails/>} />
              <Route path="/cart" element={<Cart/>}/>
              <Route path="/Checkout" element={<Checkout />} />
          </Routes>
        </main>
        </CartContext.Provider>
      </div>
    </Router>
  );
}

export default App;
