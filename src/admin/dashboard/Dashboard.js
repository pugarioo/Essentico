// src/admin/dashboard/Dashboard.js 

import React from 'react';
import './Dashboard.css';

// DUMMY DATA
const dummyData = {
    weeklySales: '15,000.00',
    weeklyOrders: '45,6334',
    visitorsOnline: '95,5741',
    salesTrend: 'Increased by 60%',
    ordersTrend: 'Decreased by 10%',
    visitorsTrend: 'Increased by 5%',
};


const Dashboard = () => {
    return (
        <div className="dashboard-content"> 
            
            {/* Header/Title (Row 0) */}
            <div className="dashboard-header">
                <span className="dashboard-icon">&#x2302;</span> {/* House icon */}
                <h1 className="dashboard-page-title">Dashboard</h1>
                <p className="dashboard-overview">Overview &#x24D8;</p>
            </div>

            {/* ROW 1: SUMMARY TILES (3 Columns) */}
            <div className="summary-cards-grid">
                
                {/* TILE 1: Weekly Sales (Pink) */}
                <div className="summary-card card-pink">
                    <div className="card-header">
                        <p className="card-title">Weekly Sales</p> 
                        <span className="card-icon">📈</span>
                    </div>
                    <h2 className="card-value">$ {dummyData.weeklySales}</h2> 
                    <p className="card-trend">{dummyData.salesTrend}</p>
                </div>

                {/* TILE 2: Weekly Orders (Blue) */}
                <div className="summary-card card-blue">
                    <div className="card-header">
                        <p className="card-title">Weekly Orders</p> 
                        <span className="card-icon">🔖</span>
                    </div>
                    <h2 className="card-value">{dummyData.weeklyOrders}</h2> 
                    <p className="card-trend">{dummyData.ordersTrend}</p>
                </div>

                {/* TILE 3: Visitors Online (Green) */}
                <div className="summary-card card-green">
                    <div className="card-header">
                        <p className="card-title">Visitors Online</p> 
                        <span className="card-icon">💎</span>
                    </div>
                    <h2 className="card-value">{dummyData.visitorsOnline}</h2> 
                    <p className="card-trend">{dummyData.visitorsTrend}</p>
                </div>

            </div>

            {/* ROW 2: CHART PANELS (2 Columns) */}
            <div className="chart-row-wrapper">
                <div className="chart-panel">
                    <h3>Visit And Sales Statistics</h3>
                    {/* Legend placeholder */}
                    <div className="chart-legend">
                        <span style={{color: '#9C27B0'}}>&#9679; CHN</span>
                        <span style={{color: '#F44336'}}>&#9679; USA</span>
                        <span style={{color: '#2196F3'}}>&#9679; UK</span>
                    </div>
                    <div className="bar-chart-placeholder">[Bar Chart Placeholder]</div>
                </div>
                <div className="chart-panel">
                    <h3>Traffic Sources</h3>
                    {/* Donut Chart Placeholder */}
                    <div className="donut-chart-placeholder">[Donut Chart Placeholder]</div>
                    {/* Traffic Legend (Simplified) */}
                    <div className="traffic-legend">
                        <p><span style={{color: '#2196F3'}}>&#9679;</span> Search Engines (30%)</p>
                        <p><span style={{color: '#F44336'}}>&#9679;</span> Direct Click (30%)</p>
                        <p><span style={{color: '#4CAF50'}}>&#9679;</span> Bookmarks Click (40%)</p>
                    </div>
                </div>
            </div>
        </div> 
    );
};

export default Dashboard;