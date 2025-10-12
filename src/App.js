import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';


function App() {
  return (
    <Router>
      <div className="App">
        
        <main className="main-content">
          <Routes>
            <Route path="/" element />
            <Route path="/about" element />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
