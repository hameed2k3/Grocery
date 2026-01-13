import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check for existing session on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const response = await authAPI.getMe();
                setUser(response.data.data.user);
            } catch (err) {
                // Token invalid or expired
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                setUser(null);
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const response = await authAPI.login({ email, password });
            const { user, accessToken, refreshToken } = response.data.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            setUser(user);

            return { success: true, user };
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    const register = async (name, email, password, phone = '') => {
        try {
            setError(null);
            const response = await authAPI.register({ name, email, password, phone });
            const { user, accessToken, refreshToken } = response.data.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            setUser(user);

            return { success: true, user };
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    const logout = useCallback(async () => {
        try {
            await authAPI.logout();
        } catch (err) {
            // Ignore logout errors
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
        }
    }, []);

    const updateProfile = async (data) => {
        try {
            setError(null);
            const response = await authAPI.updateProfile(data);
            setUser(response.data.data.user);
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Update failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    const addAddress = async (addressData) => {
        try {
            const response = await authAPI.addAddress(addressData);
            setUser(prev => ({
                ...prev,
                addresses: response.data.data.addresses,
            }));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || 'Failed to add address' };
        }
    };

    const updateAddress = async (addressId, addressData) => {
        try {
            const response = await authAPI.updateAddress(addressId, addressData);
            setUser(prev => ({
                ...prev,
                addresses: response.data.data.addresses,
            }));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || 'Failed to update address' };
        }
    };

    const deleteAddress = async (addressId) => {
        try {
            const response = await authAPI.deleteAddress(addressId);
            setUser(prev => ({
                ...prev,
                addresses: response.data.data.addresses,
            }));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || 'Failed to delete address' };
        }
    };

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
