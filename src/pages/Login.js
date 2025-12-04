import React, { useState, useContext } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const { login, isLoggingIn } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }
    
    try {
      await login(username, password);
      navigate("/products");
    } catch (error) {
      setErrorMsg(error.message);
    }

    setErrorMsg("");

  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <h3 className="login-title">User Login</h3>

        {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>
              <FaUser className="icon" /> Username
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
          <div className="mt-3 text-center">
            <span className="text-muted">Don't have an account? </span>
            <Link to="/register" className="register-link">Register</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default Login;
