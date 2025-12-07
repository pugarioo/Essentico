import React, { useEffect, useState, useContext } from "react";
import { FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";
import AuthContext from "../contexts/AuthContext";
import './AdminProductList.css';

function AdminProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingProducts, setUpdatingProducts] = useState(new Set());
  const [deletingProducts, setDeletingProducts] = useState(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
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
      alert('You must be logged in to update products');
      return;
    }

    if (!editFormData.name || !editFormData.price) {
      alert('Please fill in all required fields (name and price)');
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
      alert('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert(error.message || 'Failed to update product');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddProduct = async () => {
    if (!isAuthenticated) {
      alert('You must be logged in to add products');
      return;
    }

    if (!addFormData.name || !addFormData.price) {
      alert('Please fill in all required fields (name and price)');
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
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert(error.message || 'Failed to add product');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    if (!isAuthenticated) {
      alert('You must be logged in to delete products');
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

      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(error.message || 'Failed to delete product');
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
      alert('You must be logged in to update products');
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
      alert(error.message || 'Failed to update product availability');
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
    </div>
  );
}

export default AdminProductList;

