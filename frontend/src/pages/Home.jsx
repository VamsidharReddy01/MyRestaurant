import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MenuCard from "../components/MenuCard";
import { useCart } from "../context/CartContext";

export default function Home() {
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState(null);
    const { customerDetails } = useCart();
    const navigate = useNavigate();
    const categoryRefs = useRef({});

    // Redirect if no details (Enforce Landing Flow)
    useEffect(() => {
        if (!customerDetails) {
            navigate('/');
        }
    }, [customerDetails, navigate]);

    useEffect(() => {
        axios.get("http://127.0.0.1:8000/api/menu/")
            .then(response => {
                setRestaurant(response.data);
                if (response.data.categories.length > 0) {
                    setActiveCategory(response.data.categories[0].id);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("API ERROR:", error);
                setLoading(false);
            });
    }, []);

    const scrollToCategory = (id) => {
        setActiveCategory(id);
        const element = document.getElementById(`category-${id}`);
        if (element) {
            const yOffset = -140; // Offset for sticky navs
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading deliciousness...</div>;

    if (!customerDetails) return null; // Wait for redirect

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '80px' }}>
            {/* Welcome Header */}
            <header style={{ textAlign: 'left', marginBottom: '20px', padding: '10px 0' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>
                    Hello, <span style={{ color: 'var(--color-secondary)' }}>{customerDetails.name}</span> 👋
                </h2>
                <p style={{ color: 'var(--color-text-muted)' }}>Found a table at <strong style={{ color: 'white' }}>{customerDetails.table}</strong>? Let's order!</p>
            </header>

            {/* Sticky Category Navbar */}
            <div className="category-nav">
                {restaurant?.categories.map(category => (
                    <button
                        key={category.id}
                        className={`category-chip ${activeCategory === category.id ? 'active' : ''}`}
                        onClick={() => scrollToCategory(category.id)}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            {/* Menu Categories */}
            {restaurant?.categories.map(category => (
                <section key={category.id} id={`category-${category.id}`} style={{ marginBottom: '56px', scrollMarginTop: '150px' }}>
                    <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }}></span>
                        {category.name}
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                        {category.items.map(item => (
                            <MenuCard key={item.id} item={item} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
