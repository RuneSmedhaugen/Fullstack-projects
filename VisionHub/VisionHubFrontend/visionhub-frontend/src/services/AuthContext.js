import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    
    const [currentUser, setCurrentUser] = useState({
        userId: null,
        username: '',
        email: '',
        name: '',
        biography: '',
        birthDate: null,
        token: ''  
    });

    
    useEffect(() => {
        const userCookie = Cookies.get('currentUser');
        console.log('AuthContext: userCookie:', userCookie); 
        if (userCookie) {
            try {
                const user = JSON.parse(userCookie);
                console.log('AuthContext: Setting currentUser from cookie:', user);
                setCurrentUser({
                    userId: user.userId || null,
                    username: user.username || '',
                    email: user.email || '',
                    name: user.name || '',
                    biography: user.biography || '',
                    birthDate: user.birthDate || null,
                    token: user.token || ''
                });
            } catch (err) {
                console.error('AuthContext: Error parsing user cookie:', err);
                Cookies.remove('currentUser', { path: '/' });
                setCurrentUser(null); 
            }
        } else {
            
            setCurrentUser(null);
        }
    }, []);

    
    const login = (user) => {
        console.log('AuthContext: Logging in user:', user);
        
        Cookies.set('currentUser', JSON.stringify(user), { expires: 7, path: '/' });
        setCurrentUser(user);  
    };

const logout = () => {
    console.log('AuthContext: Logging out');
    Cookies.remove('currentUser', { path: '/' });
    setCurrentUser(null); 
    console.log('Current User after logout:', currentUser);
};


    
    const getToken = () => {
        return currentUser.token;
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, getToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
