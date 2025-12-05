import React, { useState, useEffect } from "react";
import { Button, Table } from "react-bootstrap";
import "./Customer.css";

function Customer() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8082/api/users")
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setLoading(false);
      });
  }, []);

  const handleAddCustomer = () => {
    alert("Redirecting to New Customer Creation Form...");
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <h2>Customer List</h2>
        <Button onClick={handleAddCustomer} style={{ backgroundColor: "#4CAF50", border: "none" }}>
          + Add Customer
        </Button>
      </div>

      {loading ? (
        <p>Loading customers...</p>
      ) : (
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Total Orders</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>#{c.id}</td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone || "-"}</td>
                <td>{c.orders ? c.orders.length : 0}</td>
                <td>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: "5px",
                      backgroundColor: "#d1ffd6",
                      color: "#2e7d32",
                      fontWeight: "bold",
                    }}
                  >
                    {c.status || "Active"}
                  </span>
                </td>
                <td>
                  <span style={{ marginRight: "5px", cursor: "pointer" }}>👁️</span>
                  <span style={{ marginRight: "5px", cursor: "pointer" }}>✏️</span>
                  <span style={{ cursor: "pointer", color: "red" }}>🗑️</span>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

export default Customer;
