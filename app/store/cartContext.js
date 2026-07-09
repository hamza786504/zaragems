'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import productsData from '../data/products.json';

// Create context
const CartContext = createContext(null);

// Initial state
const initialState = {
    // Start with a couple of valid items from our products.json to demonstrate functionality
    cartItems: [
        
    ]
};

// Reducer Actions
export const CART_ACTIONS = {
    ADD_TO_CART: 'ADD_TO_CART',
    REMOVE_FROM_CART: 'REMOVE_FROM_CART',
    UPDATE_QUANTITY: 'UPDATE_QUANTITY',
    UPDATE_SIZE: 'UPDATE_SIZE',
    CLEAR_CART: 'CLEAR_CART',
    LOAD_CART: 'LOAD_CART'
};

// Cart Reducer
function cartReducer(state, action) {
    switch (action.type) {
        case CART_ACTIONS.LOAD_CART: {
            return {
                ...state,
                cartItems: action.payload || []
            };
        }
        case CART_ACTIONS.ADD_TO_CART: {
            const { productSlug, size, color, quantity, product } = action.payload;

            // Use provided product data or try to find from static JSON (for backward compatibility)
            let storeProduct = product;
            
            if (!storeProduct) {
                storeProduct = productsData.find(p => p.slug === productSlug);
            }
            
            if (!storeProduct) {
                console.error(`Product with slug "${productSlug}" is not available in the store.`);
                return state;
            }

            // Generate unique cart item ID based on configuration
            const cartItemId = `${productSlug}-${size || 'One Size'}-${color || 'Default'}`;

            // Check if item is already in cart
            const existingItemIndex = state.cartItems.findIndex(item => item.id === cartItemId);

            let newCartItems = [...state.cartItems];

            if (existingItemIndex > -1) {
                // Increment quantity
                newCartItems[existingItemIndex] = {
                    ...newCartItems[existingItemIndex],
                    quantity: newCartItems[existingItemIndex].quantity + (quantity || 1)
                };
            } else {
                // Add new item using database values to ensure integrity
                newCartItems.push({
                    id: cartItemId,
                    productId: storeProduct._id || storeProduct.id,
                    title: storeProduct.title,
                    price: storeProduct.price || storeProduct.priceNumeric,
                    quantity: quantity || 1,
                    size: size || (storeProduct.sizes && storeProduct.sizes[0]) || 'One Size',
                    color: color || (storeProduct.colors && storeProduct.colors[0]) || 'Default',
                    colorName: color ? 'Selected Color' : '',
                    image: storeProduct.images?.[0] || storeProduct.image || storeProduct.primaryImage,
                    category: storeProduct.productType || storeProduct.category || storeProduct.fabric,
                    type: storeProduct.isAccessory ? 'accessory' : 'clothing'
                });
            }

            // Save to localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('zaragems_cart', JSON.stringify(newCartItems));
            }

            return {
                ...state,
                cartItems: newCartItems
            };
        }

        case CART_ACTIONS.REMOVE_FROM_CART: {
            const itemId = action.payload;
            const newCartItems = state.cartItems.filter(item => item.id !== itemId);

            if (typeof window !== 'undefined') {
                localStorage.setItem('zaragems_cart', JSON.stringify(newCartItems));
            }

            return {
                ...state,
                cartItems: newCartItems
            };
        }

        case CART_ACTIONS.UPDATE_QUANTITY: {
            const { itemId, quantity } = action.payload;
            if (quantity < 1) return state;

            const newCartItems = state.cartItems.map(item => 
                item.id === itemId ? { ...item, quantity } : item
            );

            if (typeof window !== 'undefined') {
                localStorage.setItem('zaragems_cart', JSON.stringify(newCartItems));
            }

            return {
                ...state,
                cartItems: newCartItems
            };
        }

        case CART_ACTIONS.UPDATE_SIZE: {
            const { itemId, size } = action.payload;
            const itemToUpdate = state.cartItems.find(item => item.id === itemId);
            if (!itemToUpdate) return state;

            // Generate new ID for the new configuration
            const productSlug = itemToUpdate.id.split('-')[0];
            const color = itemToUpdate.color;
            const newCartItemId = `${productSlug}-${size}-${color}`;

            // Check if there is already an item with the target size in the cart
            const targetItemIndex = state.cartItems.findIndex(item => item.id === newCartItemId);
            
            let newCartItems = [];
            if (targetItemIndex > -1 && newCartItemId !== itemId) {
                // Merge quantities
                newCartItems = state.cartItems.reduce((acc, item) => {
                    if (item.id === itemId) {
                        // Skip this one as it's merged
                        return acc;
                    }
                    if (item.id === newCartItemId) {
                        acc.push({
                            ...item,
                            quantity: item.quantity + itemToUpdate.quantity
                        });
                    } else {
                        acc.push(item);
                    }
                    return acc;
                }, []);
            } else {
                // Just update size and ID
                newCartItems = state.cartItems.map(item => 
                    item.id === itemId ? { ...item, id: newCartItemId, size } : item
                );
            }

            if (typeof window !== 'undefined') {
                localStorage.setItem('zaragems_cart', JSON.stringify(newCartItems));
            }

            return {
                ...state,
                cartItems: newCartItems
            };
        }

        case CART_ACTIONS.CLEAR_CART: {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('zaragems_cart');
            }
            return {
                ...state,
                cartItems: []
            };
        }

        default:
            return state;
    }
}

// Context Provider
export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Hydrate cart from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedCart = localStorage.getItem('zaragems_cart');
            if (savedCart) {
                try {
                    const parsed = JSON.parse(savedCart);
                    if (Array.isArray(parsed)) {
                        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: parsed });
                    }
                } catch (e) {
                    console.error('Error loading cart from localStorage', e);
                }
            }
        }
    }, []);

    // Helper functions to dispatch actions (Redux actions creators)
    const addToCart = (productSlug, size, color, quantity = 1, product = null) => {
        dispatch({
            type: CART_ACTIONS.ADD_TO_CART,
            payload: { productSlug, size, color, quantity, product }
        });
    };

    const removeFromCart = (itemId) => {
        dispatch({
            type: CART_ACTIONS.REMOVE_FROM_CART,
            payload: itemId
        });
    };

    const updateQuantity = (itemId, quantity) => {
        dispatch({
            type: CART_ACTIONS.UPDATE_QUANTITY,
            payload: { itemId, quantity }
        });
    };

    const updateSize = (itemId, size) => {
        dispatch({
            type: CART_ACTIONS.UPDATE_SIZE,
            payload: { itemId, size }
        });
    };

    const clearCart = () => {
        dispatch({
            type: CART_ACTIONS.CLEAR_CART
        });
    };

    return (
        <CartContext.Provider
            value={{
                cartItems: state.cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                updateSize,
                clearCart,
                dispatch
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

// Hook to use Cart Context
export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
