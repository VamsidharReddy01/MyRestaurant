import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem('restaurant_cart');
        return saved ? JSON.parse(saved) : [];
    });

    const [customerDetails, setCustomerDetails] = useState(() => {
        const saved = localStorage.getItem('restaurant_customer');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        localStorage.setItem('restaurant_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        if (customerDetails) {
            localStorage.setItem('restaurant_customer', JSON.stringify(customerDetails));
        } else {
            localStorage.removeItem('restaurant_customer');
        }
    }, [customerDetails]);

    const addToCart = (item, quantity = 1) => {
        setCartItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
                );
            }
            return [...prev, { ...item, quantity }];
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems(prev => prev.filter(i => i.id !== itemId));
    };

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(itemId);
            return;
        }
        setCartItems(prev =>
            prev.map(i => i.id === itemId ? { ...i, quantity: newQuantity } : i)
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const updateCustomerDetails = (details) => {
        setCustomerDetails(details);
    };

    const cartTotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            customerDetails,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            updateCustomerDetails,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
