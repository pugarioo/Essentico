import React, { useEffect, useState, useContext } from "react";
import { FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import AuthContext from "../contexts/AuthContext";
import './AdminProductList.css';

function AdminProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingProducts, setUpdatingProducts] = useState(new Set());
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

  const handleEdit = (productId) => {
    console.log('Edit product:', productId);
    // TODO: Implement edit functionality
  };

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      console.log('Delete product:', productId);
      // TODO: Implement delete functionality
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
        <button className="btn-primary btn-add-new">+ Add Product</button>
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
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminProductList;

