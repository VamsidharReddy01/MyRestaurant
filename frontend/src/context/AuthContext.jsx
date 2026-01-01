import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('staff_token'));
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('staff_user');
        return saved ? JSON.parse(saved) : null;
    });

    const login = async (username, password) => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/staff/login/', {
                username,
                password
            });

            const { token: newToken, username: authUser } = response.data;

            setToken(newToken);
            setUser({ username: authUser });

            localStorage.setItem('staff_token', newToken);
            localStorage.setItem('staff_user', JSON.stringify({ username: authUser }));

            return true;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('staff_token');
        localStorage.removeItem('staff_user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
