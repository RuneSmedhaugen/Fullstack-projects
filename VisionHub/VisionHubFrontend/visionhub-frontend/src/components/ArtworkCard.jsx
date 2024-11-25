import React from 'react';
import visionhubLogo from '../img/visionhub_logo.png';

const ArtworkCard = ({ artwork, onClick, isDarkMode }) => {
    const imageUrl = `https://localhost:7213/${artwork.imagePath}`;

    return (
        <div className={`artwork-card ${isDarkMode ? 'dark-mode' : ''}`} onClick={() => onClick(artwork)}>
            <div className="artwork-image-container">
                <img
                    className="artwork-image"
                    src={imageUrl}
                    alt={artwork.title}
                    onError={(e) => e.target.src = visionhubLogo}
                />
            </div>
            <div className="artwork-info">
                <h3 className={`artwork-title ${isDarkMode ? 'dark-mode' : ''}`}>{artwork.title}</h3>
                <p className={`artwork-description ${isDarkMode ? 'dark-mode' : ''}`}>{artwork.description}</p>
            </div>
        </div>
    );
};

export default ArtworkCard;
