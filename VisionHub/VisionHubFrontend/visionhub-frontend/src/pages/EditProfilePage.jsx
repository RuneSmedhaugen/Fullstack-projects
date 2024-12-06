import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/AuthContext';
import { userService } from '../services/apiService';

const EditProfilePage = () => {
    const { currentUser, login } = useAuth();
    const [formData, setFormData] = useState({
        name: currentUser.name || '',
        email: currentUser.email || '',
        biography: currentUser.biography || '',
        birthDate: currentUser.birthDate || '',
    });
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        setFormData({
            name: currentUser.name || '',
            email: currentUser.email || '',
            biography: currentUser.biography || '',
            birthDate: currentUser.birthDate || '',
        });
    }, [currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("current user: ", currentUser);
    
        
        const updateData = {
            userID: currentUser.userId,  
            name: currentUser.name,       
            email: currentUser.email,     
            biography: currentUser.biography, 
            birthDate: currentUser.birthDate, 
        };
    
       
        if (formData.name && formData.name !== currentUser.name) {
            updateData.name = formData.name;
        }
    
        if (formData.email && formData.email !== currentUser.email) {
            updateData.email = formData.email;
        }
    
        if (formData.biography && formData.biography !== currentUser.biography) {
            updateData.biography = formData.biography;
        }
    
        if (formData.birthDate && formData.birthDate !== currentUser.birthDate) {
            updateData.birthDate = formData.birthDate;
        }
    
       
        console.log("updatedata: ", updateData); 
    
        try {
            await userService.updateUser(updateData);
            
            login({ ...currentUser, ...updateData });
            setFeedback('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error.response?.data || error.message);
            setFeedback('Failed to update profile. Please try again.');
        }
    };
    
    
    

    return (
        <div className="edit-profile-page">
            <h1>Edit Profile</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                    />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                    />
                </div>
                <div className="form-group">
                    <label>Biography:</label>
                    <textarea
                        name="biography"
                        value={formData.biography}
                        onChange={handleChange}
                        placeholder="Tell us about yourself"
                    />
                </div>
                <div className="form-group">
                    <label>Birthdate:</label>
                    <input
                        type="date"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">Save Changes</button>
            </form>
            {feedback && <p className="feedback">{feedback}</p>}
        </div>
    );
};

export default EditProfilePage;
