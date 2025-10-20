import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './Components/Navbar';
import Home from './Components/Home';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import Home from './Components/Home';
import NavBar from './Components/Navbar';
import Cart from './Components/cart.js'
import Checkout from './Components/Checkout';


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
