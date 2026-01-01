import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, Check, Clock, ChefHat, Bell, Archive } from 'lucide-react';

export default function Kitchen() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token, logout } = useAuth();

    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/orders/', {
                headers: { Authorization: `Token ${token}` }
            });
            setOrders(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [token]);

    const updateStatus = async (orderId, newStatus) => {
        try {
            await axios.patch(`http://127.0.0.1:8000/api/order/${orderId}/status/`,
                { status: newStatus },
                { headers: { Authorization: `Token ${token}` } }
            );
            fetchOrders(); // Refresh immediately
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#FFA500'; // Orange
            case 'accepted': return '#3498db'; // Blue
            case 'preparing': return '#9b59b6'; // Purple
            case 'ready': return '#2ecc71'; // Green
            case 'served': return '#95a5a6'; // Gray
            default: return '#555';
        }
    };

    const getNextAction = (status) => {
        switch (status) {
            case 'pending': return { label: 'Accept', status: 'accepted', icon: Check };
            case 'accepted': return { label: 'Cook', status: 'preparing', icon: ChefHat };
            case 'preparing': return { label: 'Ready', status: 'ready', icon: Bell };
            case 'ready': return { label: 'Serve', status: 'served', icon: Archive };
            default: return null;
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ marginBottom: 0 }}>Kitchen Dashboard</h1>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button onClick={fetchOrders} className="btn btn-outline" style={{ padding: '8px 16px' }}>
                        <RefreshCw size={18} /> Refresh
                    </button>
                    <button onClick={logout} className="btn" style={{ background: '#333', color: 'white', padding: '8px 16px' }}>
                        Logout
                    </button>
                </div>
            </div>

            {loading ? (
                <p>Loading orders...</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {orders.map(order => {
                        const action = getNextAction(order.status);
                        if (order.status === 'served' || order.status === 'cancelled') return null; // Hide finished orders or move to history

                        return (
                            <div key={order.order_id} className="card" style={{ borderLeft: `4px solid ${getStatusColor(order.status)}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ fontWeight: 'bold' }}>#{order.order_id}</span>
                                    <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold', color: getStatusColor(order.status) }}>
                                        {order.status}
                                    </span>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Table {order.table_number}</h3>
                                    <p style={{ color: '#ccc', fontSize: '0.9rem' }}>{order.customer_name}</p>
                                </div>

                                <div style={{ background: '#252525', padding: '12px', borderRadius: '8px', marginBottom: '16px', maxHeight: '200px', overflowY: 'auto' }}>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span>{item.name}</span>
                                            <span>x{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.85rem', color: '#888' }}>
                                        <Clock size={14} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
                                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>

                                    {action && (
                                        <button
                                            onClick={() => updateStatus(order.order_id, action.status)}
                                            className="btn btn-primary"
                                            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                                        >
                                            <action.icon size={16} /> {action.label}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
