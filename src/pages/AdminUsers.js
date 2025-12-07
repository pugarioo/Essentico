import React, { useState, useEffect, useContext } from "react";
import { Table, Modal, Button, Form } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import AuthContext from "../contexts/AuthContext";
import UserContext from "../contexts/UserContext";
import './AdminUsers.css';

function AdminUsers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingUsers, setDeletingUsers] = useState(new Set());
  const { isAuthenticated } = useContext(AuthContext);
  const { updateUser } = useContext(UserContext);

  useEffect(() => {
    fetch("http://localhost:8082/api/users")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }
        return res.json();
      })
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleAddCustomer = () => {
    alert("Redirecting to New Customer Creation Form...");
  };

  const handleEdit = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setEditingUser(customer);
      setEditFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        role: customer.role || 'customer'
      });
      setSelectedImage(null);
      setImagePreview(null);
      setShowEditModal(true);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setEditFormData({});
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleUpdateUser = async () => {
    if (!isAuthenticated) {
      alert('You must be logged in to update users');
      return;
    }

    if (!editFormData.name || !editFormData.email) {
      alert('Please fill in all required fields (name and email)');
      return;
    }

    setIsUpdating(true);

    try {
      const formData = new FormData();
      
      // Add user_id for admin updates
      formData.append('user_id', editingUser.id);
      
      // Add text fields
      formData.append('name', editFormData.name);
      formData.append('email', editFormData.email);
      if (editFormData.phone) formData.append('phone', editFormData.phone);
      if (editFormData.address) formData.append('address', editFormData.address);
      if (editFormData.role) formData.append('role', editFormData.role);
      
      // Add image if selected
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      // Call updateUser from UserContext - it will detect admin and route accordingly
      const updatedUserData = await updateUser(formData);

      console.log(updatedUserData);
      
      // Update local state
      setCustomers(prevCustomers =>
        prevCustomers.map(customer =>
          customer.id === editingUser.id
            ? { ...customer, ...updatedUserData }
            : customer
        )
      );

      handleCloseEditModal();
      alert('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.message || 'Failed to update user');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    if (!isAuthenticated) {
      alert('You must be logged in to delete users');
      return;
    }

    setDeletingUsers(prev => new Set(prev).add(customerId));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8082/api/users/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete user');
      }

      // Remove from local state
      setCustomers(prevCustomers =>
        prevCustomers.filter(customer => customer.id !== customerId)
      );

      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.message || 'Failed to delete user');
    } finally {
      setDeletingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(customerId);
        return newSet;
      });
    }
  };

  if (loading) return <div className="admin-content"><p>Loading customers...</p></div>;
  if (error) return <div className="admin-content"><p>Error: {error}</p></div>;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h2>Users/Accounts</h2>
        <button className="btn-primary btn-add-new" onClick={handleAddCustomer}>
          + Add Customer
        </button>
      </div>

      {customers.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <div className="table-card-wrapper">
          <Table className="admin-table" striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Total Orders</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>#{customer.id}</td>
                  <td>{customer.name || "-"}</td>
                  <td>{customer.email || "-"}</td>
                  <td>{customer.phone || "-"}</td>
                  <td>{customer.orders ? customer.orders.length : 0}</td>
                  <td>
                    <span className={`role-badge ${customer.role === 'admin' ? 'role-admin' : 'role-customer'}`}>
                      {customer.role || "Customer"}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button 
                      className="icon-btn action-edit" 
                      title="Edit"
                      onClick={() => handleEdit(customer.id)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="icon-btn action-delete" 
                      title="Delete"
                      onClick={() => handleDelete(customer.id)}
                      disabled={deletingUsers.has(customer.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* EDIT USER MODAL */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg">
        <Modal.Header closeButton className="order-modal-header">
          <Modal.Title className="order-modal-title">Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body className="order-modal-body">
          {editingUser && (
            <Form>
              <Form.Group className="mb-3 text-center">
                <Form.Label>Profile Picture</Form.Label>
                <div className="profile-image-upload">
                  <img 
                    src={imagePreview || (editingUser.image_filename 
                      ? `http://localhost:8082/storage/users/${editingUser.image_filename}`
                      : '')} 
                    alt="User Preview" 
                    className="profile-img-preview"
                    style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                  />
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-2"
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Full Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  value={editFormData.phone || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  value={editFormData.address || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  value={editFormData.role || 'customer'}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className="order-modal-footer">
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleUpdateUser} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update User"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminUsers;

