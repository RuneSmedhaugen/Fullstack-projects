import React, { useState, useEffect } from 'react';
import CommentSection from './CommentSection.jsx';
import { commentService } from '../services/apiService.js';
import { useAuth } from '../services/AuthContext.js';

const ArtworkModal = ({ artwork, closeModal, isDarkMode }) => {
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const {currentUser} = useAuth();

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const commentsData = await commentService.getCommentsByArtwork(artwork.id);
                console.log('Fetched comments:', commentsData);
                setComments(commentsData);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        fetchComments();
    }, [artwork.id]);

    const handleCommentSubmit = async () => {
        if (!commentText.trim()) {
            console.warn("Comment text is empty");
            return; 
        }
    
        if (!currentUser) {
            console.warn('No user is logged in. Cannot submit comment.');
            return;
        }
    
        const commentData = {
            artworkID: artwork.id,
            userID: currentUser.userId, 
            commentText: commentText,
            commentDate: new Date().toISOString(),
            username: currentUser.username,
        };
    
        try {
            console.log("commentdata: ", commentData)
            const result = await commentService.addComment(commentData);
            console.log('Comment submitted:', result);
    
            
            setComments((prevComments) => [
                ...prevComments,
                { 
                    id: result.id,
                    username: currentUser.username,
                    commentText: commentText,
                    commentDate: commentData.commentDate,
                },
            ]);
    
            setCommentText(''); 
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    };
    
    

    return (
        <div className={`artwork-modal ${isDarkMode ? 'dark-mode' : ''}`} onClick={closeModal}>
            <div className={`modal-content ${isDarkMode ? 'dark-mode' : ''}`} onClick={(e) => e.stopPropagation()}>
                <button className={`close-modal ${isDarkMode ? 'dark-mode' : ''}`} onClick={closeModal}>
                    X
                </button>
                <h2 className="artwork-modal-title">{artwork.title}</h2>
                <img src={`https://localhost:7213/${artwork.imagePath}`} alt={artwork.title} className="artwork-modal-image" />
                <p>{artwork.description}</p>
                <CommentSection
                    comments={comments}
                    commentText={commentText}
                    setCommentText={setCommentText}
                    handleCommentSubmit={handleCommentSubmit}
                    isDarkMode={isDarkMode}
                />
            </div>
        </div>
    );
};

export default ArtworkModal;
