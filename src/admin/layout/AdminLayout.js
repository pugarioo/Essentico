// src/admin/layout/AdminLayout.js

import React from 'react';
// Import useLocation at Routes/Route mula sa react-router-dom
import { Routes, Route, useLocation } from 'react-router-dom'; 
import Sidebar from '../admincomponents/Sidebar'; 
import Navbar from '../../components/Navbar'; 
import Dashboard from '../dashboard/Dashboard'; 
import Products from '../products/Products'; // Ito ang parent ng Product List at Categories

import './AdminLayout.css'; 

const AdminLayout = () => {
    // Kinukuha natin ang kasalukuyang URL para sa Base path
    const location = useLocation();
    const basePath = location.pathname.substring(0, location.pathname.indexOf('/', 1)); // Magiging '/admin'

    return (
        <div className="admin-app-wrapper">
            {/* Kung gusto mo, pwede mong tanggalin ang Navbar kung may sariling Top Bar ang Admin Layout */}
            {/* Pero sa ngayon, i-assume natin na hindi ito Navbar mula sa public side */}
            <Navbar /> 
            
            <div className="admin-layout"> 
                <Sidebar /> 
                
                <main className="admin-content">
                    {/* Routes para sa Admin Panel */}
                    <Routes>
                        {/* /admin/dashboard - Gumagana na dahil ang base path natin ay /admin/* */}
                        <Route path="dashboard" element={<Dashboard />} /> 
                        
                        {/* /admin/products/* - Ito ang magpapakita ng Products.js */}
                        <Route path="products/*" element={<Products />} /> 

                        {/* Optional: Default redirect if user navigates to /admin/ */}
                        <Route path="/" element={<Dashboard />} /> 
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;