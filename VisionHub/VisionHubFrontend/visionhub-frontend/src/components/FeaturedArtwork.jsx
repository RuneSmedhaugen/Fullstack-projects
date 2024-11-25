import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FeaturedArtworks = () => {
    const [artworks, setArtworks] = useState([]);

    useEffect(() => {
        const fetchArtworks = async () => {
            try {
                const response = await axios.get('https://localhost:7213/api/artworks/featured');
                setArtworks(response.data);
            } catch (error) {
                console.error('Error fetching artworks:', error);
            }
        };

        fetchArtworks();
    }, []);

    return (
        <div className="featured-artworks-container">
            {artworks.map((artwork) => (
                <div className="artwork-card" key={artwork.id}>
                    <div className="artwork-image-wrapper">
                        <img src={artwork.imageUrl} alt={artwork.name} className="artwork-image" />
                        <div className="artwork-name-overlay">{artwork.name}</div>
                    </div>
                    <p className="artwork-description">{artwork.description}</p>
                </div>
            ))}
        </div>
    );
};

export default FeaturedArtworks;
