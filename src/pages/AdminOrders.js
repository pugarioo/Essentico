import React, { useState, useEffect, useContext } from "react";
import { Table, Form, ToggleButtonGroup, ToggleButton, Modal, Button } from "react-bootstrap";
import './AdminOrders.css';
import AlertContext from "../contexts/AlertContext";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(new Set());
  const [orderFilter, setOrderFilter] = useState("all");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { alert: showAlert } = useContext(AlertContext);

  const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  // Filter orders based on selected filter
  const filteredOrders = orders.filter(order => {
    const orderStatus = (order.status || 'pending').toLowerCase();
    if (orderFilter === "all") {
      return true; // Show all orders
    } else {
      // Show orders matching the specific status
      return orderStatus === orderFilter;
    }
  });

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

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleStatusChange = async (orderId, newStatus, e) => {
    // Prevent row click when clicking on status dropdown
    e?.stopPropagation();
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
      await showAlert({
        title: 'Error',
        message: error.message || 'Failed to update order status',
        variant: 'danger'
      });
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

      {/* Order Filter Toggle */}
      <div className="order-toggle">
        <ToggleButtonGroup type="radio" name="orderStatus" value={orderFilter} onChange={(val) => setOrderFilter(val)}>
          <ToggleButton id="all" value="all" variant="outline-secondary">All Orders</ToggleButton>
          <ToggleButton id="pending" value="pending" variant="outline-warning">Pending</ToggleButton>
          <ToggleButton id="processing" value="processing" variant="outline-info">Processing</ToggleButton>
          <ToggleButton id="shipped" value="shipped" variant="outline-success">Shipped</ToggleButton>
          <ToggleButton id="delivered" value="delivered" variant="outline-success">Delivered</ToggleButton>
          <ToggleButton id="cancelled" value="cancelled" variant="outline-danger">Cancelled</ToggleButton>
        </ToggleButtonGroup>
      </div>

      {filteredOrders.length === 0 ? (
        <p>No {orderFilter === "all" ? "" : orderFilter} orders found.</p>
      ) : (
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
              {filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => handleOrderClick(order)} 
                  style={{ cursor: "pointer" }}
                >
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
                  <td onClick={(e) => e.stopPropagation()}>
                    <Form.Select
                      value={order.status || 'pending'}
                      onChange={(e) => handleStatusChange(order.id, e.target.value, e)}
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
      )}

      {/* ORDER DETAILS MODAL */}
      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} centered size="lg" className="order-details-modal">
        <Modal.Header closeButton className="order-modal-header">
          <Modal.Title className="order-modal-title">Order Details #{selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="order-modal-body">
          {selectedOrder && (
            <div className="order-details-content">
              {/* Status Badge */}
              <div className="order-status-section">
                <span className={`order-status-badge status-${(selectedOrder.status || 'pending').toLowerCase()}`}>
                  {(selectedOrder.status || 'pending').charAt(0).toUpperCase() + (selectedOrder.status || 'pending').slice(1)}
                </span>
              </div>

              {/* Order Information Grid */}
              <div className="order-info-grid">
                <div className="order-info-item">
                  <span className="order-info-label">Order Date</span>
                  <span className="order-info-value">
                    {selectedOrder.ordered_at ? new Date(selectedOrder.ordered_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">Payment Method</span>
                  <span className="order-info-value">{selectedOrder.payment_method || 'N/A'}</span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">Delivery Method</span>
                  <span className="order-info-value">{selectedOrder.delivery_method || 'N/A'}</span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">Total Items</span>
                  <span className="order-info-value">{selectedOrder.order_items?.length || 0}</span>
                </div>
                <div className="order-info-item order-total">
                  <span className="order-info-label">Order Total</span>
                  <span className="order-info-value">₱{parseFloat(selectedOrder.total_amount || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Customer Information */}
              {selectedOrder.user && (
                <div className="order-address-section">
                  <span className="order-info-label">Customer Information</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    <span className="order-info-value">{selectedOrder.user.name || 'N/A'}</span>
                    <span style={{ fontSize: '14px', color: '#666' }}>{selectedOrder.user.email || 'N/A'}</span>
                    {selectedOrder.user.phone && (
                      <span style={{ fontSize: '14px', color: '#666' }}>Phone: {selectedOrder.user.phone}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              <div className="order-address-section">
                <span className="order-info-label">Delivery Address</span>
                <span className="order-info-value">{selectedOrder.delivery_address || 'N/A'}</span>
              </div>

              {/* Items Ordered */}
              <div className="order-items-section">
                <h5 className="order-items-title">Items Ordered</h5>
                <div className="order-items-list">
                  {selectedOrder.order_items?.map((item, i) => (
                    <div key={i} className="order-item">
                      <span className="order-item-bullet">•</span>
                      <span className="order-item-text">
                        {item.quantity}x {item.product?.name || 'Unknown Product'} - ₱{parseFloat(item.product?.price || 0).toFixed(2)} each
                      </span>
                    </div>
                  )) || (
                    <div className="order-item">
                      <span className="order-item-text">No items found</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Discount Code (if applied) */}
              {selectedOrder.discount_code && (
                <div className="order-address-section">
                  <span className="order-info-label">Discount Code</span>
                  <span className="order-info-value" style={{ color: '#28a745' }}>
                    {selectedOrder.discount_code} {selectedOrder.discount_value ? `(${selectedOrder.discount_value}% off)` : ''}
                  </span>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="order-modal-footer">
          <Button variant="secondary" onClick={() => setShowOrderModal(false)} className="order-close-btn">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminOrders;

