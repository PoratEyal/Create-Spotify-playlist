// src/components/LoginSection/LoginSection.jsx
import React from "react";
import LoginButton from "../LoginButton/LoginButton";
import styles from "./LoginSection.module.css";

const LoginSection = ({ onLoginClick }) => {
  return (
    <div className={styles.container}>
      {/* Big neon-glow title with emojis */}
      <h1 className={styles.title}>
        Welcome to <span className={styles.highlight}>Musicify</span> 🚀
      </h1>

      {/* Funky subtitle with accent text and an emoji */}
      <p className={styles.subtitle}>
        <span>Create your AI-powered playlists </span>
        <span className={styles.colorAccent}> faster than ever ⚡</span>
      </p>

      <div className={styles.buttonWrapper}>
        <LoginButton onClick={onLoginClick} />
      </div>
    </div>
  );
};

export default LoginSection;
