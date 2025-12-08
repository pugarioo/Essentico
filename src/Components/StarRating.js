import React, { useState } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import './StarRating.css';

const StarRating = ({ rating, onRatingChange, readonly = false, size = 20 }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const displayRating = hoverRating || rating || 0;
        const isFilled = star <= displayRating;
        
        return (
          <span
            key={star}
            className={`star ${!readonly ? 'star-clickable' : ''}`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            style={{ fontSize: `${size}px`, cursor: readonly ? 'default' : 'pointer' }}
          >
            {isFilled ? (
              <FaStar color="#f4b400" />
            ) : (
              <FaRegStar color="#ccc" />
            )}
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;

