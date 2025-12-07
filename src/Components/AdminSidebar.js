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

                {/* Settings Tab */}
                <button 
                    onClick={() => handleTabClick('settings')}
                    className={`admin-menu-item ${activeTab === 'settings' ? 'active' : ''}`}
                >
                    <span className="icon">■</span> Settings
                </button>

            </div>
        </nav>
    );
};

export default AdminSidebar;

