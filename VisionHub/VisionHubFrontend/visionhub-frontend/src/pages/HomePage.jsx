import React, { useEffect, useState } from 'react';
import { artworkService, commentService, userService } from '../services/apiService';
import CategoryList from '../components/CategoryList';
import ArtworkList from '../components/ArtworkList';
import ArtworkModal from '../components/ArtworkModal';

const HomePage = ({ isDarkMode }) => {
    const [artworks, setArtworks] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [error, setError] = useState('');
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleBackToHome = () => {
        setSelectedCategory(null);
        fetchFeaturedArtworks();
    };

    const handleArtworkClick = (artwork) => {
        setSelectedArtwork(artwork);
        fetchComments(artwork.id);
        setIsModalOpen(true);
    };

    const closeArtworkModal = () => {
        setSelectedArtwork(null);
        setComments([]);
        setIsModalOpen(false);
    };

    const fetchComments = async (artworkId) => {
        try {
            const data = await commentService.getCommentsByArtwork(artworkId);
            const commentsWithUsernames = await Promise.all(
                data.map(async (comment) => {
                    const user = await userService.getUser(comment.userID);
                    return {
                        ...comment,
                        username: user.username || 'Unknown User',
                    };
                })
            );
            setComments(commentsWithUsernames);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    return (
        <div className="home-page">
            <CategoryList onCategoryClick={handleCategoryClick} />

            {selectedCategory && (
                <button onClick={handleBackToHome}>Back to Home</button>
            )}

            {error && <p>{error}</p>}
            <ArtworkList artworks={artworks} handleArtworkClick={handleArtworkClick} />

            {isModalOpen && selectedArtwork && (
                <ArtworkModal
                    artwork={selectedArtwork}
                    comments={comments}
                    closeModal={closeArtworkModal}
                    handleCommentSubmit={() => commentService.addComment(selectedArtwork.id, commentText)}
                    commentText={commentText}
                    setCommentText={setCommentText}
                    isModalOpen={isModalOpen}
                />
            )}
        </div>
    );
};

export default HomePage;
