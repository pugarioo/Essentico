import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { FaStar, FaRegStar } from "react-icons/fa";
import ProductContext from "../contexts/ProductContext";
import "./ProductDetails.css";
import productbg from '../assets/images/products-bg.jpg'

export default function ProductDetails() {
  const products = useContext(ProductContext)
  const { id } = useParams();
  const product = products.find(
    (item) => String(item.product_id) === String(id)
  );

  if (!product) {
    return (
      <div className="product-details-container">
        <h2>Product not found</h2>
      </div>
    );
  }

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? <FaStar key={i} color="#f4b400" /> : <FaRegStar key={i} color="#ccc" />);
    }
    return stars;
  };

  return (
    <div className="product-details-container">
      <div className='product-details-bg'
      style={{ backgroundImage: `url(${productbg})` }}></div>
      <div className="product-details-wrapper">
        {/* Left Side */}
        <div className="image-section">
          <img
            src={require(`../assets/images/${product.image_filename}`)}
            alt={product.name}
            className="main-product-image"
          />
          
        </div>

        {/* Right Side */}
        <div className="info-section">
          <h1 className="product-title">{product.name}</h1>

          <div className="rating-section">
            {renderStars(Math.round(product.rating))}
            <span className="rating-score">[{product.rating}]</span>
            <span className="review-count">{product.review_count} reviews</span>
          </div>

          <h2 className="price">₱ {product.price}</h2>

          <div className="description-section">
            <h4>Description</h4>
            <p>{product.description}</p>
          </div>

          <div className="buttons-section">
            <button className="add-to-cart-btn">Add to Cart</button>
            <button className="buy-now-btn">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
