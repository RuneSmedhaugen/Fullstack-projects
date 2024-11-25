import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginDropDown.css';

const LoginDropDown = ({ closeModal, handleLogin, isDarkMode }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    closeModal();
    navigate('/register');
  };

  const handleLoginClick = async () => {
    try {
      await handleLogin(username, password);
      closeModal();
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className={`dropdown-window ${isDarkMode ? 'dark-mode' : ''}`}>
      <button className="close-login" onClick={closeModal}>
        X
      </button>
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="button" onClick={handleLoginClick}>
          Login
        </button>
        <button
          type="button"
          onClick={handleRegisterClick}
          className="register-link"
        >
          Don't have an account? Register here.
        </button>
      </form>
    </div>
  );
};

export default LoginDropDown;
