import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const getApiUrl = () => {
        const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        return url.endsWith('/api') ? url : `${url}/api`;
    };

    const API_URL = getApiUrl();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (googleResponse) => {
        try {
            const res = await axios.post(`${API_URL}/auth/google`, {
                tokenId: googleResponse.credential
            });

            const { token, ...userData } = res.data;

            setToken(token);
            setUser(userData);

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            // Sync Local Bookmarks
            syncBookmarks(token);

            toast.success(`Welcome back, ${userData.name}!`);
        } catch (error) {
            console.error('Login Failed:', error);
            toast.error('Login failed. Please try again.');
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
    };

    const syncBookmarks = async (authToken) => {
        try {
            const localBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
            if (localBookmarks.length === 0) return;

            await axios.post(
                `${API_URL}/bookmarks/sync`,
                { bookmarks: localBookmarks },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );

            // Optional: Clear local bookmarks after sync or keep them as backup?
            // For now, let's keep them but maybe we should rely on backend source of truth.
        } catch (error) {
            console.error('Bookmark Sync Error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                {children}
            </GoogleOAuthProvider>
        </AuthContext.Provider>
    );
};
