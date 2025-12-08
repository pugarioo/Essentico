import React, { useState, useContext, useEffect } from "react";
import { Form, Button, Card, Alert, Navbar, Container } from "react-bootstrap";
import { FaUser, FaLock } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import UserContext from "../contexts/UserContext";
import "./Login.css";
import "./AdminLogin.css";

export default function AdminLogin() {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { adminLogin, isLoggingIn } = useContext(AuthContext);
  const { user } = useContext(UserContext);

  // If logged in but not admin, show error
  useEffect(() => {
    if (user && user.role !== 'admin') {
      setError("Access denied. Admin privileges required.");
    }
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      await adminLogin(email, password);
      // Navigation will be handled by App.js routes when user state updates
    } catch (error) {
      setError(error.message || "Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="admin-login-wrapper">
      <Navbar className="admin-login-navbar">
        <Container>
          <Navbar.Brand className="admin-login-brand" href="/">
            Essentico
          </Navbar.Brand>
        </Container>
      </Navbar>
      <div className="login-container">
      <Card className="login-card">
        <h3 className="login-title">Admin Login</h3>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>
              <FaUser className="icon" /> Email
            </Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              <FaLock className="icon" /> Password
            </Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Button
            variant="primary"
            className="login-btn"
            type="submit"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Logging in..." : "Login"}
          </Button>
        </Form>
      </Card>
    </div>
    </div>
  );
}

