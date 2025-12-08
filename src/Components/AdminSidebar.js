// AdminSidebar.js

import React from 'react';
import './AdminSidebar.css'; 

const AdminSidebar = ({ activeTab, setActiveTab }) => {
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    return (
        <nav className="admin-sidebar">
            <div className="admin-sidebar-menu">
                
                {/* Products Tab */}
                <button
                    onClick={() => handleTabClick('product-list')}
                    className={`admin-menu-item ${activeTab === 'product-list' ? 'active' : ''}`}
                >
                    <span className="icon">■</span> Products
                </button>

                {/* Categories Tab (separate) */}
                <button
                    onClick={() => handleTabClick('categories')}
                    className={`admin-menu-item ${activeTab === 'categories' ? 'active' : ''}`}
                >
                    <span className="icon">■</span> Categories
                </button>

                {/* Orders Tab */}
                <button
                    onClick={() => handleTabClick('orders')}
                    className={`admin-menu-item ${activeTab === 'orders' ? 'active' : ''}`}
                >
                    <span className="icon">■</span> Orders
                </button>

                {/* Users/Accounts Tab */}
                <button 
                    onClick={() => handleTabClick('users')}
                    className={`admin-menu-item ${activeTab === 'users' ? 'active' : ''}`}
                >
                    <span className="icon">■</span> Users/Accounts
                </button>

                {/* Discounts/Promos Tab */}
                <button 
                    onClick={() => handleTabClick('promos')}
                    className={`admin-menu-item ${activeTab === 'promos' ? 'active' : ''}`}
                >
                    <span className="icon">■</span> Discounts/Promos
                </button>

                {/* Ratings Tab */}
                <button 
                    onClick={() => handleTabClick('ratings')}
                    className={`admin-menu-item ${activeTab === 'ratings' ? 'active' : ''}`}
                >
                    <span className="icon">■</span> Ratings
                </button>

            </div>
        </nav>
    );
};

export default AdminSidebar;

