import React, { useState, useContext } from 'react';
import { Modal, Button } from 'react-bootstrap';
import StarRating from './StarRating';
import AlertContext from '../contexts/AlertContext';
import './RatingModal.css';

const RatingModal = ({ show, onHide, product, orderId, onRatingSubmit }) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { alert: showAlert } = useContext(AlertContext);

  const handleSubmit = async () => {
    if (selectedRating === 0) {
      await showAlert({ title: 'Select Rating', message: 'Please select a rating', variant: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:8082/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product.id,
          order_id: orderId,
          rating: selectedRating
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit rating');
      }

      const result = await response.json();
      
      if (onRatingSubmit) {
        onRatingSubmit(result);
      }

      await showAlert({ title: 'Success', message: 'Rating submitted successfully!', variant: 'success' });
      handleClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
      await showAlert({ title: 'Error', message: error.message || 'Failed to submit rating', variant: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset selected rating when closing
    setSelectedRating(0);
    // Let parent control visibility; don't manipulate DOM/backdrops directly
    onHide();
  };

  if (!product) return null;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      className="rating-modal"
      enforceFocus={false} // allow interaction when stacked with order modal
      restoreFocus={true}
      backdrop={false} // prevent adding a second backdrop that can trap clicks
      keyboard
    >
      <Modal.Header closeButton className="rating-modal-header">
        <Modal.Title>Rate Product</Modal.Title>
      </Modal.Header>
      <Modal.Body className="rating-modal-body">
        <div className="rating-product-info">
          {product.image_filename && (
            <img 
              src={`http://localhost:8082/storage/products/${product.image_filename}`}
              alt={product.name}
              className="rating-product-image"
            />
          )}
          <h5>{product.name}</h5>
        </div>
        
        <div className="rating-selector-section">
          <p className="rating-prompt">How would you rate this product?</p>
          <StarRating 
            rating={selectedRating}
            onRatingChange={setSelectedRating}
            readonly={false}
            size={32}
          />
          {selectedRating > 0 && (
            <p className="rating-selected">You selected {selectedRating} star{selectedRating !== 1 ? 's' : ''}</p>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer className="rating-modal-footer">
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={selectedRating === 0 || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Rating'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RatingModal;

