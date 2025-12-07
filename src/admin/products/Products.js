// src/admin/products/Products.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './Products.css';
import ProductList from './ProductList';
import Categories from './Categories';

const Products = () => {
    return (
        <div className="products-module-container">

            {/* Only keep main title */}
            <div className="products-sub-nav">
                <h1 className="module-title">Products Management</h1>
            </div>

            {/* ROUTES – still working! */}
            <div className="products-content-area">
                <Routes>
                    {/* Default (/admin/products/) */}
                    <Route path="/" element={<ProductList />} />

                    {/* Product List */}
                    <Route path="list" element={<ProductList />} />

                    {/* Categories */}
                    <Route path="categories" element={<Categories />} />
                </Routes>
            </div>

        </div>
    );
};

export default Products;
