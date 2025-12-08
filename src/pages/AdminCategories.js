import React, { useState, useEffect, useContext } from "react";
import { FaFolder, FaEdit, FaTrash } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";
import AuthContext from "../contexts/AuthContext";
import AlertContext from "../contexts/AlertContext";
import './AdminCategories.css';

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

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingCategories, setDeletingCategories] = useState(new Set());
  const { isAuthenticated } = useContext(AuthContext);
  const { alert: showAlert, confirm: showConfirm } = useContext(AlertContext);

  const fetchCategories = () => {
    fetch("http://localhost:8082/api/categories")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        return response.json();
      })
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    setCategoryName('');
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setCategoryName('');
  };

  const handleCreateCategory = async () => {
    if (!isAuthenticated) {
      await showAlert({ title: 'Unauthorized', message: 'You must be logged in to create categories', variant: 'warning' });
      return;
    }

    // Validate required fields
    if (!categoryName || !categoryName.trim()) {
      await showAlert({ title: 'Missing Name', message: 'Please enter a category name', variant: 'warning' });
      return;
    }

    setIsCreating(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:8082/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category_name: categoryName.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.message || 'Failed to create category';
        
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

      // Refresh the category list
      fetchCategories();

      handleCloseAddModal();
      await showAlert({ title: 'Success', message: 'Category created successfully!', variant: 'success' });
    } catch (error) {
      console.error('Error creating category:', error);
      await showAlert({ title: 'Error', message: error.message || 'Failed to create category', variant: 'danger' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      setEditingCategory(category);
      setEditCategoryName(category.category_name || '');
      setShowEditModal(true);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingCategory(null);
    setEditCategoryName('');
  };

  const handleUpdateCategory = async () => {
    if (!isAuthenticated) {
      await showAlert({ title: 'Unauthorized', message: 'You must be logged in to update categories', variant: 'warning' });
      return;
    }

    if (!editingCategory) {
      return;
    }

    // Validate required fields
    if (!editCategoryName || !editCategoryName.trim()) {
      await showAlert({ title: 'Missing Name', message: 'Please enter a category name', variant: 'warning' });
      return;
    }

    setIsUpdating(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8082/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category_name: editCategoryName.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.message || 'Failed to update category';
        
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

      // Refresh the category list
      fetchCategories();

      handleCloseEditModal();
      await showAlert({ title: 'Success', message: 'Category updated successfully!', variant: 'success' });
    } catch (error) {
      console.error('Error updating category:', error);
      await showAlert({ title: 'Error', message: error.message || 'Failed to update category', variant: 'danger' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (categoryId) => {
    // Find the category to check product count
    const category = categories.find(c => c.id === categoryId);
    
    // Check if category has products
    if (category && category.products_count > 0) {
      await showAlert({
        title: 'Cannot Delete Category',
        message: `Cannot delete category "${category.category_name}". It has ${category.products_count} product(s) associated with it. Please reassign or remove these products first.`,
        variant: 'warning'
      });
      return;
    }

    const confirmed = await showConfirm({
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? This action cannot be undone.',
      variant: 'danger',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel'
    });
    if (!confirmed) return;

    if (!isAuthenticated) {
      await showAlert({ title: 'Unauthorized', message: 'You must be logged in to delete categories', variant: 'warning' });
      return;
    }

    setDeletingCategories(prev => new Set(prev).add(categoryId));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8082/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete category');
      }

      // Remove from local state
      setCategories(prevCategories =>
        prevCategories.filter(category => category.id !== categoryId)
      );

      await showAlert({ title: 'Success', message: 'Category deleted successfully!', variant: 'success' });
    } catch (error) {
      console.error('Error deleting category:', error);
      await showAlert({ title: 'Error', message: error.message || 'Failed to delete category', variant: 'danger' });
    } finally {
      setDeletingCategories(prev => {
        const newSet = new Set(prev);
        newSet.delete(categoryId);
        return newSet;
      });
    }
  };

  if (loading) return <div className="admin-content"><p>Loading categories...</p></div>;
  if (error) return <div className="admin-content"><p>Error: {error}</p></div>;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h2>Category List</h2>
        <button className="btn-primary btn-add-new" onClick={handleAddCategory}>
          + Add Category
        </button>
      </div>

      <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category Name</th>
              <th>Product Count</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>
                    <FaFolder style={{ marginRight: "8px", color: "#767945" }} />
                    {category.category_name}
                  </td>
                  <td>{category.products_count}</td>
                  <td>{formatDate(category.created_at)}</td>
                  <td>{formatDate(category.updated_at)}</td>
                  <td className="action-buttons">
                    <button 
                      className="icon-btn action-edit" 
                      title="Edit"
                      onClick={() => handleEdit(category.id)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="icon-btn action-delete" 
                      title={category.products_count > 0 ? `Cannot delete: ${category.products_count} product(s) exist` : "Delete"}
                      onClick={() => handleDelete(category.id)}
                      disabled={deletingCategories.has(category.id) || category.products_count > 0}
                      style={category.products_count > 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

      {/* ADD CATEGORY MODAL */}
      <Modal show={showAddModal} onHide={handleCloseAddModal}>
        <Modal.Header closeButton className="order-modal-header">
          <Modal.Title className="order-modal-title">Add New Category</Modal.Title>
        </Modal.Header>
        <Modal.Body className="order-modal-body">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Category Name *</Form.Label>
              <Form.Control
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter category name"
                required
                autoFocus
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="order-modal-footer">
          <Button variant="secondary" onClick={handleCloseAddModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateCategory} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Category"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* EDIT CATEGORY MODAL */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton className="order-modal-header">
          <Modal.Title className="order-modal-title">Edit Category</Modal.Title>
        </Modal.Header>
        <Modal.Body className="order-modal-body">
          {editingCategory && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Category Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  required
                  autoFocus
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className="order-modal-footer">
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateCategory} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Category"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminCategories;

