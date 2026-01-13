import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <App />
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: '#111812',
                                color: '#fff',
                                padding: '16px',
                                borderRadius: '8px',
                            },
                            success: {
                                style: {
                                    background: '#2bee4b',
                                    color: '#111812',
                                },
                                iconTheme: {
                                    primary: '#111812',
                                    secondary: '#2bee4b',
                                },
                            },
                            error: {
                                style: {
                                    background: '#ef4444',
                                    color: '#fff',
                                },
                            },
                        }}
                    />
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
