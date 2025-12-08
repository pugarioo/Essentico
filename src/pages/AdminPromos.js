import React, { useState, useEffect, useContext } from "react";
import { FaEdit, FaTrash, FaTag } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";
import AuthContext from "../contexts/AuthContext";
import AlertContext from "../contexts/AlertContext";
import './AdminPromos.css';

// Format ISO date string to readable format
const formatDate = (isoString) => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const AdminPromos = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountValue, setDiscountValue] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [editingPromo, setEditingPromo] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingPromos, setDeletingPromos] = useState(new Set());
  const { isAuthenticated } = useContext(AuthContext);
  const { alert: showAlert, confirm: showConfirm } = useContext(AlertContext);

  const fetchPromos = () => {
    fetch("http://localhost:8082/api/discounts")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch promos");
        }
        return response.json();
      })
      .then((data) => {
        setPromos(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleAddPromo = () => {
    setDiscountCode('');
    setDiscountValue('');
    setExpirationDate('');
    setIsActive(true);
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setDiscountCode('');
    setDiscountValue('');
    setExpirationDate('');
    setIsActive(true);
  };

  const handleCreatePromo = async () => {
    if (!isAuthenticated) {
      await showAlert({ title: 'Unauthorized', message: 'You must be logged in to create promos', variant: 'warning' });
      return;
    }

    // Validate required fields
    if (!discountCode || !discountCode.trim()) {
      await showAlert({ title: 'Missing Code', message: 'Please enter a discount code', variant: 'warning' });
      return;
    }

    if (!discountValue || isNaN(discountValue) || parseFloat(discountValue) <= 0 || parseFloat(discountValue) > 100) {
      await showAlert({ title: 'Invalid Percentage', message: 'Please enter a valid discount percentage (1-100)', variant: 'warning' });
      return;
    }

    setIsCreating(true);

    try {
      const token = localStorage.getItem("token");
      const requestBody = {
        discount_code: discountCode.trim().toUpperCase(),
        discount_value: parseFloat(discountValue),
        is_active: isActive
      };

      if (expirationDate) {
        requestBody.expiration_date = expirationDate;
      }

      const response = await fetch('http://localhost:8082/api/discounts', {
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
        let errorMessage = errorData.message || 'Failed to create promo';
        
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

      fetchPromos();
      handleCloseAddModal();
      await showAlert({ title: 'Success', message: 'Promo created successfully!', variant: 'success' });
    } catch (error) {
      console.error('Error creating promo:', error);
      await showAlert({ title: 'Error', message: error.message || 'Failed to create promo', variant: 'danger' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (promoId) => {
    const promo = promos.find(p => p.id === promoId);
    if (promo) {
      setEditingPromo(promo);
      setDiscountCode(promo.discount_code || '');
      // Check for both 'value' and 'discount_value' field names (backend compatibility)
      const discountValue = promo.value !== undefined ? promo.value : (promo.discount_value !== undefined ? promo.discount_value : '');
      setDiscountValue(discountValue !== '' ? discountValue.toString() : '');
      setExpirationDate(promo.expiration_date ? promo.expiration_date.split('T')[0] : '');
      setIsActive(promo.is_active !== undefined ? promo.is_active : true);
      setShowEditModal(true);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingPromo(null);
    setDiscountCode('');
    setDiscountValue('');
    setExpirationDate('');
    setIsActive(true);
  };

  const handleUpdatePromo = async () => {
    if (!isAuthenticated) {
      await showAlert({ title: 'Unauthorized', message: 'You must be logged in to update promos', variant: 'warning' });
      return;
    }

    if (!editingPromo) {
      return;
    }

    if (!discountCode || !discountCode.trim()) {
      await showAlert({ title: 'Missing Code', message: 'Please enter a discount code', variant: 'warning' });
      return;
    }

    if (!discountValue || isNaN(discountValue) || parseFloat(discountValue) <= 0 || parseFloat(discountValue) > 100) {
      await showAlert({ title: 'Invalid Percentage', message: 'Please enter a valid discount percentage (1-100)', variant: 'warning' });
      return;
    }

    setIsUpdating(true);

    try {
      const token = localStorage.getItem("token");
      const requestBody = {
        discount_code: discountCode.trim().toUpperCase(),
        discount_value: parseFloat(discountValue),
        is_active: isActive
      };

      if (expirationDate) {
        requestBody.expiration_date = expirationDate;
      }

      const response = await fetch(`http://localhost:8082/api/discounts/${editingPromo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.message || 'Failed to update promo';
        
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

      fetchPromos();
      handleCloseEditModal();
      await showAlert({ title: 'Success', message: 'Promo updated successfully!', variant: 'success' });
    } catch (error) {
      console.error('Error updating promo:', error);
      await showAlert({ title: 'Error', message: error.message || 'Failed to update promo', variant: 'danger' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (promoId) => {
    const confirmed = await showConfirm({
      title: 'Delete Promo',
      message: 'Are you sure you want to delete this promo? This action cannot be undone.',
      variant: 'danger',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel'
    });
    if (!confirmed) return;

    if (!isAuthenticated) {
      await showAlert({ title: 'Unauthorized', message: 'You must be logged in to delete promos', variant: 'warning' });
      return;
    }

    setDeletingPromos(prev => new Set(prev).add(promoId));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8082/api/discounts/${promoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete promo');
      }

      setPromos(prevPromos =>
        prevPromos.filter(promo => promo.id !== promoId)
      );

      await showAlert({ title: 'Success', message: 'Promo deleted successfully!', variant: 'success' });
    } catch (error) {
      console.error('Error deleting promo:', error);
      await showAlert({ title: 'Error', message: error.message || 'Failed to delete promo', variant: 'danger' });
    } finally {
      setDeletingPromos(prev => {
        const newSet = new Set(prev);
        newSet.delete(promoId);
        return newSet;
      });
    }
  };

  if (loading) return <div className="admin-content"><p>Loading promos...</p></div>;
  if (error) return <div className="admin-content"><p>Error: {error}</p></div>;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h2>Discounts/Promos</h2>
        <button className="btn-primary btn-add-new" onClick={handleAddPromo}>
          + Add Promo
        </button>
      </div>

      <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Discount Code</th>
              <th>Value (%)</th>
              <th>Expiration Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {promos.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No promos found.
                </td>
              </tr>
            ) : (
              promos.map((promo) => (
                <tr key={promo.id}>
                  <td>{promo.id}</td>
                  <td>
                    <FaTag style={{ marginRight: "8px", color: "#767945" }} />
                    {promo.discount_code}
                  </td>
                  <td>{promo.value !== undefined ? `${promo.value}%` : 'N/A'}</td>
                  <td>{formatDate(promo.expiration_date)}</td>
                  <td>
                    <span className={`status-badge ${promo.is_active ? 'status-active' : 'status-inactive'}`}>
                      {promo.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button 
                      className="icon-btn action-edit" 
                      title="Edit"
                      onClick={() => handleEdit(promo.id)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="icon-btn action-delete" 
                      title="Delete"
                      onClick={() => handleDelete(promo.id)}
                      disabled={deletingPromos.has(promo.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

      {/* ADD PROMO MODAL */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} size="lg">
        <Modal.Header closeButton className="order-modal-header">
          <Modal.Title className="order-modal-title">Add New Promo</Modal.Title>
        </Modal.Header>
        <Modal.Body className="order-modal-body">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Discount Code *</Form.Label>
              <Form.Control
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                placeholder="Enter discount code (e.g., SAVE20)"
                required
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Discount Value (%) *</Form.Label>
              <Form.Control
                type="number"
                value={discountValue}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
                    setDiscountValue(value);
                  }
                }}
                placeholder="Enter percentage (1-100)"
                min="0"
                max="100"
                step="0.01"
                required
              />
              <Form.Text className="text-muted">
                Enter the discount percentage (e.g., 10 for 10% off)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Expiration Date</Form.Label>
              <Form.Control
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="order-modal-footer">
          <Button variant="secondary" onClick={handleCloseAddModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreatePromo} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Promo"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* EDIT PROMO MODAL */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg">
        <Modal.Header closeButton className="order-modal-header">
          <Modal.Title className="order-modal-title">Edit Promo</Modal.Title>
        </Modal.Header>
        <Modal.Body className="order-modal-body">
          {editingPromo && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Discount Code *</Form.Label>
                <Form.Control
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="Enter discount code"
                  required
                  autoFocus
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Discount Value (%) *</Form.Label>
                <Form.Control
                  type="number"
                  value={discountValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
                      setDiscountValue(value);
                    }
                  }}
                  placeholder="Enter percentage (1-100)"
                  min="0"
                  max="100"
                  step="0.01"
                  required
                />
                <Form.Text className="text-muted">
                  Enter the discount percentage (e.g., 10 for 10% off)
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Expiration Date</Form.Label>
                <Form.Control
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className="order-modal-footer">
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdatePromo} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Promo"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminPromos;

