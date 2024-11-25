import React, { useEffect, useState } from 'react';
import { categoryService } from '../services/apiService';

const CategoryList = ({ onCategoryClick }) => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');

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

    return (
        <div className="category-list">
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul className="categories">
                {categories.map((category) => (
                    <li
                        key={category.id}
                        className="category-item"
                        onClick={() => onCategoryClick(category.id)}
                    >
                        {category.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CategoryList;
