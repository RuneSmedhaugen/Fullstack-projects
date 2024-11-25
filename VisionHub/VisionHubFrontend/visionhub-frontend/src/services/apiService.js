import axios from 'axios';

const API_BASE_URL = 'https://localhost:7213/api';

// Function to handle any GET request
const get = async (endpoint) => {
    try {
        const response = await axios.get(`${API_BASE_URL}${endpoint}`);
        return response.data;
    } catch (error) {
        console.error('Error in GET request:', error);
        throw error;
    }
};

// Function to handle any POST request
const post = async (endpoint, data, isFormData = false) => {
    try {
        const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
        const response = await axios.post(`${API_BASE_URL}${endpoint}`, data, config);
        return response.data;
    } catch (error) {
        console.error('Error in POST request:', error);
        throw error;
    }
};

// Function to handle any PUT request
const put = async (endpoint, data, isFormData = false) => {
    try {
        const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
        const response = await axios.put(`${API_BASE_URL}${endpoint}`, data, config);
        return response.data;
    } catch (error) {
        console.error('Error in PUT request:', error);
        throw error;
    }
};

// Function to handle any DELETE request
const remove = async (endpoint) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}${endpoint}`);
        return response.data;
    } catch (error) {
        console.error('Error in DELETE request:', error);
        throw error;
    }
};

// Users API
export const userService = {
    registerUser: (userData) => post('/user/register', userData),
    updateUser: (userData) => put('/user/update', userData),

    // login logic
    login: async (loginData) => {
        try {
            const response = await post('/user/login', loginData);
    
            if (!response || typeof response.token !== 'string' || typeof response.userId !== 'number' || typeof response.username !== 'string') {
                console.error('Invalid response format:', response);
                throw new Error('Invalid login response format.');
            }
    
            const user = {
                userId: response.userId,
                username: response.username,
                token: response.token,
            };
    
            return user;
        } catch (error) {
            console.error('Login failed:', error.message || error);
            throw error;
        }
    },
    
    deleteUser: (userId) => remove(`/user/${userId}`),
    getUser: (userId) => get(`/user/${userId}`),
    getAllUsers: () => get('/user/all'),
};


// Comments API
export const commentService = {
    addComment: (commentData) => post('/comment/add', commentData),
    getAllComments: () => get('/comment/all'),
    getCommentsByArtwork: (artworkId) => get(`/comment/artwork/${artworkId}`),
    getCommentsByUser: (userId) => get(`/comment/user/${userId}`),
    updateComment: (commentId, commentData) => put(`/comment/update/${commentId}`, commentData),
    deleteComment: (commentId) => remove(`/comment/delete/${commentId}`),
};

// Artworks API
export const artworkService = {
    addArtwork: (artworkData) => {
        const formData = new FormData();
        formData.append("userID", artworkData.userID);
        formData.append("categoryId", artworkData.categoryId);
        formData.append("title", artworkData.title);
        formData.append("description", artworkData.description);
        formData.append("isFeatured", artworkData.isFeatured);
        if (artworkData.file) {
            formData.append("file", artworkData.file);
        }
        return post('/artwork/add', formData, true);
    },
    getArtworksByUser: (userId) => get(`/Artwork/user/${userId}`),
    getArtwork: (artworkId) => get(`/artwork/${artworkId}`),
    getAllArtworks: () => get('/artwork'),
    updateArtwork: (artworkId, artworkData) => {
        const formData = new FormData();
        formData.append("title", artworkData.title);
        formData.append("description", artworkData.description);
        if (artworkData.file) {
            formData.append("file", artworkData.file);
        }
        return put(`/artwork/update/${artworkId}`, formData, true);
    },

    deleteArtwork: (artworkId) => remove(`/artwork/delete/${artworkId}`),
    getArtworksByCategory: (categoryId) => get(`/artwork/category/${categoryId}`),
    getFeaturedArtworks: () => get(`/artwork/featured/`)
};

// Categories API
export const categoryService = {
    addCategory: (categoryData) => post('/category/add', categoryData),
    getCategory: (categoryId) => get(`/category/${categoryId}`),
    getAllCategories: () => get('/category'),
    updateCategory: (categoryId, categoryData) => put(`/category/update/${categoryId}`, categoryData),
    deleteCategory: (categoryId) => remove(`/category/delete/${categoryId}`),
};


// Search calls.. eller hva man skal kalle det
export const searchService = {
    search: async (query) => {
        try {
            const artworks = await get(`/artwork/search?query=${query}`);
            const users = await get(`/user/search?query=${query}`);
            return { artworks, users };
        } catch (error) {
            console.error('Error in search:', error);
            throw error;
        }
    }
};
