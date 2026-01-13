import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [itemCount, setItemCount] = useState(0);

    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            const response = await cartAPI.get();
            setCart(response.data.data.cart);
            setItemCount(response.data.data.cart.totalItems || 0);
        } catch (err) {
            console.error('Failed to fetch cart:', err);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Fetch cart when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            setCart(null);
            setItemCount(0);
        }
    }, [isAuthenticated, fetchCart]);

    const addToCart = async (productId, quantity = 1, showToast = true) => {
        if (!isAuthenticated) {
            toast.error('Please login to add items to cart');
            return { success: false };
        }

        try {
            setLoading(true);
            const response = await cartAPI.add(productId, quantity);
            setItemCount(response.data.data.itemCount);
            if (showToast) {
                toast.success('Added to cart!');
            }
            // Refresh full cart data
            await fetchCart();
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to add to cart';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        try {
            setLoading(true);
            const response = await cartAPI.update(productId, quantity);
            setItemCount(response.data.data.itemCount);
            await fetchCart();
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to update quantity';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (productId) => {
        try {
            setLoading(true);
            const response = await cartAPI.remove(productId);
            setItemCount(response.data.data.itemCount);
            toast.success('Item removed from cart');
            await fetchCart();
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to remove item';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async () => {
        try {
            setLoading(true);
            await cartAPI.clear();
            setCart(null);
            setItemCount(0);
            toast.success('Cart cleared');
            return { success: true };
        } catch (err) {
            toast.error('Failed to clear cart');
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    const applyCoupon = async (code) => {
        try {
            setLoading(true);
            const response = await cartAPI.applyCoupon(code);
            await fetchCart();
            toast.success(`Coupon applied! You saved ₹${response.data.data.discount.toFixed(2)}`);
            return { success: true, discount: response.data.data.discount };
        } catch (err) {
            const message = err.response?.data?.message || 'Invalid coupon code';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const removeCoupon = async () => {
        try {
            setLoading(true);
            await cartAPI.removeCoupon();
            await fetchCart();
            toast.success('Coupon removed');
            return { success: true };
        } catch (err) {
            toast.error('Failed to remove coupon');
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    const value = {
        cart,
        loading,
        itemCount,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        // Computed values
        subtotal: cart?.subtotal || 0,
        deliveryFee: cart?.deliveryFee || 0,
        discount: cart?.couponDiscount || 0,
        total: cart?.estimatedTotal || 0,
        isEmpty: !cart?.items?.length,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
