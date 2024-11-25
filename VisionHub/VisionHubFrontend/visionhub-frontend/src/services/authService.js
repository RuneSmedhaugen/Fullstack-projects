import axios from 'axios';

const API_BASE_URL = 'https://localhost:7213/api';

export const authService = {

    login: async (username, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/user/login`, {
                username,
                password,
            });
            console.log('Full response data:', response.data);
            const { token, userId } = response.data;

            localStorage.setItem('authToken', token);
            localStorage.setItem('userId', userId);
            console.log("localstorage token: ", token);
            console.log("localstorage userid: ", userId)
            return response.data;
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    },

    isAuthenticated: () => {
        const token = localStorage.getItem('authToken');
        return !!token;
    },

    
    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
    },

    
    getToken: () => {
        return localStorage.getItem('authToken');
    },

    
    getUserId: () => {
        return localStorage.getItem('userId'); 
    }
};
