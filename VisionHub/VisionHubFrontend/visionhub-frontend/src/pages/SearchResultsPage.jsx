import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { artworkService, userService } from '../services/apiService';
import ArtworkCard from '../components/ArtworkCard';
import UserCard from '../components/UserCard';

const SearchResultsPage = () => {
    const [searchResults, setSearchResults] = useState({ artworks: [], users: [] });
    const [relevantResults, setRelevantResults] = useState({ artworks: [], users: [] });
    const [loading, setLoading] = useState(true);
    const query = new URLSearchParams(useLocation().search).get('query');

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                setLoading(true);
                const allArtworks = await artworkService.getAllArtworks();
                const allUsers = await userService.getAllUsers();

                const lowerCaseQuery = query.toLowerCase();

                const directArtworks = allArtworks.filter((artwork) =>
                    artwork.title.toLowerCase().includes(lowerCaseQuery) ||
                    artwork.description.toLowerCase().includes(lowerCaseQuery) ||
                    (artwork.category?.toLowerCase() || '').includes(lowerCaseQuery)
                );

                const relevantArtworks = allArtworks.filter(
                    (artwork) =>
                        !directArtworks.includes(artwork) &&
                        (artwork.title.toLowerCase().includes(lowerCaseQuery) ||
                            artwork.description.toLowerCase().includes(lowerCaseQuery))
                );

                const directUsers = allUsers.filter((user) =>
                    user.username.toLowerCase().includes(lowerCaseQuery) ||
                    user.email.toLowerCase().includes(lowerCaseQuery) ||
                    (user.name?.toLowerCase() || '').includes(lowerCaseQuery)
                );

                const relevantUsers = allUsers.filter(
                    (user) =>
                        !directUsers.includes(user) &&
                        (user.username.toLowerCase().includes(lowerCaseQuery) ||
                            user.email.toLowerCase().includes(lowerCaseQuery))
                );

                setSearchResults({ artworks: directArtworks, users: directUsers });
                setRelevantResults({ artworks: relevantArtworks, users: relevantUsers });
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [query]);

    return (
        <div className="search-results-page">
            

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div>
                    <h2>Search Results for: {query}</h2>

                    <section>
                        <h3>Direct Matches</h3>
                        <div className="direct-matches">
                            <h4>Artworks</h4>
                            {searchResults.artworks.length > 0 ? (
                                searchResults.artworks.map((artwork) => (
                                    <ArtworkCard key={artwork.id} artwork={artwork} />
                                ))
                            ) : (
                                <p>No direct matches found for artworks.</p>
                            )}

                            <h4>Users</h4>
                            {searchResults.users.length > 0 ? (
                                searchResults.users.map((user) => (
                                    <UserCard key={user.id} user={user} />
                                ))
                            ) : (
                                <p>No direct matches found for users.</p>
                            )}
                        </div>
                    </section>

                    <section>
                        <h3>Relevant Results</h3>
                        <div className="relevant-results">
                            <h4>Artworks</h4>
                            {relevantResults.artworks.length > 0 ? (
                                relevantResults.artworks.map((artwork) => (
                                    <ArtworkCard key={artwork.id} artwork={artwork} />
                                ))
                            ) : (
                                <p>No relevant results found for artworks.</p>
                            )}

                            <h4>Users</h4>
                            {relevantResults.users.length > 0 ? (
                                relevantResults.users.map((user) => (
                                    <UserCard key={user.id} user={user} />
                                ))
                            ) : (
                                <p>No relevant results found for users.</p>
                            )}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

export default SearchResultsPage;
