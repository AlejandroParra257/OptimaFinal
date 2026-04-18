// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Verificar token al cargar la app
    useEffect(() => {
        if (token) {
            verificarToken();
        } else {
            setLoading(false);
        }
    }, []);

    // Función para verificar si el token es válido
    const verificarToken = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setUser(data.usuario);
            } else {
                // Token inválido o expirado
                localStorage.removeItem('token');
                setToken(null);
            }
        } catch (error) {
            console.error('Error al verificar token:', error);
        } finally {
            setLoading(false);
        }
    };

    // Función para iniciar sesión
    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:4000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
                setUser(data.usuario);
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, error: 'Error de conexión con el servidor' };
        }
    };

    // Función para registrarse
    const register = async (nombre, email, password) => {
        try {
            const response = await fetch('http://localhost:4000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
                setUser(data.usuario);
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Error en registro:', error);
            return { success: false, error: 'Error de conexión con el servidor' };
        }
    };

    // Función para cerrar sesión
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    // Valores y funciones que estarán disponibles en toda la app
    const value = {
        user,           // Datos del usuario actual
        loading,        // Estado de carga (verificando token)
        login,          // Función para iniciar sesión
        register,       // Función para registrarse
        logout,         // Función para cerrar sesión
        isAuthenticated: !!user,  // true si hay usuario
        isAdmin: user?.rol === 'admin',
        isVip: user?.rol === 'vip',
        isNoVip: user?.rol === 'no_vip'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};