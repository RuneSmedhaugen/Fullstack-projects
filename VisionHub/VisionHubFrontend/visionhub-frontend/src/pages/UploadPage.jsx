import React, { useState, useEffect } from 'react';
import { categoryService, artworkService } from '../services/apiService';

const UploadPage = () => {
    const [formData, setFormData] = useState({
        categoryId: '',
        categoryName: '', // To display the selected category name
        title: '',
        description: '',
        isFeatured: false,
        file: null,
    });

    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryService.getAllCategories();
                setCategories(data);
            } catch (error) {
                setError('Failed to load categories.');
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    const handleCategoryClick = (categoryId, categoryName) => {
        setFormData((prev) => ({
            ...prev,
            categoryId,
            categoryName, // Save the category name for display
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await artworkService.addArtwork(formData);
            setSuccessMessage('Artwork uploaded successfully!');
            setFormData({
                categoryId: '',
                categoryName: '',
                title: '',
                description: '',
                isFeatured: false,
                file: null,
            });
        } catch (error) {
            setError('Failed to upload artwork.');
            console.error('Error uploading artwork:', error);
        }
    };

    return (
        <div className="upload-page">
            <h2>Upload Artwork</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Title:</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label>Description:</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label>Categories:</label>
                    <ul className="categories">
                        {categories.map((category) => (
                            <li
                                key={category.id}
                                className="category-item"
                                onClick={() => handleCategoryClick(category.id, category.name)}
                            >
                                {category.name}
                            </li>
                        ))}
                    </ul>
                </div>

                {formData.categoryName && (
                    <p>
                        Selected Category: <strong>{formData.categoryName}</strong>
                    </p>
                )}
                
                <div className="form-group">
                    <label>File:</label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label>Feature this artwork?</label>
                    <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))
                        }
                    />
                </div>
                
                <button type="submit">Upload</button>
            </form>
        </div>
    );
};

export default UploadPage;
