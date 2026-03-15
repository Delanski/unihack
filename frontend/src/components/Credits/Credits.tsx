import { useState } from 'react';
import styles from './Credits.module.css';
import logo from '../../assets/icons/mainLogo.png';

export default function Credits() {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>

      <button className={styles.trigger} onClick={() => setOpen(!open)}>
        <img src={logo} alt="logo" className={styles.logo} />
      </button>

      {open === true && (
        <div className={styles.dropdown}>

          <div className={styles.header}>
            <span className={styles.title}>Made by</span>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>x</button>
          </div>

          <div className={styles.person}>
            <span className={styles.name}>rennie - art, frontend, backend</span>
            <span className={styles.role}>@rennichuus on instagram!</span>
          </div>

          <div className={styles.person}>
            <span className={styles.name}>ethan - art</span>
            <span className={styles.role}>@doodletyi on instagram</span>
          </div>

          <div className={styles.person}>
            <span className={styles.name}>amina - art</span>
            <span className={styles.role}>@ryuriian on instagram!</span>
          </div>

          <div className={styles.person}>
            <span className={styles.name}>syahida - writing & content</span>
            <span className={styles.role}>@shaiki.k on instagram!</span>
          </div>
            
          <div className={styles.person}>
            <span className={styles.name}>anabel - frontend, backend</span>
            <span className={styles.role}>@anxbelp on instagram!</span>
          </div>

            <div className={styles.person}>
            <span className={styles.name}> anastasia - backend</span>
            <span className={styles.role}>they are my goat</span>
          </div>
            
        </div>
      )}

    </div>
  );
}