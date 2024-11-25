import { FaUserCircle, FaSearch } from "react-icons/fa"; // Import FaSearch
import DropdownMenu from "./DropdownMenu";
import Logo from "../image/RollRadarLogoMain.png";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TopBanner() {

  function SearchBar() {
    const [searchQuery, setSearchQuery] = useState(""); // Local state to store the search query
    const navigate = useNavigate(); // useNavigate hook for programmatic navigation

    const handleSearch = () => {
      if (searchQuery.trim()) {
        // Navigate to the SearchResultPage with the search query as a URL parameter
        navigate(`/search?q=${searchQuery}`);
      }
    };

    return (
      <div className="flex items-center justify-between p-4 shadow-md bg-gradient-to-r from-gray-800 via-gray-900 to-black transition-all duration-300 ease-in-out dark:bg-gray-800 dark:text-gray-100">
        {/* Logo (Clickable) */}
        <div className="flex items-center space-x-3 animate-fade-in">
          <a href="/" className="transition-transform duration-300 hover:scale-105">
            <img src={Logo} alt="RollRadar Logo" className="h-16 w-36" />
          </a>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-2 w-1/3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Update the search query state
            placeholder="Search..."
            className="w-full p-2 rounded-l-lg focus:outline-none bg-gray-700 text-white placeholder-gray-400 transition-colors duration-300 ease-in-out focus:bg-gray-600"
          />
          <button
            onClick={handleSearch} // Trigger the search on button click
            className="p-2 bg-gray-600 text-white rounded-r-lg hover:bg-gray-500 transition-transform duration-200 ease-in-out transform hover:scale-105 shadow-inner"
          >
            <FaSearch size={20} /> {/* Replace the button content with FaSearch icon */}
          </button>
        </div>

        {/* User Icon and Dropdown Menu */}
        <div className="flex items-center space-x-4 animate-fade-in">
          <button className="text-white hover:text-gray-400 transition-colors duration-200 ease-in-out">
            <FaUserCircle size={24} />
          </button>
          <DropdownMenu />
        </div>
      </div>
    );
  }

  return (
    <SearchBar />
  );
}
