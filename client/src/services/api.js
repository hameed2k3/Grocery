import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh and errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const baseURL = process.env.REACT_APP_API_URL || '/api';
                    const response = await axios.post(`${baseURL}/auth/refresh-token`, {
                        refreshToken,
                    });

                    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed - Clear tokens and redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth API calls
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/change-password', data),
    addAddress: (data) => api.post('/auth/addresses', data),
    updateAddress: (addressId, data) => api.put(`/auth/addresses/${addressId}`, data),
    deleteAddress: (addressId) => api.delete(`/auth/addresses/${addressId}`),
};

// Products API calls
export const productsAPI = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    getFeatured: (limit = 8) => api.get('/products/featured', { params: { limit } }),
    getBestSellers: (limit = 8) => api.get('/products/best-sellers', { params: { limit } }),
    getByCategory: (category, params) => api.get(`/products/category/${category}`, { params }),
    search: (query, params) => api.get('/products', { params: { search: query, ...params } }),
    // Admin
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
    updateStock: (id, data) => api.patch(`/products/${id}/stock`, data),
    getStats: () => api.get('/products/stats'),
};

// Cart API calls
export const cartAPI = {
    get: () => api.get('/cart'),
    getCount: () => api.get('/cart/count'),
    add: (productId, quantity) => api.post('/cart/add', { productId, quantity }),
    update: (productId, quantity) => api.put('/cart/update', { productId, quantity }),
    remove: (productId) => api.delete(`/cart/remove/${productId}`),
    clear: () => api.delete('/cart/clear'),
    applyCoupon: (code) => api.post('/cart/apply-coupon', { code }),
    removeCoupon: () => api.delete('/cart/remove-coupon'),
};

// Orders API calls
export const ordersAPI = {
    create: (data) => api.post('/orders', data),
    getMyOrders: (params) => api.get('/orders/my', { params }),
    getById: (id) => api.get(`/orders/${id}`),
    cancel: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
    reorder: (id) => api.post(`/orders/${id}/reorder`),
    // Admin
    getAll: (params) => api.get('/orders/all', { params }),
    updateStatus: (id, status, note) => api.put(`/orders/${id}/status`, { status, note }),
    getStats: () => api.get('/orders/stats'),
};

export default api;
