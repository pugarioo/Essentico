import React, { useState } from 'react';
import { Button, } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './Home.module.css';
import homebg from '../assets/images/pexels-pixabay-260046.jpg';

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.bg_img} style={{ backgroundImage: `url(${homebg})` }}></div>
      
      <div className={styles.content}>
        <p className={styles.maintitle}>Everything You Need All in One Place</p>
        <p className={styles.subtitle}>“Shop smarter and make life simpler.”</p>
        <Button className={styles.shopnowbtn}>Shop Now</Button>
      </div>
    </div>
  );
}

export default Home;