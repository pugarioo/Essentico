import React, { useState, useEffect, useContext } from "react";
import { Table, Modal, Button, Form } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import AuthContext from "../contexts/AuthContext";
import UserContext from "../contexts/UserContext";
import AlertContext from "../contexts/AlertContext";
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'customer'
  });
  const [selectedAddImage, setSelectedAddImage] = useState(null);
  const [addImagePreview, setAddImagePreview] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { isAuthenticated } = useContext(AuthContext);
  const { updateUser } = useContext(UserContext);
  const { alert: showAlert, confirm: showConfirm } = useContext(AlertContext);

  const getOrderCount = (user) => {
    if (!user) return 0;
    if (typeof user.total_orders === 'number') return user.total_orders;
    return 0;
  };

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
    setAddFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      role: 'customer'
    });
    setSelectedAddImage(null);
    setAddImagePreview(null);
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setAddFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      role: 'customer'
    });
    setSelectedAddImage(null);
    setAddImagePreview(null);
  };

  const handleAddImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedAddImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAddImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateUser = async () => {
    if (!isAuthenticated) {
      await showAlert({ title: 'Unauthorized', message: 'You must be logged in to create users', variant: 'warning' });
      return;
    }

    // Validate required fields
    if (!addFormData.name || !addFormData.email || !addFormData.password) {
      await showAlert({ title: 'Missing Fields', message: 'Please fill in all required fields (name, email, and password)', variant: 'warning' });
      return;
    }

    // Password validation
    if (addFormData.password.length < 8) {
      await showAlert({ title: 'Weak Password', message: 'Password must be at least 8 characters long', variant: 'warning' });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addFormData.email)) {
      await showAlert({ title: 'Invalid Email', message: 'Please enter a valid email address', variant: 'warning' });
      return;
    }

    setIsCreating(true);

    try {
      const token = localStorage.getItem("token");
      
      // Build request body - use JSON like Register.js does
      const requestBody = {
        name: addFormData.name.trim(),
        email: addFormData.email.trim(),
        password: addFormData.password
      };

      // Only add optional fields if they have values
      if (addFormData.phone && addFormData.phone.trim()) {
        requestBody.phone = addFormData.phone.trim();
      }
      if (addFormData.address && addFormData.address.trim()) {
        requestBody.address = addFormData.address.trim();
      }
      if (addFormData.role) {
        requestBody.role = addFormData.role;
      }

      // Create user with JSON (like Register.js)
      const response = await fetch('http://localhost:8082/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.message || 'Failed to create user';
        
        // Handle validation errors
        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors)
            .flat()
            .filter(msg => msg)
            .join(', ');
          if (errorMessages) {
            errorMessage = errorMessages;
          }
        }
        
        throw new Error(errorMessage);
      }

      const newUser = await response.json();
      
      // If image was provided, update the user with the image
      if (selectedAddImage && newUser.id) {
        try {
          const imageFormData = new FormData();
          imageFormData.append('image', selectedAddImage);
          
          const updateResponse = await fetch(`http://localhost:8082/api/users/${newUser.id}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            body: imageFormData
          });

          if (updateResponse.ok) {
            const updatedUser = await updateResponse.json();
            // Use updated user data if available
            if (updatedUser) {
              Object.assign(newUser, updatedUser);
            }
          }
        } catch (imageError) {
          console.warn('User created but image upload failed:', imageError);
          // Don't fail the whole operation if image upload fails
        }
      }
      
      // Refresh the user list
      const refreshResponse = await fetch("http://localhost:8082/api/users");
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        setCustomers(refreshedData);
      } else {
        // If refresh fails, just add the new user to the list
        setCustomers(prevCustomers => [...prevCustomers, newUser]);
      }

      handleCloseAddModal();
      await showAlert({ title: 'Success', message: 'User created successfully!', variant: 'success' });
    } catch (error) {
      console.error('Error creating user:', error);
      await showAlert({ title: 'Error', message: error.message || 'Failed to create user', variant: 'danger' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleEdit = (customerId, e) => {
    // Prevent row click when clicking edit button
    e?.stopPropagation();
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
      await showAlert({ title: 'Unauthorized', message: 'You must be logged in to update users', variant: 'warning' });
      return;
    }

    if (!editFormData.name || !editFormData.email) {
      await showAlert({ title: 'Missing Fields', message: 'Please fill in all required fields (name and email)', variant: 'warning' });
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
      await showAlert({ title: 'Success', message: 'User updated successfully!', variant: 'success' });
    } catch (error) {
      console.error('Error updating user:', error);
      await showAlert({ title: 'Error', message: error.message || 'Failed to update user', variant: 'danger' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (customerId, e) => {
    // Prevent row click when clicking delete button
    e?.stopPropagation();
    const confirmed = await showConfirm({
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      variant: 'danger',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel'
    });
    if (!confirmed) return;

    if (!isAuthenticated) {
      await showAlert({ title: 'Unauthorized', message: 'You must be logged in to delete users', variant: 'warning' });
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

      await showAlert({ title: 'Success', message: 'User deleted successfully!', variant: 'success' });
    } catch (error) {
      console.error('Error deleting user:', error);
      await showAlert({ title: 'Error', message: error.message || 'Failed to delete user', variant: 'danger' });
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
                <tr 
                  key={customer.id}
                  onClick={() => handleUserClick(customer)}
                  style={{ cursor: "pointer" }}
                >
                  <td>#{customer.id}</td>
                  <td>{customer.name || "-"}</td>
                  <td>{customer.email || "-"}</td>
                  <td>{customer.phone || "-"}</td>
                  <td>{getOrderCount(customer)}</td>
                  <td>
                    <span className={`role-badge ${customer.role === 'admin' ? 'role-admin' : 'role-customer'}`}>
                      {customer.role || "Customer"}
                    </span>
                  </td>
                  <td className="action-buttons" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="icon-btn action-edit" 
                      title="Edit"
                      onClick={(e) => handleEdit(customer.id, e)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="icon-btn action-delete" 
                      title="Delete"
                      onClick={(e) => handleDelete(customer.id, e)}
                      disabled={deletingUsers.has(customer.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
      )}

      {/* ADD USER MODAL */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} size="lg">
        <Modal.Header closeButton className="order-modal-header">
          <Modal.Title className="order-modal-title">Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body className="order-modal-body">
          <Form>
            <Form.Group className="mb-3 text-center">
              <Form.Label>Profile Picture (Optional)</Form.Label>
              <div className="profile-image-upload">
                {addImagePreview && (
                  <img 
                    src={addImagePreview} 
                    alt="User Preview" 
                    className="profile-img-preview"
                    style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', marginBottom: '10px' }}
                  />
                )}
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleAddImageChange}
                  className="mt-2"
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Full Name *</Form.Label>
              <Form.Control
                type="text"
                value={addFormData.name}
                onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                placeholder="Enter full name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                value={addFormData.email}
                onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                placeholder="Enter email address"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password *</Form.Label>
              <Form.Control
                type="password"
                value={addFormData.password}
                onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                placeholder="Enter password (min 8 characters)"
                minLength={8}
                required
              />
              <Form.Text className="text-muted">
                Password must be at least 8 characters long
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                value={addFormData.phone}
                onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                placeholder="Enter phone number (optional)"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                value={addFormData.address}
                onChange={(e) => setAddFormData({ ...addFormData, address: e.target.value })}
                placeholder="Enter address (optional)"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={addFormData.role}
                onChange={(e) => setAddFormData({ ...addFormData, role: e.target.value })}
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="order-modal-footer">
          <Button variant="secondary" onClick={handleCloseAddModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateUser} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create User"}
          </Button>
        </Modal.Footer>
      </Modal>

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

      {/* USER DETAILS MODAL */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} centered size="lg" className="order-details-modal">
        <Modal.Header closeButton className="order-modal-header">
          <Modal.Title className="order-modal-title">User Details #{selectedUser?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="order-modal-body">
          {selectedUser && (
            <div className="order-details-content">
              {/* Profile Image */}
              <div className="order-status-section">
                <img 
                  src={selectedUser.image_filename 
                    ? `http://localhost:8082/storage/users/${selectedUser.image_filename}` 
                    : require('../assets/images/default-profile.png')}
                  alt={selectedUser.name || 'User'}
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid #5f8d4e',
                    boxShadow: '0 2px 8px rgba(95, 141, 78, 0.2)'
                  }}
                  onError={(e) => {
                    e.target.src = require('../assets/images/default-profile.png');
                  }}
                />
              </div>

              {/* Role Badge */}
              <div className="order-status-section">
                <span className={`role-badge ${selectedUser.role === 'admin' ? 'role-admin' : 'role-customer'}`} style={{ fontSize: '14px', padding: '8px 20px' }}>
                  {selectedUser.role === 'admin' ? 'Admin' : 'Customer'}
                </span>
              </div>

              {/* User Information Grid */}
              <div className="order-info-grid">
                <div className="order-info-item">
                  <span className="order-info-label">Full Name</span>
                  <span className="order-info-value">{selectedUser.name || 'N/A'}</span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">Email</span>
                  <span className="order-info-value">{selectedUser.email || 'N/A'}</span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">Phone</span>
                  <span className="order-info-value">{selectedUser.phone || 'N/A'}</span>
                </div>
                <div className="order-info-item">
                  <span className="order-info-label">Total Orders</span>
                  <span className="order-info-value">{getOrderCount(selectedUser)}</span>
                </div>
                {selectedUser.created_at && (
                  <div className="order-info-item">
                    <span className="order-info-label">Member Since</span>
                    <span className="order-info-value">
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Address Section */}
              {selectedUser.address && (
                <div className="order-address-section">
                  <span className="order-info-label">Address</span>
                  <span className="order-info-value">{selectedUser.address}</span>
                </div>
              )}

              {/* Recent Orders Section */}
              {selectedUser.orders && selectedUser.orders.length > 0 && (
                <div className="order-items-section">
                  <h5 className="order-items-title">Recent Orders ({selectedUser.orders.length})</h5>
                  <div className="order-items-list">
                    {selectedUser.orders.slice(0, 5).map((order, i) => (
                      <div key={i} className="order-item">
                        <span className="order-item-bullet">•</span>
                        <span className="order-item-text">
                          Order #{order.id} - ₱{parseFloat(order.total_amount || 0).toFixed(2)} - {order.status || 'pending'}
                        </span>
                      </div>
                    ))}
                    {selectedUser.orders.length > 5 && (
                      <div className="order-item" style={{ fontStyle: 'italic', color: '#666' }}>
                        <span className="order-item-text">
                          ...and {selectedUser.orders.length - 5} more order(s)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="order-modal-footer">
          <Button variant="secondary" onClick={() => setShowUserModal(false)} className="order-close-btn">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminUsers;

