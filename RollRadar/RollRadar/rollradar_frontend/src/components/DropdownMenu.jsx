import { FaBars } from "react-icons/fa";
import React, { useState } from 'react';
import DarkModeBtn from './DarkmodeBtn';

const DropdownMenu = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = (e) => {
        e.stopPropagation(); // Prevent the event from propagating
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative">
            <button 
                onClick={toggleMenu} 
                className="text-white hover:text-blue-300 transition-colors duration-200 ease-in-out"
            >
                <FaBars size={24} />
            </button>
            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 shadow-lg rounded-lg p-2 z-10"
                    onClick={(e) => e.stopPropagation()} // Prevent clicking inside the dropdown from closing the menu
                >
                    <div className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors duration-200">
                        <DarkModeBtn />
                    </div>
                    <div className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors duration-200">
                        Option 1
                    </div>
                    <div className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors duration-200">
                        Option 2
                    </div>
                    <div className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors duration-200">
                        Option 3
                    </div>
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;
