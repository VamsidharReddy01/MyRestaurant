import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import QuantityModal from './QuantityModal';

export default function MenuCard({ item }) {
    const { addToCart } = useCart();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fix image URL helper
    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://127.0.0.1:8000${url}`;
    };

    const handleConfirm = (item, quantity) => {
        addToCart(item, quantity);
    };

    return (
        <>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
                <div
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        height: '180px',
                        background: '#25252b',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        position: 'relative'
                    }}
                >
                    {item.image ? (
                        <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                            className="hover-zoom"
                        />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '3rem', opacity: 0.2 }}>🍽️</span>
                        </div>
                    )}
                    {/* Price Tag Overlay */}
                    <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.1)' }}>
                        ₹{item.price}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0', flex: 1 }}>{item.name}</h3>
                </div>

                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '20px', flex: 1, lineHeight: '1.5' }}>
                    {item.description || "Fresh and delicious coding fuel."}
                </p>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-outline"
                    style={{ width: '100%', gap: '8px', padding: '10px' }}
                >
                    <Plus size={18} /> Add
                </button>
            </div>

            <QuantityModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                item={item}
                onConfirm={handleConfirm}
            />
        </>
    );
}
