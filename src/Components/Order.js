import React, { useState, useEffect } from "react";
import { Button, Table } from "react-bootstrap";
import "./Order.css";

function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8082/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        setLoading(false);
      });
  }, []);

  const handleAddOrder = () => {
    alert("Redirecting to New Order Form...");
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <h2>Order List</h2>
        <Button onClick={handleAddOrder} style={{ backgroundColor: "hsla(142, 83%, 38%, 1.00)", border: "none" }}>
          + Add Order
        </Button>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Products</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.user?.name || "-"}</td>
                <td>
                  <ul>
                    {o.order_items?.map((item) => (
                      <li key={item.id}>{item.product?.name || "-"}</li>
                    ))}
                  </ul>
                </td>
                <td>
                  <ul>
                    {o.order_items?.map((item) => (
                      <li key={item.id}>{item.quantity}</li>
                    ))}
                  </ul>
                </td>
                <td>P {o.total_amount || 0}</td>
                <td>{new Date(o.ordered_at).toLocaleDateString() || "-"}</td>
                <td>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: "5px",
                      backgroundColor: "#ffe0b2",
                      color: "#e65100",
                      fontWeight: "bold",
                    }}
                  >
                    {o.status || "Pending"}
                  </span>
                </td>
                <td>
                  <span style={{ marginRight: "5px", cursor: "pointer" }}>👁️</span>
                  <span style={{ marginRight: "5px", cursor: "pointer" }}>📦</span>
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

export default Order;
