import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../img/visionhub_logo.png';
import SearchField from './CombinedSearchField.jsx';
import { useAuth } from '../services/AuthContext';
import '../styles/main.css';

const TopBanner = ({ openLoginDropdown, isDarkMode, setIsDarkMode }) => {
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('isDarkMode', newDarkMode);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`top-banner ${isDarkMode ? 'dark' : ''}`}>
      <Link to="/" className="logo">
        <img src={logo} alt="VisionHub Logo" className="logo-image" />
      </Link>
      <div className="search-section">
        <SearchField />
      </div>
      <div className="auth-section">
        {currentUser ? (
          <div className="options-dropdown">
            <Link to={`/profile/${currentUser.userId}`} className="profile-button">Profile</Link>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <button className="login-button" onClick={openLoginDropdown}>Log in</button>
        )}
        <button className="dark-mode-toggle" onClick={toggleDarkMode}>
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </div>
  );
};

export default TopBanner;
