// src/components/LoginSection/LoginSection.jsx
import React from "react";
import LoginButton from "../LoginButton/LoginButton";

const LoginSection = ({ onLoginClick }) => {
  return (
    <div>
      <LoginButton onClick={onLoginClick} />
    </div>
  );
};

export default LoginSection;
