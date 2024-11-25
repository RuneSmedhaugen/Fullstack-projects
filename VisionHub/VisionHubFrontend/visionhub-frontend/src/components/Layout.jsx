import React, { useState, useEffect } from 'react';
import { artworkService, commentService, userService } from '../services/apiService';
import TopBanner from './TopBanner.jsx';
import CategoryList from './CategoryList.jsx';
import ArtworkList from './ArtworkList.jsx';
import ArtworkModal from './ArtworkModal.jsx';

const Layout = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [artworks, setArtworks] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [error, setError] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const fetchFeaturedArtworks = async () => {
        try {
            const data = await artworkService.getFeaturedArtworks();
            setArtworks(data);
            setError('');
        } catch (error) {
            setArtworks([]);
            setError('Failed to load featured artworks.');
            console.error('Error fetching featured artworks:', error);
        }
    };

    useEffect(() => {
        fetchFeaturedArtworks();
    }, []);

    useEffect(() => {
        const fetchArtworks = async () => {
            if (selectedCategory) {
                try {
                    const data = await artworkService.getArtworksByCategory(selectedCategory);
                    setArtworks(data);
                    setError('');
                } catch (error) {
                    setArtworks([]);
                    setError('This category is empty.');
                    console.error('Error fetching artworks:', error);
                }
            }
        };

        fetchArtworks();
    }, [selectedCategory]);

    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId);
    };

    const toggleDarkMode = () => {
        setIsDarkMode((prev) => !prev);
    };

    const handleBackToHome = () => {
        setSelectedCategory(null);
        fetchFeaturedArtworks();
    };

    const handleArtworkClick = (artwork) => {
        setSelectedArtwork(artwork);
        fetchComments(artwork.id);
    };

    const closeArtworkModal = () => {
        setSelectedArtwork(null);
        setComments([]);
    };

    const fetchComments = async (artworkId) => {
        try {
            const data = await commentService.getCommentsByArtwork(artworkId);
            const commentsWithUsernames = await Promise.all(
                data.map(async (comment) => {
                    const username = await userService.getUser(comment.userID);
                    return {
                        ...comment,
                        username,
                    };
                })
            );
            setComments(commentsWithUsernames);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    return (
        <div className={`layout ${isDarkMode ? 'dark-mode' : ''}`}>
            <TopBanner isLoggedIn={isLoggedIn} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
            <CategoryList onCategoryClick={handleCategoryClick} /> {/* Updated prop name */}
            {selectedCategory && (
                <button className="home-button" onClick={handleBackToHome}>
                    Back to Homepage
                </button>
            )}
            {error && <p>{error}</p>}
            <ArtworkList artworks={artworks} handleArtworkClick={handleArtworkClick} isDarkMode={isDarkMode} />

            {selectedArtwork && (
                <ArtworkModal
                    artwork={selectedArtwork}
                    comments={comments}
                    closeModal={closeArtworkModal}
                    handleCommentSubmit={() => commentService.addComment(selectedArtwork.id, commentText)}
                    commentText={commentText}
                    setCommentText={setCommentText}
                    isDarkMode={isDarkMode}
                />
            )}
        </div>
    );
};

export default Layout;
