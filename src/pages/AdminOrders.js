import React, { useState, useEffect } from "react";
import { Button, Table } from "react-bootstrap";
import { FaEye, FaTruck, FaTrash } from "react-icons/fa";
import './AdminOrders.css';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8082/api/orders")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch orders");
        }
        return res.json();
      })
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="admin-content"><p>Loading orders...</p></div>;
  if (error) return <div className="admin-content"><p>Error: {error}</p></div>;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h2>Orders</h2>
        <button className="btn-primary btn-add-new">+ Add Order</button>
      </div>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="table-card-wrapper">
          <Table className="admin-table" striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.user?.name || "-"}</td>
                  <td>
                    <ul style={{ margin: 0, paddingLeft: "20px" }}>
                      {order.order_items?.map((item) => (
                        <li key={item.id}>{item.product?.name || "-"}</li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <ul style={{ margin: 0, paddingLeft: "20px" }}>
                      {order.order_items?.map((item) => (
                        <li key={item.id}>{item.quantity}</li>
                      ))}
                    </ul>
                  </td>
                  <td>₱{order.total_amount || 0}</td>
                  <td>{order.ordered_at ? new Date(order.ordered_at).toLocaleDateString() : "-"}</td>
                  <td>
                    <span className="status-badge status-pending">
                      {order.status || "Pending"}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button className="icon-btn action-view" title="View">
                      <FaEye />
                    </button>
                    <button className="icon-btn action-ship" title="Ship">
                      <FaTruck />
                    </button>
                    <button className="icon-btn action-delete" title="Delete">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;

