import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <div className="App">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/products" element />
            <Route path="/about" element />
            <Route path="/cart" element />
            <Route path="/profile" element />
            
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
