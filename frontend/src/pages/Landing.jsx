import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { User, MapPin, ArrowRight } from 'lucide-react';

export default function Landing() {
    const [name, setName] = useState('');
    const [table, setTable] = useState('');
    const { updateCustomerDetails } = useCart();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name && table) {
            updateCustomerDetails({ name, table });
            navigate('/menu');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, #2a2a35 0%, #0f0f13 100%)',
            padding: '20px'
        }}>
            <div className="card glass animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
                        MYRestaurant
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Welcome! Please enter your details.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#ccc' }}>
                            <User size={18} color="var(--color-primary)" /> Your Name
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. John Doe"
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#ccc' }}>
                            <MapPin size={18} color="var(--color-primary)" /> Table Number
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. 5"
                            className="input"
                            value={table}
                            onChange={(e) => setTable(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem' }}>
                        Save & Show Menu <ArrowRight size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
