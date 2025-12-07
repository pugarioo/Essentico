import React, { useState, useEffect } from "react";
import { FaFolder, FaEdit, FaTrash } from "react-icons/fa";
import './AdminCategories.css';

// Format ISO date string to readable format
const formatDate = (isoString) => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="admin-content"><p>Loading categories...</p></div>;
  if (error) return <div className="admin-content"><p>Error: {error}</p></div>;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h2>Category List</h2>
        <button className="btn-primary btn-add-new">+ Add Category</button>
      </div>

      <div className="table-card-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category Name</th>
              <th>Product Count</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>
                    <FaFolder style={{ marginRight: "8px", color: "#767945" }} />
                    {category.category_name}
                  </td>
                  <td>{category.products_count}</td>
                  <td>{formatDate(category.created_at)}</td>
                  <td>{formatDate(category.updated_at)}</td>
                  <td className="action-buttons">
                    <button className="icon-btn action-edit" title="Edit">
                      <FaEdit />
                    </button>
                    <button className="icon-btn action-delete" title="Delete">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCategories;

