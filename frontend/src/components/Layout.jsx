import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';

export default function Layout({ children }) {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { cartItems } = useCart();
    const location = useLocation();

    // Don't show public nav on staff pages (optional, but keep simple for now)
    const isStaffPage = location.pathname.startsWith('/staff') || location.pathname.startsWith('/kitchen');

    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="layout">
            {/* Navbar */}
            <nav style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'rgba(15, 15, 19, 0.9)',
                backdropFilter: 'blur(16px)',
                borderBottom: '1px solid var(--color-border)',
                padding: '16px 0'
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/" style={{ textDecoration: 'none', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-1px' }}>
                        MYRestaurant
                    </Link>

                    {!isStaffPage && (
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <Link to="/staff/login" style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                                <User size={20} />
                            </Link>
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="btn btn-primary"
                                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                            >
                                <ShoppingBag size={18} />
                                <span style={{ marginLeft: '8px' }}>{totalItems}</span>
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main className="container" style={{ padding: '32px 20px', minHeight: '80vh' }}>
                {children}
            </main>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid var(--color-border)', padding: '32px 0', marginTop: 'auto', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <p>&copy; 2024 Bistro Restaurant. All rights reserved.</p>
            </footer>

            {/* Cart Drawer Overlay */}
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
    );
}
