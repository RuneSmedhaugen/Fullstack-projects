import React from 'react';
import { Link } from 'react-router-dom';

const EditProfileDropdown = () => {
    return (
        <div className="edit-profile-dropdown">
            <h4>Edit Your Profile</h4>
            <ul>
                <li>
                    <Link to="/edit-user-info">Edit User Info</Link>
                </li>
                <li>
                    <Link to="/change-password">Change Password</Link>
                </li>
                <li>
                    <Link to="/delete-profile">Delete Profile</Link>
                </li>
            </ul>
        </div>
    );
};

export default EditProfileDropdown;
