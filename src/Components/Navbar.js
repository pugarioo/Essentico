import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Container, Nav, Button } from 'react-bootstrap'; // ✅ Button included here
import { FaSignInAlt } from "react-icons/fa"; // ✅ correct icon for Login
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './Navbar.module.css';

function NavBar(){
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate(); // ✅ navigation hook

    // ✅ Login redirect function
    const goToLogin = () => {
        setMenuOpen(false);
        navigate("/login"); // ✅ redirects to Login.js page
    };

    return(
        <Navbar className={styles.navbar}>
            <Container>
                <Navbar.Brand className={styles.title} href="/">Essentico</Navbar.Brand>

                <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
                    <i className={`fa-solid ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </button>

                <div className={`${styles.navlinksContainer} ${menuOpen ? styles.showMenu : ''} ms-auto`}>
                    <button className={styles.closeButton} onClick={() => setMenuOpen(false)}>
                        <i className="fa-solid fa-times"></i>
                    </button>

                    <Nav className={styles.navlinks}>
                        <Nav.Link as={Link} to="/" onClick={() => setMenuOpen(false)}>Home</Nav.Link>
                        <Nav.Link as={Link} to="/products" onClick={() => setMenuOpen(false)}>Products</Nav.Link>
                        <Nav.Link as={Link} to="" onClick={() => setMenuOpen(false)}>About</Nav.Link>
                    </Nav>

                    <Nav className={styles.cartProfileContainer}>
                        <Nav.Link as={Link} to="/cart" className={styles.cartText} onClick={() => setMenuOpen(false)}>
                            Cart
                        </Nav.Link>
                        <Nav.Link as={Link} to="/accounts" className={styles.profileText} onClick={() => setMenuOpen(false)}>
                            Profile
                        </Nav.Link>
                    </Nav>
                </div>

                {/* ✅ LOGIN BUTTON ADDED HERE BESIDE PROFILE ICON (minimal add, structure preserved) */}
                <Nav className={`${styles.cartProfileIcons}`}>
                    <Nav.Link as={Link} to="/cart" className={styles.cartbtn}>
                        <i className={`fa-solid fa-basket-shopping`} />
                    </Nav.Link>

                    <Nav.Link as={Link} to="/accounts" className={styles.profilebtn}>
                        <i className={`fa-regular fa-user ${styles.profileico}`} />
                    </Nav.Link>

                    {/* ✅ Login button placed beside Profile */}
                    <Button
                      variant="outline-light"
                      className="ms-2"
                      onClick={goToLogin}
                      style={{ fontSize: "15px", padding: "6px 14px", borderRadius: "8px" }}
                    >
                      <FaSignInAlt className="me-1"/> Login
                    </Button>

                </Nav>
            </Container>
        </Navbar>
    );
}

export default NavBar;
