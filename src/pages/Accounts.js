import React from "react";
import { useState, useContext, useEffect, useRef } from "react";
import { Card, Button, Modal, Form, Table, Row, Col, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import { FaEdit, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Accounts.css";  
import AuthContext from "../contexts/AuthContext";
import UserContext from "../contexts/UserContext";

import defaultProfile from '../assets/images/default-profile.png';

function Accounts() {

  const { user, updateUser, isUpdatingUser } = useContext(UserContext);
  
  const navigate = useNavigate();
  const { logout, isLoggingOut } = useContext(AuthContext);
  const [imagePath, setImagePath] = useState('');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const hasFetchedOrders = useRef(false);

  useEffect(() => {
    if (user) {
      const path = user.image_filename == null ? defaultProfile : `http://localhost:8082/storage/users/${user.image_filename}`;
      setImagePath(path);
    } else {
      setImagePath(defaultProfile);
    }
  }, [user]);

  // Fetch orders for the logged-in user
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token || !user || !user.id) {
        return;
      }

      // Prevent fetching if already fetched for this user
      if (hasFetchedOrders.current) {
        return;
      }

      hasFetchedOrders.current = true;
      setLoadingOrders(true);
      setOrdersError(null);

      try {
        const response = await fetch('http://localhost:8082/api/orders', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Transform backend orders to match component expectations
          const transformedOrders = data.map(order => {
            // Map order items to a readable format
            const itemsList = order.order_items?.map(item => 
              `${item.quantity}x ${item.product?.name || 'Unknown Product'}`
            ).join(', ') || 'No items';
            
            // Keep the original status from backend (pending, processing, shipped, delivered, cancelled)
            const status = (order.status || 'pending').toLowerCase();

            // Parse total_amount as float (it comes as string from backend)
            const totalAmount = parseFloat(order.total_amount) || 0;

            return {
              id: order.id,
              items: itemsList,
              total: totalAmount,
              status: status,
              date: order.ordered_at ? new Date(order.ordered_at).toLocaleDateString() : 'N/A',
              payment: order.payment_method || 'N/A',
              contact: order.delivery_address || order.user?.address || 'N/A',
              itemsOrdered: order.order_items?.map(item => 
                `${item.quantity}x ${item.product?.name || 'Unknown Product'}`
              ) || []
            };
          });
          setOrders(transformedOrders);
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrdersError(error.message);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
    
    // Reset the ref when user changes
    return () => {
      hasFetchedOrders.current = false;
    };
    // Only depend on user.id to prevent constant re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const [orderFilter, setOrderFilter] = useState("ongoing");
  const filteredOrders = orders.filter(order => {
    if (orderFilter === "all") {
      return true; // Show all orders
    } else if (orderFilter === "ongoing") {
      // Show pending, processing, and shipped orders
      return order.status === "pending" || order.status === "processing" || order.status === "shipped";
    } else {
      // Show orders matching the specific status
      return order.status === orderFilter;
    }
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Initialize editData only when modal opens, not when user changes
  const handleOpenEditModal = () => {
    if (user) {
      setEditData({ ...user }); // Create a copy of user data
      setImagePreview(null);
      setSelectedImage(null);
    }
    setShowEditModal(true);
  };

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      
      // Add text fields
      formData.append('name', editData.name || '');
      formData.append('email', editData.email || '');
      if (editData.phone) formData.append('phone', editData.phone);
      if (editData.address) formData.append('address', editData.address);
      
      // Add image if selected
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      
      await updateUser(formData);
      setShowEditModal(false);
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedImage(null);
    setImagePreview(null);
    // Optionally reset editData when closing
    setEditData({});
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };


  const handleLogout = async () => {
    await logout();
    navigate("/login")
  };

  const handleImageError = (e) => {
    // Fallback to default profile image if the fetched image fails
    if (e.target.src !== defaultProfile) {
      e.target.src = defaultProfile;
    }
  };

  // Show loading state if user is not yet loaded
  if (!user) {
    return (
      <div className="account-page">
        <Card className="profile-card shadow-sm">
          <Card.Body>
            <div className="text-center">
              <p>Loading profile...</p>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="account-page">
      {/* PROFILE CARD */}
      <Card className="profile-card shadow-sm">
        <Card.Body>
          <Row>
            <Col md={3} className="text-center">
              <img 
                src={imagePath} 
                alt="Profile" 
                className="profile-img"
                onError={handleImageError}
              />
            </Col>

            <Col md={9}>
              <div className="profile-details">
                <h3>{user?.name || "Loading..."}</h3>
                <p><strong>Email:</strong> {user?.email || "Loading..."}</p>
                <p><strong>Phone:</strong> {user?.phone ? user.phone : "N/A"}</p>
                <p><strong>Address:</strong> {user?.address ? user.address : "N/A"}</p>

                <div className="profile-buttons">
                  <Button onClick={handleOpenEditModal}>
                    <FaEdit /> Edit Profile
                  </Button>
                  <Button variant="danger" onClick={handleLogout} disabled={isLoggingOut}>
                    <FaSignOutAlt /> {isLoggingOut ? "Logging out" : "Logout"}
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* TOGGLE BUTTON */}
      <div className="order-toggle">
        <ToggleButtonGroup type="radio" name="orderStatus" value={orderFilter} onChange={(val) => setOrderFilter(val)}>
          <ToggleButton id="all" value="all" variant="outline-secondary">All Orders</ToggleButton>
          <ToggleButton id="ongoing" value="ongoing" variant="outline-primary">Ongoing</ToggleButton>
          <ToggleButton id="delivered" value="delivered" variant="outline-success">Delivered</ToggleButton>
          <ToggleButton id="cancelled" value="cancelled" variant="outline-danger">Cancelled</ToggleButton>
        </ToggleButtonGroup>
      </div>

      {/* ORDER HISTORY */}
      <Card className="orders-card shadow-sm">
        <Card.Body>
          <h4>
            {orderFilter === "all" 
              ? "All Orders" 
              : orderFilter === "ongoing"
              ? "Ongoing Orders"
              : orderFilter.charAt(0).toUpperCase() + orderFilter.slice(1) + " Orders"
            }
          </h4>
          <div className="order-table-wrapper">
            {loadingOrders ? (
              <div className="text-center p-3">
                <p>Loading orders...</p>
              </div>
            ) : ordersError ? (
              <div className="text-center p-3">
                <p style={{ color: 'red' }}>Error: {ordersError}</p>
              </div>
            ) : (
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Items</th>
                    <th>Total (₱)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id} onClick={() => handleOrderClick(order)} style={{ cursor: "pointer" }}>
                        <td>#{order.id}</td>
                        <td>{order.items}</td>
                        <td>₱{order.total.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center">No {orderFilter} orders</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </div>
        </Card.Body>
      </Card>

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
                <span className={`order-status-badge status-${selectedOrder.status || 'pending'}`}>
                  {selectedOrder.status ? selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1) : 'Pending'}
                </span>
              </div>

              {/* Order Information Grid */}
              <div className="order-info-grid">
                <div className="order-info-item">
                  <span className="order-info-label">Order Date</span>
                  <span className="order-info-value">{selectedOrder.date}</span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">Payment Method</span>
                  <span className="order-info-value">{selectedOrder.payment}</span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">Total Items</span>
                  <span className="order-info-value">{selectedOrder.itemsOrdered.length}</span>
                </div>
                <div className="order-info-item order-total">
                  <span className="order-info-label">Order Total</span>
                  <span className="order-info-value">₱{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="order-address-section">
                <span className="order-info-label">Delivery Address</span>
                <span className="order-info-value">{selectedOrder.contact}</span>
              </div>

              {/* Items Ordered */}
              <div className="order-items-section">
                <h5 className="order-items-title">Items Ordered</h5>
                <div className="order-items-list">
                  {selectedOrder.itemsOrdered.map((item, i) => (
                    <div key={i} className="order-item">
                      <span className="order-item-bullet">•</span>
                      <span className="order-item-text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="order-modal-footer">
          <Button variant="secondary" onClick={() => setShowOrderModal(false)} className="order-close-btn">
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* EDIT PROFILE MODAL */}
      <Modal show={showEditModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3 text-center">
              <Form.Label>Profile Picture</Form.Label>
              <div className="profile-image-upload">
                <img 
                  src={imagePreview || imagePath} 
                  alt="Profile Preview" 
                  className="profile-img-preview"
                  onError={handleImageError}
                />
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-2"
                />
              </div>
            </Form.Group>
            <Form.Group>
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={editData.name || ''}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={editData.email || ''}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                value={editData.phone || ''}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                value={editData.address || ''}
                onChange={(e) => setEditData({ ...editData, address: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
          <Button variant="success" onClick={handleSave} disabled={isUpdatingUser}>
            {isUpdatingUser ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}

export default Accounts;
