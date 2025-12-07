import React, { useState, useEffect } from "react";
import { Table, Form } from "react-bootstrap";
import './AdminOrders.css';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(new Set());

  const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

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

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus(prev => new Set(prev).add(orderId));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8082/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update order status');
      }

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(error.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  if (loading) return <div className="admin-content"><p>Loading orders...</p></div>;
  if (error) return <div className="admin-content"><p>Error: {error}</p></div>;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h2>Orders</h2>
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
                  <td>₱{parseFloat(order.total_amount || 0).toFixed(2)}</td>
                  <td>{order.ordered_at ? new Date(order.ordered_at).toLocaleDateString() : "-"}</td>
                  <td>
                    <Form.Select
                      value={order.status || 'pending'}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updatingStatus.has(order.id)}
                      size="sm"
                      className="status-select"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </Form.Select>
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

