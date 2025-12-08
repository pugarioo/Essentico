// --- AdminDashboard.js ---

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css'; 
import AdminSidebar from '../components/AdminSidebar';
import AdminNavbar from '../components/AdminNavbar';
import AdminProductList from './AdminProductList';
import AdminCategories from './AdminCategories';
import AdminOrders from './AdminOrders';
import AdminUsers from './AdminUsers';
import AdminPromos from './AdminPromos';
import AdminRatings from './AdminRatings';
import UserContext from '../contexts/UserContext';
import AuthContext from '../contexts/AuthContext';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const { isAuthenticated } = useContext(AuthContext);
    
    // Tab state management - default to products
    const [activeTab, setActiveTab] = useState('product-list');

    // Ensure only admins can access this page
    useEffect(() => {
        if (!isAuthenticated || !user || user.role !== 'admin') {
            navigate('/admin/login', { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    // Render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'product-list':
                return <AdminProductList />;
            case 'categories':
                return <AdminCategories />;
            case 'orders':
                return <AdminOrders />;
            case 'users':
                return <AdminUsers />;
            case 'promos':
                return <AdminPromos />;
            case 'ratings':
                return <AdminRatings />;
            default:
                return <AdminProductList />;
        }
    };

    return (
        <div className="admin-dashboard-container"> 
            <AdminNavbar />
            <div className="admin-dashboard-wrapper">
                
                <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} /> 
                
                <div className="admin-main-content-area">
                    <div className="admin-main-page-content">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

