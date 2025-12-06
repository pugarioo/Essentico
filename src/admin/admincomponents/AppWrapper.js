// --- AppWrapper.js ---

import React from 'react';
import './AppWrapper.css'; 
import Sidebar from './Sidebar';       
import TopNav from './TopNav';         
import ProductList from './ProductList'; 
// import Categories from './Categories'; 

const AppWrapper = () => {
    return (
        <div className="app-container"> 
            <div className="content-wrapper">
                
                <Sidebar /> 
                
                <div className="main-content-area">
                    
                    {/* 👇 1. THIS COMPONENT MUST BE HERE AND DEFINED IN TopNav.css 👇 */}
                    <TopNav /> 
                    
                    <div className="main-page-content">
                        {/* The content (Product List title) now starts 30px below the TopNav */}
                        <ProductList /> 
                        {/* or <Categories /> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppWrapper;