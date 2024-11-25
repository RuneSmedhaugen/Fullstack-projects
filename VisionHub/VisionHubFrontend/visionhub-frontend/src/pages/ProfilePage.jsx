import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService, artworkService } from '../services/apiService';
import { useAuth } from '../services/AuthContext';
import ArtworkList from '../components/ArtworkList';

const ProfilePage = ({ isDarkMode }) => {
    const { id: userId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [user, setUser] = useState(null);
    const [artworks, setArtworks] = useState([]);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const idToFetch = userId || currentUser?.userId;

                if (!idToFetch) {
                    setError('No userId available to fetch profile.');
                    return;
                }
                console.log('Fetching profile for userId:', idToFetch);
                setIsOwnProfile(currentUser?.userId === parseInt(idToFetch, 10));

                // Fetch user data
                const userData = await userService.getUser(idToFetch);
                console.log('User data fetched:', userData);
                setUser(userData);

                // Fetch user's artworks
                try {
                    const userArtworks = await artworkService.getArtworksByUser(idToFetch);
                    console.log('Artworks fetched:', userArtworks);
                    setArtworks(userArtworks);
                } catch (artworkError) {
                    console.warn('No artworks found or error fetching artworks:', artworkError);
                    setArtworks([]); // Ensure artworks is empty, not undefined
                }

                setError('');
            } catch (profileError) {
                setError('Failed to load profile.');
                console.error('Error fetching profile:', profileError);
            }
        };

        fetchProfile();
    }, [userId, currentUser]);

    const handleEditProfile = () => {
        if (!currentUser) {
            navigate('/login');
        } else {
            navigate('/edit-profile');
        }
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleUpload = () => {
        navigate('/upload');
    };

    return (
        <div className={`profile-page ${isDarkMode ? 'dark-mode' : ''}`}>
            <section className="profile-header">
                {error ? (
                    <p className="error-message">{error}</p>
                ) : user ? (
                    <>
                        <div className="profile-details">
                            <h1>{user.name}</h1>
                            <p><strong>Username:</strong> {user.name}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Biography:</strong> {user.biography || 'No biography provided.'}</p>
                            <p><strong>Birthdate:</strong> {user.birthdate ? new Date(user.birthdate).toLocaleDateString() : 'Not provided'}</p>
                        </div>
                        {isOwnProfile && currentUser && (
                            <>
                                <button className="edit-profile-button" onClick={handleEditProfile}>
                                    Edit Profile
                                </button>
                                <button className="upload-button" onClick={handleUpload}>
                                    Upload Artwork
                                </button>
                            </>
                        )}
                    </>
                ) : (
                    <p>Loading profile...</p>
                )}
                <button className="back-to-home-button" onClick={handleBackToHome}>
                    Back to Home
                </button>
            </section>

            <section className="artwork-section">
                <h2>{isOwnProfile ? 'My Artworks' : `${user?.username || 'User'}'s Artworks`}</h2>
                {artworks.length > 0 ? (
                    <ArtworkList artworks={artworks} />
                ) : (
                    <p>No artworks available.</p>
                )}
            </section>
        </div>
    );
};

export default ProfilePage;
