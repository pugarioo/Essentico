import React from "react";
import { useState, useContext, useEffect } from "react";
import { Card, Button, Modal, Form, Table, Row, Col, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import { FaEdit, FaTruck, FaSignOutAlt } from "react-icons/fa";
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

  useEffect(() => {
    const path = user.image_filename == null ? defaultProfile : `http://localhost:8082/storage/users/${user.image_filename}`;
    setImagePath(path);
  }, [user]);

  const [orderFilter, setOrderFilter] = useState("Ongoing");
  const filteredOrders = orders.filter(order => order.status === orderFilter);

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

  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState([]);

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

  const handleTrackOrder = () => {
    setShowTrackModal(true);
    setTrackingStatus([
      "📦 Order Confirmed",
      "🛠 Preparing your order",
      "🚚 Rider picked up your order",
      "📍 On the way to delivery address",
      "🏠 Arriving soon..."
    ]);
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
                <h3>{user.name}</h3>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone ? user.phone : "N/A"}</p>
                <p><strong>Address:</strong> {user.address ? user.address : "N/A"}</p>

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
          <ToggleButton id="ongoing" value="Ongoing" variant="outline-primary">Ongoing</ToggleButton>
          <ToggleButton id="completed" value="Completed" variant="outline-success">Completed</ToggleButton>
          <ToggleButton id="cancelled" value="Cancelled" variant="outline-danger">Cancelled</ToggleButton>
        </ToggleButtonGroup>
      </div>

      {/* ORDER HISTORY */}
      <Card className="orders-card shadow-sm">
        <Card.Body>
          <h4>{orderFilter} Order History</h4>
          <div className="order-table-wrapper">
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
                      <td>{order.total}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">No {orderFilter} orders</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* ORDER DETAILS MODAL */}
      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Order Details #{selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <p><strong>Order Date:</strong> {selectedOrder.date}</p>
              <p><strong>Total Items:</strong> {selectedOrder.items}</p>
              <p><strong>Order Total:</strong> ₱{selectedOrder.total}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p><strong>Payment Method:</strong> {selectedOrder.payment}</p>
              <p><strong>Contact Used:</strong> {selectedOrder.contact}</p>
              <hr />
              <h5>Items Ordered:</h5>
              <ul>
                {selectedOrder.itemsOrdered.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOrderModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleTrackOrder}>
            <FaTruck /> Track Order
          </Button>
        </Modal.Footer>
      </Modal>

      {/* TRACKING MODAL */}
      <Modal show={showTrackModal} onHide={() => setShowTrackModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><FaTruck className="me-2" /> Tracking Order #{selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="tracking-timeline">
            {trackingStatus.map((step, index) => (
              <p key={index}>{step}</p>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTrackModal(false)}>Close</Button>
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
