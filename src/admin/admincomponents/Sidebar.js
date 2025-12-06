// src/admin/Sidebar.js

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css'; 

const Sidebar = () => {
    const location = useLocation();
    
    // Check kung nasa Products section
    const isProductsActive = location.pathname.startsWith('/admin/products');
    
    // Check kung nasa Dashboard
    const isDashboardActive = location.pathname.startsWith('/admin/dashboard');

    return (
        <nav className="sidebar">
            <div className="sidebar-menu">
                
                {/* 1. Dashboard Link */}
                <Link 
                    to="/admin/dashboard"
                    className={`menu-item ${isDashboardActive ? 'active' : ''}`}
                >
                    <span className="icon">■</span> Dashboard
                </Link>

                {/* ------------------------------------------------------
                    PRODUCTS SECTION (HIDDEN ONLY ON DASHBOARD)
                ------------------------------------------------------ */}

                {!isDashboardActive && (
                    <>
                        {/* Products Parent Link */}
                        <Link
                            to="/admin/products/list"
                            className={`menu-item menu-parent ${isProductsActive ? 'active' : ''}`}
                        >
                            <span className="icon">■</span> Products
                        </Link>

                        {/* Sub-menu (only shows when inside products) */}
                        {isProductsActive && (
                            <div className="sub-menu-group">
                                <Link 
                                    to="/admin/products/list"
                                    className={`sub-menu-item ${location.pathname.includes('/list') ? 'active-sub' : ''}`}
                                >
                                    Product List
                                </Link>
                                
                                <Link 
                                    to="/admin/products/categories"
                                    className={`sub-menu-item ${location.pathname.includes('/categories') ? 'active-sub' : ''}`}
                                >
                                    Categories
                                </Link>
                            </div>
                        )}
                    </>
                )}

                {/* ------------------------------------------------------
                    OPTIONAL OTHER MENU ITEMS (kept as is)
                ------------------------------------------------------ */}

                {!isProductsActive && !isDashboardActive && (
                    <>
                        <Link to="/admin/sales" className="menu-item"><span className="icon">■</span> Sales</Link>
                        <Link to="/admin/customers" className="menu-item"><span className="icon">■</span> Customers</Link>
                        <Link to="/admin/settings" className="menu-item"><span className="icon">■</span> Settings</Link>
                    </>
                )}

            </div>
        </nav>
    );
};

export default Sidebar;
