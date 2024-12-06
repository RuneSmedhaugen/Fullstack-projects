import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { artworkService, categoryService } from '../services/apiService';

const UploadPage = () => {
    const [formData, setFormData] = useState({
        categoryId: '',
        title: '',
        description: '',
        isFeatured: false,
        file: null,
    });
    const [categories, setCategories] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    // Fetch categories from the database
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoryList = await categoryService.getAllCategories();
                setCategories(categoryList);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                setErrorMessage('Unable to load categories.');
            }
        };

        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData((prevState) => ({
            ...prevState,
            file,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const userID = localStorage.getItem('userId');
            await artworkService.addArtwork({ ...formData, userID });
            navigate('/');
        } catch (error) {
            setErrorMessage('Failed to upload artwork. Please try again.');
            console.error(error);
        }
    };

    return (
        <div className="upload-page">
            <div className="upload-form-container">
                <h1>Upload Your Artwork</h1>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <form onSubmit={handleSubmit} className="upload-form">
                    <div className="form-group">
                        <label htmlFor="categoryId">Category</label>
                        <select
                            id="categoryId"
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>
                                Select a category
                            </option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            required
                        />
                    </div>
                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="isFeatured"
                                checked={formData.isFeatured}
                                onChange={handleChange}
                            />
                            Mark as Featured
                        </label>
                    </div>
                    <div className="form-group">
                        <label htmlFor="file">Upload File</label>
                        <input
                            type="file"
                            id="file"
                            name="file"
                            onChange={handleFileChange}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-button">
                        Upload
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadPage;
