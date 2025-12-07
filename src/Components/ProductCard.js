import React, { useContext } from 'react';
import { FaBookmark, FaPlus } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom'; 
import './ProductCard.css';
import CartContext from '../contexts/CartContext';
import PopupContext from '../contexts/PopupContext';
import AuthContext from '../contexts/AuthContext';


function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  const { showPopup } = useContext(PopupContext);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!product) return null;

  const imagePath = `http://localhost:8082/storage/products/${product.image_filename}`;

  const handleAddToCartClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    showPopup(product, (quantity) => {
      addToCart(product, quantity);
    });
  };

  return (
    
      <div className="product-card">
        <Link
        to={`/products/${product.id}`} 
        className="product-card-link"
        style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div className="card-header">
            <FaBookmark className="bookmark-icon" />
          </div>
          <img src={imagePath} alt={product.name} className="product-image" />
          <h3 className="product-name">{product.name}</h3>
          <p className="product-price">₱ {product.price.toFixed(2)}</p>
        </Link>
        <div className="add-btn" onClick={handleAddToCartClick}>
          <FaPlus />
        </div>
      </div>
  );
}

export default ProductCard;
