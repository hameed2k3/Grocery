import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true);
            const response = await productsAPI.getById(id);
            setProduct(response.data.data.product);
        } catch (error) {
            console.error('Failed to fetch product:', error);
            toast.error('Failed to load product');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    const handleAddToCart = async () => {
        const result = await addToCart(product._id, quantity);
        if (result.success) {
            setQuantity(1);
        }
    };

    const incrementQuantity = () => {
        if (quantity < product.stock) {
            setQuantity(quantity + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <LoadingSpinner size="lg" message="Loading product..." />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-20 px-4">
                <span className="material-symbols-outlined text-6xl text-gray-300">error</span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Product Not Found</h2>
                <p className="text-gray-500 mt-2">The product you're looking for doesn't exist.</p>
                <Link
                    to="/products"
                    className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-primary text-gray-900 font-bold rounded-lg"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back to Products
                </Link>
            </div>
        );
    }

    const discountedPrice = product.discount?.percentage > 0
        ? (product.price * (1 - product.discount.percentage / 100)).toFixed(2)
        : null;

    const primaryImage = product.images?.[selectedImage]?.url || product.images?.[0]?.url || 'https://via.placeholder.com/600x600?text=No+Image';

    return (
        <div className="fade-in max-w-[1200px] mx-auto px-4 lg:px-10 py-8">
            {/* Breadcrumb */}
            <nav className="flex text-sm text-gray-500 mb-8 gap-2">
                <Link to="/" className="hover:text-primary">Home</Link>
                <span>/</span>
                <Link to="/products" className="hover:text-primary">Products</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Product Images */}
                <div className="flex flex-col gap-4">
                    <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                            src={primaryImage}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {product.images?.length > 1 && (
                        <div className="flex gap-3">
                            {product.images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-primary' : 'border-transparent'
                                        }`}
                                >
                                    <img src={image.url} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col gap-6">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                        {product.attributes?.organic && (
                            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">Organic</span>
                        )}
                        {product.attributes?.glutenFree && (
                            <span className="bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">Gluten-Free</span>
                        )}
                        {product.attributes?.vegan && (
                            <span className="bg-green-100 text-green-600 text-xs font-bold px-3 py-1 rounded-full">Vegan</span>
                        )}
                        {product.isBestSeller && (
                            <span className="bg-yellow-100 text-yellow-600 text-xs font-bold px-3 py-1 rounded-full">Best Seller</span>
                        )}
                    </div>

                    {/* Title & Category */}
                    <div>
                        <p className="text-sm text-gray-500 uppercase tracking-wider">{product.category.replace('-', ' & ')}</p>
                        <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mt-2">{product.name}</h1>
                    </div>

                    {/* Rating */}
                    {product.ratings?.count > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <span
                                        key={i}
                                        className={`material-symbols-outlined text-sm ${i < Math.round(product.ratings.average) ? 'text-yellow-400' : 'text-gray-300'
                                            }`}
                                        style={{ fontVariationSettings: "'FILL' 1" }}
                                    >
                                        star
                                    </span>
                                ))}
                            </div>
                            <span className="text-sm text-gray-500">({product.ratings.count} reviews)</span>
                        </div>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-4">
                        <span className="text-4xl font-black text-primary">
                            ₹{discountedPrice || product.price.toFixed(2)}
                        </span>
                        {discountedPrice && (
                            <>
                                <span className="text-xl text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
                                <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-1 rounded">
                                    -{product.discount.percentage}% OFF
                                </span>
                            </>
                        )}
                        <span className="text-gray-500">/ {product.unit}</span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>

                    {/* Stock Status */}
                    <div className="flex items-center gap-2">
                        {product.stock > 0 ? (
                            <>
                                <span className="w-2 h-2 rounded-full bg-primary"></span>
                                <span className="text-sm font-medium text-primary">In Stock</span>
                                {product.stock <= (product.lowStockThreshold || 10) && (
                                    <span className="text-sm text-orange-500 ml-2">Only {product.stock} left!</span>
                                )}
                            </>
                        ) : (
                            <>
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                <span className="text-sm font-medium text-red-500">Out of Stock</span>
                            </>
                        )}
                    </div>

                    {/* Quantity & Add to Cart */}
                    {product.stock > 0 && (
                        <div className="flex flex-col sm:flex-row gap-4 mt-4">
                            <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                                <button
                                    onClick={decrementQuantity}
                                    disabled={quantity <= 1}
                                    className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-700 rounded-lg shadow-sm disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined">remove</span>
                                </button>
                                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                                <button
                                    onClick={incrementQuantity}
                                    disabled={quantity >= product.stock}
                                    className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-700 rounded-lg shadow-sm disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined">add</span>
                                </button>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-gray-900 font-bold py-4 px-8 rounded-lg transition-all hover:shadow-lg"
                            >
                                <span className="material-symbols-outlined">add_shopping_cart</span>
                                Add to Cart
                            </button>
                        </div>
                    )}

                    {/* Product Details */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-4">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Product Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-gray-500">SKU</span>
                                <span className="font-medium">{product.sku}</span>
                            </div>
                            {product.brand && (
                                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-500">Brand</span>
                                    <span className="font-medium">{product.brand}</span>
                                </div>
                            )}
                            {product.origin && (
                                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-500">Origin</span>
                                    <span className="font-medium">{product.origin}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-gray-500">Category</span>
                                <span className="font-medium capitalize">{product.category.replace('-', ' & ')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Nutrition Info */}
                    {product.nutritionInfo?.calories && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Nutrition Facts</h3>
                            <div className="flex gap-4 flex-wrap">
                                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-lg text-center">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{product.nutritionInfo.calories}</p>
                                    <p className="text-xs text-gray-500">Calories</p>
                                </div>
                                {product.nutritionInfo.protein && (
                                    <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{product.nutritionInfo.protein}</p>
                                        <p className="text-xs text-gray-500">Protein</p>
                                    </div>
                                )}
                                {product.nutritionInfo.carbs && (
                                    <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{product.nutritionInfo.carbs}</p>
                                        <p className="text-xs text-gray-500">Carbs</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
