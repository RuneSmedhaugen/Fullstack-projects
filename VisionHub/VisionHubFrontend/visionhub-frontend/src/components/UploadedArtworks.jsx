import React from 'react';

const UploadedArtworks = ({ artworks }) => {
  return (
    <div className="uploaded-artworks">
      {artworks.length > 0 ? (
        <div className="artwork-grid">
          {artworks.map(art => (
            <div key={art.id} className="artwork-item">
              <img src={art.imageUrl} alt={art.title} />
              <h3>{art.title}</h3>
            </div>
          ))}
        </div>
      ) : (
        <p>No artworks uploaded yet.</p>
      )}
    </div>
  );
};

export default UploadedArtworks;
