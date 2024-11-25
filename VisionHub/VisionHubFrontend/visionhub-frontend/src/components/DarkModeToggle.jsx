import React from 'react';

const DarkModeToggle = ({ isDarkMode, toggleDarkMode }) => {
    return (
        <button className='dark-mode-toggle' onClick={toggleDarkMode}>
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
    );
};

export default DarkModeToggle;
