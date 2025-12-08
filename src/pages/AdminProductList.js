import React, { useEffect, useState, useContext } from "react";
import { FaEdit, FaTrash, FaCheck, FaTimes, FaEye } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";
import AuthContext from "../contexts/AuthContext";
import AlertContext from "../contexts/AlertContext";
import './AdminProductList.css';

function AdminProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingProducts, setUpdatingProducts] = useState(new Set());
  const [deletingProducts, setDeletingProducts] = useState(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [addFormData, setAddFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock_quantity: 0,
    category_id: '',
    is_available: true
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);
  const { alert: showAlert, confirm: showConfirm } = useContext(AlertContext);

  useEffect(() => {
    fetch("http://localhost:8082/api/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Fetch categories for the dropdown
  useEffect(() => {
    fetch("http://localhost:8082/api/categories")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        return response.json();
      })
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      });
  }, []);

  const handleView = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      console.log('Viewing product:', product);
      console.log('Product category_id:', product.category_id);
      console.log('Product category object:', product.category);
      console.log('Available categories:', categories);
      setViewingProduct(product);
      setShowViewModal(true);
    }
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingProduct(null);
  };

  const handleEdit = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setEditingProduct(product);
      setEditFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        stock_quantity: product.stock_quantity || 0,
        category_id: product.category_id || '',
        is_available: product.is_available !== undefined ? product.is_available : true
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

  const handleOpenAddModal = () => {
    setAddFormData({
      name: '',
      description: '',
      price: 0,
      stock_quantity: 0,
      category_id: '',
      is_available: true
    });
    setSelectedImage(null);
    setImagePreview(null);
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setAddFormData({
      name: '',
      description: '',
      price: 0,
      stock_quantity: 0,
      category_id: '',
      is_available: true
    });
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingProduct(null);
    setEditFormData({});
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleUpdateProduct = async () => {
    if (!isAuthenticated) {
      await showAlert({ title: 'Unauthorized', message: 'You must be logged in to update products', variant: 'warning' });
      return;
    }

    if (!editFormData.name || !editFormData.price) {
      await showAlert({ title: 'Missing Fields', message: 'Please fill in all required fields (name and price)', variant: 'warning' });
      return;
    }

    setIsUpdating(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      // Add text fields
      formData.append('name', editFormData.name);
      formData.append('description', editFormData.description || '');
      formData.append('price', editFormData.price);
      formData.append('stock_quantity', editFormData.stock_quantity || 0);
      if (editFormData.category_id) {
        formData.append('category_id', editFormData.category_id);
      }
      formData.append('is_available', editFormData.is_available ? '1' : '0');
      
      // Add image if selected
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch(`http://localhost:8082/api/products/${editingProduct.id}`, {
        method: 'POST', // Laravel typically uses POST for updates with FormData
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type - browser will set it with boundary for FormData
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update product');
      }

      const updatedProduct = await response.json();
      
      // Update local state
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === editingProduct.id
            ? { ...product, ...updatedProduct }
            : product
        )
      );

      handleCloseEditModal();
      await showAlert({ title: 'Success', message: 'Product updated successfully!', variant: 'success' });
    } catch (error) {
      console.error('Error updating product:', error);
      await showAlert({ title: 'Error', message: error.message || 'Failed to update product', variant: 'danger' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddProduct = async () => {
    if (!isAuthenticated) {
      await showAlert({ title: 'Unauthorized', message: 'You must be logged in to add products', variant: 'warning' });
      return;
    }

    if (!addFormData.name || !addFormData.price) {
      await showAlert({ title: 'Missing Fields', message: 'Please fill in all required fields (name and price)', variant: 'warning' });
      return;
    }

    setIsAdding(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      // Add text fields
      formData.append('name', addFormData.name);
      formData.append('description', addFormData.description || '');
      formData.append('price', addFormData.price);
      formData.append('stock_quantity', addFormData.stock_quantity || 0);
      if (addFormData.category_id) {
        formData.append('category_id', addFormData.category_id);
      }
      formData.append('is_available', addFormData.is_available ? '1' : '0');
      
      // Add image if selected
      if (selectedImage) {
        formData.append('image', selectedImage);
      }


      console.log(formData);
      const response = await fetch('http://localhost:8082/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type - browser will set it with boundary for FormData
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add product');
      }

      const newProduct = await response.json();
      
      // Add to local state
      setProducts(prevProducts => [...prevProducts, newProduct]);

      handleCloseAddModal();
      await showAlert({ title: 'Success', message: 'Product added successfully!', variant: 'success' });
    } catch (error) {
      console.error('Error adding product:', error);
      await showAlert({ title: 'Error', message: error.message || 'Failed to add product', variant: 'danger' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (productId) => {
    const confirmed = await showConfirm({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      variant: 'danger',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel'
    });
    if (!confirmed) return;

    if (!isAuthenticated) {
      await showAlert({ title: 'Unauthorized', message: 'You must be logged in to delete products', variant: 'warning' });
      return;
    }

    setDeletingProducts(prev => new Set(prev).add(productId));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8082/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete product');
      }

      // Remove from local state
      setProducts(prevProducts =>
        prevProducts.filter(product => product.id !== productId)
      );

      await showAlert({ title: 'Success', message: 'Product deleted successfully!', variant: 'success' });
    } catch (error) {
      console.error('Error deleting product:', error);
      await showAlert({ title: 'Error', message: error.message || 'Failed to delete product', variant: 'danger' });
    } finally {
      setDeletingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleToggleListed = async (productId, currentStatus) => {
    if (!isAuthenticated) {
      await showAlert({ title: 'Unauthorized', message: 'You must be logged in to update products', variant: 'warning' });
      return;
    }

    const newStatus = !currentStatus;
    setUpdatingProducts(prev => new Set(prev).add(productId));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8082/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          is_available: newStatus
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update product availability');
      }

      // Update local state
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === productId
            ? { ...product, is_available: newStatus }
            : product
        )
      );
    } catch (error) {
      console.error('Error updating product availability:', error);
      await showAlert({ title: 'Error', message: error.message || 'Failed to update product availability', variant: 'danger' });
    } finally {
      setUpdatingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  if (loading) return <div className="admin-content"><p>Loading products...</p></div>;
  if (error) return <div className="admin-content"><p>Error: {error}</p></div>;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h2>Product List</h2>
        <button className="btn-primary btn-add-new" onClick={handleOpenAddModal}>
          + Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="product-cards-container">
          {products.map((product) => {
            // Support both image_url and image_filename
            const imageUrl = product.image_url 
              ? product.image_url
              : product.image_filename 
                ? `http://localhost:8082/storage/products/${product.image_filename}`
                : null;
            
            return (
              <div key={product.id} className="product-card-horizontal">
                <div className="product-card-image">
                  {imageUrl ? (
                    <img src={imageUrl} alt={product.name} />
                  ) : (
                    <div className="product-image-placeholder">No Image</div>
                  )}
                </div>
                
                <div className="product-card-content">
                  <h3 className="product-card-name">{product.name}</h3>
                  <p className="product-card-price">₱{product.price?.toFixed(2) || '0.00'}</p>
                  <p className="product-card-description">
                    {product.description || 'No description available'}
                  </p>
                </div>
                
                <div className="product-card-actions">
                  <button 
                    className="action-btn action-view"
                    onClick={() => handleView(product.id)}
                    title="View Details"
                  >
                    <FaEye /> View
                  </button>
                  <button 
                    className={`action-btn action-listed ${product.is_available ? 'listed-active' : 'listed-inactive'}`}
                    onClick={() => handleToggleListed(product.id, product.is_available)}
                    title={product.is_available ? "Unlist Product" : "List Product"}
                    disabled={updatingProducts.has(product.id)}
                  >
                    {product.is_available ? <FaCheck /> : <FaTimes />}
                    {updatingProducts.has(product.id) ? 'Updating...' : (product.is_available ? 'Listed' : 'Unlisted')}
                  </button>
                  <button 
                    className="action-btn action-edit"
                    onClick={() => handleEdit(product.id)}
                    title="Edit"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button 
                    className="action-btn action-delete"
                    onClick={() => handleDelete(product.id)}
                    title="Delete"
                    disabled={deletingProducts.has(product.id)}
                  >
                    <FaTrash /> {deletingProducts.has(product.id) ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingProduct && (
            <Form>
              <Form.Group className="mb-3 text-center">
                <Form.Label>Product Image</Form.Label>
                <div className="profile-image-upload">
                  <img 
                    src={imagePreview || (editingProduct.image_filename 
                      ? `http://localhost:8082/storage/products/${editingProduct.image_filename}`
                      : editingProduct.image_url || '')} 
                    alt="Product Preview" 
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
                <Form.Label>Product Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Price (₱) *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  value={editFormData.price || 0}
                  onChange={(e) => setEditFormData({ ...editFormData, price: parseFloat(e.target.value) || 0 })}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Stock Quantity</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={editFormData.stock_quantity || 0}
                  onChange={(e) => setEditFormData({ ...editFormData, stock_quantity: parseInt(e.target.value) || 0 })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={editFormData.category_id || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, category_id: e.target.value })}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.category_name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Product is available (listed)"
                  checked={editFormData.is_available || false}
                  onChange={(e) => setEditFormData({ ...editFormData, is_available: e.target.checked })}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleUpdateProduct} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Product"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ADD PRODUCT MODAL */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3 text-center">
              <Form.Label>Product Image</Form.Label>
              <div className="profile-image-upload">
                <img 
                  src={imagePreview || ''} 
                  alt="Product Preview" 
                  className="profile-img-preview"
                  style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', display: imagePreview ? 'block' : 'none' }}
                />
                {!imagePreview && (
                  <div style={{ width: '200px', height: '200px', border: '2px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                    No Image Selected
                  </div>
                )}
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-2"
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Product Name *</Form.Label>
              <Form.Control
                type="text"
                value={addFormData.name || ''}
                onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={addFormData.description || ''}
                onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price (₱) *</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                value={addFormData.price || 0}
                onChange={(e) => setAddFormData({ ...addFormData, price: parseFloat(e.target.value) || 0 })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Stock Quantity</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={addFormData.stock_quantity || 0}
                onChange={(e) => setAddFormData({ ...addFormData, stock_quantity: parseInt(e.target.value) || 0 })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={addFormData.category_id || ''}
                onChange={(e) => setAddFormData({ ...addFormData, category_id: e.target.value })}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.category_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Product is available (listed)"
                checked={addFormData.is_available || false}
                onChange={(e) => setAddFormData({ ...addFormData, is_available: e.target.checked })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleAddProduct} disabled={isAdding}>
            {isAdding ? "Adding..." : "Add Product"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* VIEW PRODUCT MODAL */}
      <Modal show={showViewModal} onHide={handleCloseViewModal} size="lg">
        <Modal.Header closeButton className="order-modal-header">
          <Modal.Title className="order-modal-title">Product Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="order-modal-body">
          {viewingProduct && (
            <div className="product-view-container">
              <div className="product-view-image-section" style={{ 
                textAlign: 'center', 
                marginBottom: '25px',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}>
                {(() => {
                  const imageUrl = viewingProduct.image_url 
                    ? viewingProduct.image_url
                    : viewingProduct.image_filename 
                      ? `http://localhost:8082/storage/products/${viewingProduct.image_filename}`
                      : null;
                  return imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={viewingProduct.name} 
                      className="product-view-image"
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '400px', 
                        objectFit: 'contain', 
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                  ) : (
                    <div className="product-view-placeholder" style={{ 
                      width: '100%', 
                      height: '300px', 
                      backgroundColor: '#e9ecef', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      borderRadius: '8px',
                      color: '#6c757d',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}>
                      No Image Available
                    </div>
                  );
                })()}
              </div>
              
              <div className="product-view-details">
                <div className="product-view-detail-row">
                  <div className="product-view-label">Product Name</div>
                  <div className="product-view-value product-view-name">
                    {viewingProduct.name || 'N/A'}
                  </div>
                </div>

                <div className="product-view-detail-row">
                  <div className="product-view-label">Price</div>
                  <div className="product-view-value product-view-price">
                    ₱{viewingProduct.price?.toFixed(2) || '0.00'}
                  </div>
                </div>

                <div className="product-view-detail-row">
                  <div className="product-view-label">Stock Quantity</div>
                  <div className="product-view-value">
                    {viewingProduct.stock_quantity || 0} units
                  </div>
                </div>

                <div className="product-view-detail-row">
                  <div className="product-view-label">Category</div>
                  <div className="product-view-value">
                    {(() => {
                      // Try multiple ways to get category name
                      // 1. Check if category is a string directly (e.g., "Furniture")
                      if (typeof viewingProduct.category === 'string' && viewingProduct.category) {
                        return viewingProduct.category;
                      }
                      // 2. Check if category is nested object with category_name
                      if (viewingProduct.category?.category_name) {
                        return viewingProduct.category.category_name;
                      }
                      // 3. Check if category_name is a direct property
                      if (viewingProduct.category_name) {
                        return viewingProduct.category_name;
                      }
                      // 4. Look up category by ID (handle both string and number IDs)
                      if (viewingProduct.category_id) {
                        const category = categories.find(c => 
                          String(c.id) === String(viewingProduct.category_id) || 
                          c.id === viewingProduct.category_id ||
                          String(c.id) === String(viewingProduct.category?.id)
                        );
                        if (category) {
                          return category.category_name;
                        }
                      }
                      // 5. If no category found, show message
                      return 'No category assigned';
                    })()}
                  </div>
                </div>

                <div className="product-view-detail-row">
                  <div className="product-view-label">Status</div>
                  <div className="product-view-value">
                    <span className={`product-status-badge ${viewingProduct.is_available ? 'status-available' : 'status-unavailable'}`}>
                      {viewingProduct.is_available ? 'Available (Listed)' : 'Unavailable (Unlisted)'}
                    </span>
                  </div>
                </div>

                <div className="product-view-detail-row product-view-description-row">
                  <div className="product-view-label">Description</div>
                  <div className="product-view-value product-view-description">
                    {viewingProduct.description || 'No description available'}
                  </div>
                </div>

                <div className="product-view-detail-row">
                  <div className="product-view-label">Product ID</div>
                  <div className="product-view-value product-view-id">
                    #{viewingProduct.id}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="order-modal-footer">
          <Button variant="secondary" onClick={handleCloseViewModal}>
            Close
          </Button>
          <Button variant="primary" onClick={() => {
            handleCloseViewModal();
            if (viewingProduct) {
              handleEdit(viewingProduct.id);
            }
          }}>
            <FaEdit style={{ marginRight: '5px' }} /> Edit Product
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminProductList;

