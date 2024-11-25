import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchField = () => {
    const [query, setQuery] = useState('');
    const [showTalkBubble, setShowTalkBubble] = useState(false);
    const navigate = useNavigate();

    const handleSearch = () => {
        if (query.trim() === '') {
            setShowTalkBubble(true);
            setTimeout(() => setShowTalkBubble(false), 3000);
        } else {
            navigate(`/search?query=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="search-container">
            <div className="search-field" onClick={handleSearch}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search..."
                    className="search-input"
                />
            </div>
            {showTalkBubble && (
                <div className="talk-bubble">
                    <span>Click me to search after your input</span>
                </div>
            )}
        </div>
    );
};

export default SearchField;
