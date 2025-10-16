import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Container, Nav, Form, Button, } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './Home.module.css';

function NavBar(){
    const [menuOpen, setMenuOpen] = useState(false);
    return(
        
        <Navbar className={styles.navbar}>
                <Container>
                  <Navbar.Brand className={styles.title} href="#home">Essentico</Navbar.Brand>
        
                  <Form className={`ms-auto ${styles.search}`}>
                    <Form.Control
                      type="search"
                      className={styles.searchbar}
                      aria-label="Search"
                    ></Form.Control>
                    <Button type='submit' className={styles.searchbtn}>
                      <i className="fa-solid fa-magnifying-glass"></i>
                    </Button>
                  </Form>
        
                  <div className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
                    <i className={`fa-solid ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                  </div>
        
                  <div className={`${styles.navlinksContainer} ${menuOpen ? styles.showMenu : ''}`}>
                    <Nav className={styles.navlinks}>
                      <Nav.Link as={Link} to="/">Home</Nav.Link>
                      <Nav.Link as={Link} to="/products">Products</Nav.Link>
                      <Nav.Link as={Link} to="/about">About</Nav.Link>
                    </Nav>
        
                    <Nav className={styles.cartProfileContainer}>
                      <Nav.Link as={Link} to="/cart" className={styles.cartText}>
                        Cart
                      </Nav.Link>
                      <Nav.Link as={Link} to="/profile" className={styles.profileText}>
                        Profile
                      </Nav.Link>
                    </Nav>
                  </div>
        
                  <Nav className={`ms-auto ${styles.cartProfileIcons}`}>
                    <Nav.Link as={Link} to="/cart" className={styles.cartbtn}>
                      <i className={`fa-solid fa-basket-shopping`} />
                    </Nav.Link>
                    <Nav.Link as={Link} to="/profile" className={styles.profilebtn}>
                      <i className={`fa-regular fa-user ${styles.profileico}`} />
                    </Nav.Link>
                  </Nav>
                </Container>
              </Navbar>
    );

}
export default NavBar;