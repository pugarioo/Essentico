import React, { useState } from "react";
import { Card, Button, Modal, Form, Table, Row, Col, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import { FaEdit, FaTruck, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Accounts.css";
import accountbg from '../assets/images/products-bg.jpg';

function Accounts() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "Firstname Lastname",
    email: "firstnamelastname@example.com",
    phone: "09123456789",
    address: "Cabuyao, Laguna, Philippines",
    profilePic: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  });

  const [orders] = useState([
    { id: 1050, items: 2, total: 450, status: "Ongoing", date: "2025-11-30", payment: "GCash", contact: "09111111111",
      itemsOrdered: ["Backpack", "Toothbrush"] },
    { id: 1049, items: 5, total: 1500, status: "Completed", date: "2025-11-25", payment: "COD", contact: "09222222222",
      itemsOrdered: ["Colgate", "Shampoo", "Bag", "Socks", "Tumbler"] },
    { id: 1045, items: 2, total: 600, status: "Cancelled", date: "2025-10-20", payment: "Bank Transfer", contact: "09333333333",
      itemsOrdered: ["Jacket", "Cap"] },
    { id: 1038, items: 8, total: 4200, status: "Completed", date: "2025-09-10", payment: "Maya", contact: "09444444444",
      itemsOrdered: ["Perfume", "Shoes", "Sandals", "Belt", "Wallet", "Jeans", "T-shirt", "Watch"] },
    { id: 1036, items: 4, total: 1300, status: "Ongoing", date: "2025-12-01", payment: "Credit Card", contact: "09555555555",
      itemsOrdered: ["Notebook", "Ballpen", "Bag", "Charger"] }
  ]);

  const [orderFilter, setOrderFilter] = useState("Ongoing");
  const filteredOrders = orders.filter(order => order.status === orderFilter);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(user);

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState([]);

  const handleSave = () => {
    setUser(editData);
    setShowEditModal(false);
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

  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/login");
  };

  return (
    <div className="account-page">
      {/* PROFILE CARD */}
      <Card className="profile-card shadow-sm">
        <Card.Body>
          <Row>
            <Col md={3} className="text-center">
              <img src={user.profilePic} alt="Profile" className="profile-img" />
            </Col>

            <Col md={9}>
              <div className="profile-details">
                <h3>{user.name}</h3>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Address:</strong> {user.address}</p>

                <div className="profile-buttons">
                  <Button variant="primary" onClick={() => setShowEditModal(true)}>
                    <FaEdit /> Edit Profile
                  </Button>
                  <Button variant="danger" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
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
          <h4>Order History ({orderFilter})</h4>
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
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                value={editData.address}
                onChange={(e) => setEditData({ ...editData, address: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button variant="success" onClick={handleSave}>Save Changes</Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}

export default Accounts;
