import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';

export default function QuantityModal({ isOpen, onClose, item, onConfirm }) {
    const [quantity, setQuantity] = useState(1);

    if (!isOpen || !item) return null;

    const handleConfirm = () => {
        onConfirm(item, quantity);
        setQuantity(1); // Reset
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
                >
                    <X size={24} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{item.name}</h2>
                    <p style={{ color: 'var(--color-primary)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        ₹{item.price}
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #444', background: 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Minus size={20} />
                    </button>

                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', minWidth: '40px', textAlign: 'center' }}>
                        {quantity}
                    </span>

                    <button
                        onClick={() => setQuantity(quantity + 1)}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #444', background: 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <button
                    onClick={handleConfirm}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                >
                    Add to Order - ₹{(parseFloat(item.price) * quantity).toFixed(2)}
                </button>
            </div>
        </div>
    );
}
