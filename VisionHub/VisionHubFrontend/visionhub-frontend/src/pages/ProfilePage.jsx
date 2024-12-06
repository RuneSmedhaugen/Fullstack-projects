import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userService, artworkService } from "../services/apiService";
import { useAuth } from "../services/AuthContext";

const ProfilePage = ({ isDarkMode }) => {
    const { id: userId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [user, setUser] = useState(null);
    const [artworks, setArtworks] = useState([]);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const idToFetch = userId || currentUser?.userId;
                if (!idToFetch) {
                    setError("No userId available to fetch profile.");
                    return;
                }
                setIsOwnProfile(currentUser?.userId === parseInt(idToFetch, 10));

                const userData = await userService.getUser(idToFetch);
                setUser(userData);

                const userArtworks = await artworkService.getArtworksByUser(idToFetch);
                setArtworks(userArtworks || []);
                setError("");
            } catch (profileError) {
                setError("Failed to load profile.");
                console.error("Error fetching profile:", profileError);
            }
        };

        fetchProfile();
    }, [userId, currentUser]);

    const handleDeleteArtwork = async (artworkId) => {
        if (window.confirm("Are you sure you want to delete this artwork?")) {
            try {
                await artworkService.deleteArtwork(artworkId);
                setArtworks(artworks.filter((artwork) => artwork.id !== artworkId));
            } catch (error) {
                console.error("Error deleting artwork:", error);
                alert("Failed to delete the artwork.");
            }
        }
    };

    return (
        <div className={`profile-page ${isDarkMode ? "dark-mode" : ""}`}>
            {error ? (
                <p className="error-message">{error}</p>
            ) : (
                <>
                    {user && (
                        <section className="profile-header">
                            <div className="profile-details">
                                <h1>{user.name}</h1>
                                <p><strong>Username:</strong> {user.userName}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p>
                                    <strong>Biography:</strong> {user.biography || "No biography provided."}
                                </p>
                                <p>
                                    <strong>Birthdate:</strong> {user.birthdate ? new Date(user.birthdate).toLocaleDateString() : "Not provided"}
                                </p>
                            </div>
                        </section>
                    )}

                    {isOwnProfile && (
                        <div className="action-buttons">
                            <button onClick={() => navigate("/edit-profile")}>Edit Profile</button>
                            <button onClick={() => navigate("/upload")}>Upload Artwork</button>
                            <button onClick={() => navigate("/")}>Back to Home</button>
                        </div>
                    )}

                    <section className="artwork-section">
                        <h2>{isOwnProfile ? "My Artworks" : `${user?.userName || "User"}'s Artworks`}</h2>
                        <div className="artwork-list">
                            {artworks.length > 0 ? (
                                artworks.map((artwork) => (
                                    <div key={artwork.id} className="artwork-item">
                                        <div className="artwork-details">
                                            <h3>{artwork.title}</h3>
                                            <p>{artwork.description}</p>
                                        </div>
                                        {isOwnProfile && (
                                            <button
                                                className="delete-artwork-btn"
                                                onClick={() => handleDeleteArtwork(artwork.id)}
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>No artworks available.</p>
                            )}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default ProfilePage;
