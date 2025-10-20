import React from "react";
import { useParams } from "react-router-dom";
import { FaStar, FaRegStar, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import productsData from "../components/sampledata.json";
import "./ProductDetails.css";

export default function ProductDetails() {
  const { id } = useParams();
  const product = productsData.find(
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
      <div className="product-details-wrapper">
        {/* Left Side */}
        <div className="image-section">
          <img
            src={require(`../assets/images/${product.image_filename}`)}
            alt={product.name}
            className="main-product-image"
          />
          <div className="arrow-controls">
            <FaArrowLeft />
            <FaArrowRight />
          </div>

          <div className="thumbnail-row">
            {product.thumbnails &&
              product.thumbnails.map((thumb, index) => (
                <img
                  key={index}
                  src={require(`../assets/images/${thumb}`)}
                  alt={`Thumbnail ${index + 1}`}
                  className="thumbnail-image"
                />
              ))}
          </div>
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
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="color-section">
            <h3>Available Colors</h3>
            <div className="color-list">
              {product.colors &&
                product.colors.map((color, index) => (
                  <span
                    key={index}
                    className="color-dot"
                    style={{ backgroundColor: color }}
                  ></span>
                ))}
            </div>
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
