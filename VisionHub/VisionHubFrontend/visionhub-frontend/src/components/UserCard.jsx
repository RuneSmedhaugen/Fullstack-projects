import React from 'react';

const UserCard = ({ user }) => {
    return (
        <div className="user-card bg-gray-800 text-white p-4 rounded-lg shadow-md mb-4">
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-sm text-gray-400">@{user.username}</p>
            <p className="text-sm">{user.email}</p>
            <div className="flex justify-end mt-2">
                <a href={`/profile/${user.id}`} className="text-blue-400 hover:text-blue-500">
                    View Profile
                </a>
            </div>
        </div>
    );
};

export default UserCard;
