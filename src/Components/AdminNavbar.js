import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { FaSignOutAlt } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './AdminNavbar.module.css';
import AuthContext from '../contexts/AuthContext';
import UserContext from '../contexts/UserContext';

function AdminNavbar() {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const { user } = useContext(UserContext);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/admin/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <Navbar className={styles.navbar}>
            <Container>
                <Navbar.Brand className={styles.title} href="/admin">
                    Essentico    
                </Navbar.Brand>

                <Nav className={`${styles.logoutContainer} ms-auto`}>
                    {user && (
                        <span className={styles.adminName}>
                            {user.name || 'Admin'}
                        </span>
                    )}
                    <button 
                        className={styles.logoutBtn}
                        onClick={handleLogout}
                        title="Logout"
                    >
                        <FaSignOutAlt className={styles.logoutIcon} />
                        <span className={styles.logoutText}>Logout</span>
                    </button>
                </Nav>
            </Container>
        </Navbar>
    );
}

export default AdminNavbar;

