import React, { useState, useEffect, useContext } from 'react';
import { Table, Button } from 'react-bootstrap';
import StarRating from '../components/StarRating';
import AuthContext from '../contexts/AuthContext';
import AlertContext from '../contexts/AlertContext';
import './AdminRatings.css';

const AdminRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingRatings, setDeletingRatings] = useState(new Set());
  const { isAuthenticated } = useContext(AuthContext);
  const { confirm: showConfirm, alert: showAlert } = useContext(AlertContext);

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch('http://localhost:8082/api/admin/ratings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Endpoint doesn't exist yet - that's okay
          setRatings([]);
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch ratings');
      }

      const data = await response.json();
      setRatings(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (ratingId) => {
    const confirmed = await showConfirm({
      title: 'Delete Rating',
      message: 'Are you sure you want to delete this rating? This action cannot be undone.',
      variant: 'danger',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel'
    });
    if (!confirmed) return;

    setDeletingRatings(prev => new Set(prev).add(ratingId));
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:8082/api/admin/ratings/${ratingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete rating');
      }

      setRatings(prev => prev.filter(r => r.id !== ratingId));
      await showAlert({ title: 'Success', message: 'Rating deleted successfully', variant: 'success' });
    } catch (error) {
      console.error('Error deleting rating:', error);
      await showAlert({ title: 'Error', message: error.message || 'Failed to delete rating', variant: 'danger' });
    } finally {
      setDeletingRatings(prev => {
        const newSet = new Set(prev);
        newSet.delete(ratingId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="admin-content">
        <div className="admin-header">
          <h2>Product Ratings</h2>
        </div>
        <p>Loading ratings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-content">
        <div className="admin-header">
          <h2>Product Ratings</h2>
        </div>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <Button variant="primary" onClick={fetchRatings}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h2>Product Ratings</h2>
      </div>

      <Table className="admin-table" striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Customer</th>
            <th>Rating</th>
            <th>Order ID</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ratings.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>No ratings found.</td>
            </tr>
          ) : (
            ratings.map((rating) => (
              <tr key={rating.id}>
                <td>#{rating.id}</td>
                <td>{rating.product?.name || rating.product_name || 'N/A'}</td>
                <td>{rating.user?.name || rating.user_name || 'N/A'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StarRating rating={rating.rating} readonly size={16} />
                    <span>({rating.rating}/5)</span>
                  </div>
                </td>
                <td>#{rating.order_id || 'N/A'}</td>
                <td>{formatDate(rating.created_at || rating.createdAt)}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(rating.id)}
                    disabled={deletingRatings.has(rating.id)}
                  >
                    {deletingRatings.has(rating.id) ? 'Deleting...' : 'Delete'}
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default AdminRatings;

