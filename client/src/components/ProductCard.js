import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const { addToCart, loading } = useCart();

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await addToCart(product._id, 1);
    };

    const discountedPrice = product.discount?.percentage > 0
        ? (product.price * (1 - product.discount.percentage / 100)).toFixed(2)
        : null;

    const primaryImage = product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image';

    return (
        <Link
            to={`/products/${product._id}`}
            className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-primary transition-all duration-300 hover:shadow-xl"
        >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-900">
                <img
                    src={primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.attributes?.organic && (
                        <span className="bg-primary text-gray-900 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                            Organic
                        </span>
                    )}
                    {product.discount?.percentage > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                            -{product.discount.percentage}%
                        </span>
                    )}
                    {product.isBestSeller && (
                        <span className="bg-yellow-400 text-gray-900 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                            Best Seller
                        </span>
                    )}
                </div>

                {/* Favorite Button */}
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    className="absolute top-3 right-3 text-gray-600 dark:text-white bg-white/80 dark:bg-black/30 backdrop-blur rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <span className="material-symbols-outlined text-sm">favorite</span>
                </button>
            </div>

            {/* Product Info */}
            <div className="p-4 flex flex-col gap-1">
                <p className="text-xs font-medium text-gray-400">{product.subcategory || product.category}</p>
                <h3 className="text-gray-900 dark:text-white font-bold text-base leading-tight truncate">
                    {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-xl font-bold text-primary">
                        ₹{discountedPrice || product.price.toFixed(2)}
                    </span>
                    {discountedPrice && (
                        <span className="text-sm text-gray-400 line-through">
                            ₹{product.price.toFixed(2)}
                        </span>
                    )}
                    <span className="text-xs text-gray-400">/ {product.unit}</span>
                </div>

                {/* Stock Status */}
                {product.stock === 0 && (
                    <p className="text-xs text-red-500 font-medium mt-1">Out of Stock</p>
                )}
                {product.stock > 0 && product.stock <= (product.lowStockThreshold || 10) && (
                    <p className="text-xs text-orange-500 font-medium mt-1">Only {product.stock} left</p>
                )}

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={loading || product.stock === 0}
                    className="mt-4 w-full bg-primary hover:bg-primary/90 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-900 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                    <span className="material-symbols-outlined text-xl">add_shopping_cart</span>
                    <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>
            </div>
        </Link>
    );
};

export default ProductCard;
