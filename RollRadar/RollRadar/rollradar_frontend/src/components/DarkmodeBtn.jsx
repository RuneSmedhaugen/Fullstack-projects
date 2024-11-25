import React, { useState, useEffect } from "react";

const DarkModeBtn = ({ onClick }) => {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent event from propagating to parent (DropdownMenu)
    setDarkMode(!darkMode); // Toggle dark mode state
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 text-2xl transition-all"
      aria-label="Toggle Dark Mode"
    >
      {darkMode ? "🌙" : "☀️"}
    </button>
  );
};

export default DarkModeBtn;
