import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Container, Nav, Form, Button, } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './Navbar.module.css';

function NavBar(){
    const [menuOpen, setMenuOpen] = useState(false);
    return(
        
        <Navbar className={styles.navbar}>
                <Container>
                  <Navbar.Brand className={styles.title} href="/">Essentico</Navbar.Brand>
        
                  <div className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
                    <i className={`fa-solid ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                  </div>
        
                  <div className={`${styles.navlinksContainer} ${menuOpen ? styles.showMenu : ''} ms-auto`}>
                    <Nav className={styles.navlinks}>
                      <Nav.Link as={Link} to="/">Home</Nav.Link>
                      <Nav.Link as={Link} to="/products">Products</Nav.Link>
                      <Nav.Link as={Link} to="">About</Nav.Link>
                    </Nav>
        
                    <Nav className={styles.cartProfileContainer}>
                      <Nav.Link as={Link} to="/cart" className={styles.cartText}>
                        Cart
                      </Nav.Link>
                      <Nav.Link as={Link} to="" className={styles.profileText}>
                        Profile
                      </Nav.Link>
                    </Nav>
                  </div>
        
                  <Nav className={`${styles.cartProfileIcons}`}>
                    <Nav.Link as={Link} to="/cart" className={styles.cartbtn}>
                      <i className={`fa-solid fa-basket-shopping`} />
                    </Nav.Link>
                    <Nav.Link as={Link} to="" className={styles.profilebtn}>
                      <i className={`fa-regular fa-user ${styles.profileico}`} />
                    </Nav.Link>
                  </Nav>
                </Container>
              </Navbar>
    );

}
export default NavBar;