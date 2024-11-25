import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import UploadArtwork from './pages/UploadPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import SearchResultsPage from './pages/SearchResultsPage';
import AuthProvider, { useAuth } from './services/AuthContext';
import TopBanner from './components/TopBanner';
import LoginDropDown from './components/LoginDropDown';
import { userService } from './services/apiService';

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('isDarkMode') === 'true'
  );

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  return (
    <AuthProvider>
      <Router>
        <MainApp isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      </Router>
    </AuthProvider>
  );
};

const MainApp = ({ isDarkMode, setIsDarkMode }) => {
  const { currentUser, login, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('MainApp: currentUser:', currentUser);
  }, [currentUser]);


  const handleProfile = () => {
    if (currentUser) {
      navigate(`/profile/${currentUser.userId}`);
    } else {
      console.error('User is not logged in');
    }
  };

  const handleLogin = async (username, password) => {
    try {
        const credentials = { username, password };
        const user = await userService.login(credentials);

        
        console.log('MainApp: Login successful, user:', user);

        
        login(user);

        
        setIsLoginOpen(false);
    } catch (error) {
        console.error('Login failed:', error.message || error);
    }
};



  return (
    <div className={isDarkMode ? 'app dark-mode' : 'app'}>
      <TopBanner
        handleProfile={handleProfile}
        isLoggedIn={!!currentUser}
        handleLogout={logout}
        openLoginDropdown={() => setIsLoginOpen(true)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
            />

      <Routes>
        <Route path="/" element={<HomePage isDarkMode={isDarkMode} />} />
        <Route path="/upload" element={<UploadArtwork isDarkMode={isDarkMode} />} />
        <Route path="/register" element={<RegisterPage isDarkMode={isDarkMode} />} />
        <Route path="/profile/:id" element={<ProfilePage isDarkMode={isDarkMode} />} />
        <Route path="/search" element={<SearchResultsPage isDarkMode={isDarkMode} />} />
      </Routes>

      {isLoginOpen && (
        <div className="dropdown-overlay">
          <LoginDropDown
            closeModal={() => setIsLoginOpen(false)}
            handleLogin={handleLogin}
            isDarkMode={isDarkMode}
          />
        </div>
      )}
    </div>
  );
};

export default App;
