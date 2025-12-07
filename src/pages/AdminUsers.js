import React, { useState, useEffect } from "react";
import { Table } from "react-bootstrap";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import './AdminUsers.css';

function AdminUsers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8082/api/users")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }
        return res.json();
      })
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleAddCustomer = () => {
    alert("Redirecting to New Customer Creation Form...");
  };

  const handleView = (customerId) => {
    console.log('View customer:', customerId);
    // TODO: Implement view functionality
  };

  const handleEdit = (customerId) => {
    console.log('Edit customer:', customerId);
    // TODO: Implement edit functionality
  };

  const handleDelete = (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      console.log('Delete customer:', customerId);
      // TODO: Implement delete functionality
    }
  };

  if (loading) return <div className="admin-content"><p>Loading customers...</p></div>;
  if (error) return <div className="admin-content"><p>Error: {error}</p></div>;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h2>Users/Accounts</h2>
        <button className="btn-primary btn-add-new" onClick={handleAddCustomer}>
          + Add Customer
        </button>
      </div>

      {customers.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <div className="table-card-wrapper">
          <Table className="admin-table" striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Total Orders</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>#{customer.id}</td>
                  <td>{customer.name || "-"}</td>
                  <td>{customer.email || "-"}</td>
                  <td>{customer.phone || "-"}</td>
                  <td>{customer.orders ? customer.orders.length : 0}</td>
                  <td>
                    <span className={`role-badge ${customer.role === 'admin' ? 'role-admin' : 'role-customer'}`}>
                      {customer.role || "Customer"}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button 
                      className="icon-btn action-view" 
                      title="View"
                      onClick={() => handleView(customer.id)}
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="icon-btn action-edit" 
                      title="Edit"
                      onClick={() => handleEdit(customer.id)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="icon-btn action-delete" 
                      title="Delete"
                      onClick={() => handleDelete(customer.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;

