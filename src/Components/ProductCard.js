import React from 'react';
import { FaBookmark, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom'; 
import './ProductCard.css';

function ProductCard({ product }) {
  if (!product) return null;

  const imagePath = require(`../assets/images/${product.image_filename}`);

  return (
    <Link 
      to={`/products/${product.product_id}`} 
      className="product-card-link"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div className="product-card">
        <div className="card-header">
          <FaBookmark className="bookmark-icon" />
        </div>
        <img src={imagePath} alt={product.name} className="product-image" />
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">₱ {product.price.toFixed(2)}</p>
        <div className="add-btn">
          <FaPlus />
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
