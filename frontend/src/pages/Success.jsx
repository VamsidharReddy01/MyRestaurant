import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function Success() {
    const navigate = useNavigate();
    const location = useLocation();
    const order = location.state?.order;

    return (
        <div className="animate-fade-in" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <CheckCircle size={80} color="var(--color-secondary)" />
            </div>

            <h1 style={{ color: 'var(--color-secondary)' }}>Order Placed!</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', marginBottom: '32px' }}>
                Thank you for your order. The kitchen has received it.
            </p>

            {order && (
                <div className="card" style={{ maxWidth: '400px', margin: '0 auto 32px', textAlign: 'left' }}>
                    <div style={{ marginBottom: '12px' }}>
                        <span style={{ color: '#888' }}>Order ID:</span> <strong>#{order.order_id}</strong>
                    </div>
                    <div>
                        <span style={{ color: '#888' }}>Amount Paid:</span> <strong>₹{order.total_amount}</strong>
                    </div>
                </div>
            )}

            <button onClick={() => navigate('/')} className="btn btn-primary">
                Back to Menu
            </button>
        </div>
    );
}
