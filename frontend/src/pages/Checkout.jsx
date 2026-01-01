import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

export default function Checkout() {
    const { cartItems, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        customer_name: '',
        table_number: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    if (cartItems.length === 0) {
        return (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <h2>Your cart is empty</h2>
                <button onClick={() => navigate('/')} className="btn btn-outline" style={{ marginTop: '16px' }}>
                    Go to Menu
                </button>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const payload = {
            customer_name: formData.customer_name,
            table_number: formData.table_number,
            items: cartItems.map(item => ({
                menu_item_id: item.id,
                quantity: item.quantity
            }))
        };

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/order/', payload);
            clearCart();
            // Redirect to success page with order details if needed, or state
            navigate('/success', { state: { order: response.data } });
        } catch (err) {
            console.error("Order failed:", err);
            setError(err.response?.data?.error || "Failed to place order. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', cursor: 'pointer' }}>
                <ArrowLeft size={20} /> Back to Menu
            </button>

            <h1 style={{ marginBottom: '32px' }}>Checkout</h1>

            <div className="card" style={{ marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '16px' }}>Order Summary</h3>
                {cartItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #333' }}>
                        <span>{item.name} <span style={{ color: '#888' }}>x{item.quantity}</span></span>
                        <span>₹{item.price * item.quantity}</span>
                    </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--color-primary)' }}>₹{cartTotal.toFixed(2)}</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="card">
                <h3 style={{ marginBottom: '24px' }}>Your Details</h3>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Name</label>
                    <input
                        type="text"
                        required
                        className="input"
                        value={formData.customer_name}
                        onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                        placeholder="John Doe"
                    />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Table Number</label>
                    <input
                        type="text"
                        required
                        className="input"
                        value={formData.table_number}
                        onChange={e => setFormData({ ...formData, table_number: e.target.value })}
                        placeholder="e.g., T4"
                    />
                </div>

                {error && <div style={{ color: '#ff4444', marginBottom: '16px', background: 'rgba(255, 68, 68, 0.1)', padding: '12px', borderRadius: '4px' }}>{error}</div>}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                >
                    {isSubmitting ? 'Placing Order...' : `Confirm Order (₹${cartTotal.toFixed(2)})`}
                </button>
            </form>
        </div>
    );
}
