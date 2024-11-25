import React from 'react';

const UserStats = ({ stats }) => {
  return (
    <div className="user-stats">
      <div>
        <h3>{stats.artworksCount}</h3>
        <p>Artworks</p>
      </div>
      <div>
        <h3>{stats.followersCount}</h3>
        <p>Followers</p>
      </div>
    </div>
  );
};

export default UserStats;
