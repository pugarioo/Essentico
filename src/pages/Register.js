import React, { useState, useContext } from "react";
import { Form, Button, Card, Alert, Row, Col } from "react-bootstrap";
import { FaUser, FaLock, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import "./Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Validate required fields
    if (!name || !email || !password) {
      setErrorMsg("Please fill in all required fields (name, email, password).");
      return;
    }

    // Password length validation (backend requires min 8)
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsRegistering(true);

    try {
      // Build request body - only include fields with values (like Postman)
      const requestBody = {
        name: name.trim(),
        email: email.trim(),
        password: password
      };

      // Only add phone/address if they have actual values (not empty strings)
      if (phone && phone.trim().length > 0) {
        requestBody.phone = phone.trim();
      }
      if (address && address.trim().length > 0) {
        requestBody.address = address.trim();
      }

      console.log('Registration request body:', requestBody);

      const response = await fetch('http://localhost:8082/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      // Check if response is successful (201 Created or 200 OK)
      if (response.status === 201 || response.status === 200) {
        const responseData = await response.json().catch(() => null);
        console.log('Registration response:', responseData);

        if (responseData && responseData.id) {
          // Registration successful - user was created
          console.log('User created successfully, ID:', responseData.id);
          
          // Auto-login after successful registration
          try {
            await login(email.trim(), password);
            navigate("/products");
          } catch (loginError) {
            console.error('Auto-login error:', loginError);
            // If auto-login fails, redirect to login page
            setErrorMsg("Registration successful! Please login with your credentials.");
            setTimeout(() => {
              navigate("/login");
            }, 2000);
          }
        } else {
          // Response OK but no user data - something went wrong
          setErrorMsg('Registration response was invalid. Please try again.');
        }
      } else {
        // Registration failed - get error details
        const errorData = await response.json().catch(() => ({}));
        console.error('Registration failed:', errorData);
        
        if (errorData.errors) {
          // Handle Laravel validation errors
          const errorMessages = Object.values(errorData.errors)
            .flat()
            .map(err => Array.isArray(err) ? err.join(', ') : err)
            .join(', ');
          setErrorMsg(errorMessages);
        } else if (errorData.message) {
          setErrorMsg(errorData.message);
        } else {
          setErrorMsg(`Registration failed with status ${response.status}. Please try again.`);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMsg(error.message || 'An error occurred. Please check your connection and try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <h3 className="login-title">User Registration</h3>

        {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaUser className="icon" /> Name <span className="required">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  <FaEnvelope className="icon" /> Email <span className="required">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  <FaLock className="icon" /> Password <span className="required">*</span>
                </Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password (min 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaPhone className="icon" /> Phone
                </Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="Enter phone number (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  <FaMapMarkerAlt className="icon" /> Address
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter address (optional)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Button
            variant="primary"
            className="login-btn"
            type="submit"
            disabled={isRegistering}
          >
            {isRegistering ? "Registering..." : "Register"}
          </Button>
          <div className="mt-3 text-center">
            <span className="text-muted">Already have an account? </span>
            <Link to="/login" className="register-link">Login</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default Register;
