import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import fondoLogin from '../assets/5s.jpg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentGifIndex, setCurrentGifIndex] = useState(0);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const gifs = [
        'https://cdn.shopify.com/s/files/1/0986/1530/files/3-3-1_Our-Craft_Every-Step_v2.gif?5798634496969510582',
        'https://cdn.dribbble.com/userupload/20858829/file/original-2ef84391b398ca6e2a09c333b046bc46.gif',
        'https://taytahub.com/wp-content/uploads/2020/03/Gif-produccion-de-Videos-.gif'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentGifIndex((prevIndex) => (prevIndex + 1) % gifs.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);
        
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
        
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden'
        }}>
            {/* ===== FONDO CON IMAGEN ===== */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${fondoLogin})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                zIndex: 0
            }} />
            
            {/* ===== CAPA DE DIFUMINADO ===== */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                zIndex: 1
            }} />
            
            {/* ===== CONTENIDO ===== */}
            <div style={{
                position: 'relative',
                zIndex: 2,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px'
            }}>
                {/* ===== CONTENEDOR CENTRAL ===== */}
                <div style={{
                    display: 'flex',
                    width: '90%',
                    maxWidth: '1100px',
                    height: '650px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                }}>
                    {/* ===== COLUMNA IZQUIERDA - FORMULARIO ===== */}
                    <div style={{
                        width: '40%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(250, 241, 230, 0.9)',
                        padding: '20px'
                    }}>
                        <div style={{
                            width: '100%',
                            maxWidth: '350px'
                        }}>
                            <h2 style={{
                                color: '#1a3b5c',
                                fontSize: '2rem',
                                marginBottom: '5px',
                                fontWeight: '700'
                            }}>
                                Iniciar Sesión
                            </h2>

                            <p style={{
                                color: '#1a3b5c',
                                marginBottom: '20px',
                                fontSize: '0.9rem',
                                opacity: 0.9
                            }}>
                                Bienvenido de nuevo
                            </p>

                            {error && (
                                <div style={{
                                    background: 'rgba(255, 107, 107, 0.1)',
                                    border: '1px solid #ff6b6b',
                                    borderRadius: '8px',
                                    padding: '10px',
                                    marginBottom: '15px',
                                    textAlign: 'center',
                                    color: '#c33',
                                    fontSize: '0.85rem'
                                }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '4px',
                                        color: '#1a3b5c',
                                        fontWeight: '600',
                                        fontSize: '0.75rem'
                                    }}>
                                        Correo Electrónico
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="ejemplo@correo.com"
                                        required
                                        disabled={loading}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '2px solid rgba(26, 59, 92, 0.3)',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            background: 'white',
                                            color: '#1e3a5f',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#1a3b5c'}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(26, 59, 92, 0.3)'}
                                    />
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '4px',
                                        color: '#1a3b5c',
                                        fontWeight: '600',
                                        fontSize: '0.75rem'
                                    }}>
                                        Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        disabled={loading}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '2px solid rgba(26, 59, 92, 0.3)',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            background: 'white',
                                            color: '#1e3a5f',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#1a3b5c'}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(26, 59, 92, 0.3)'}
                                    />
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    margin: '10px 0'
                                }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        color: '#1a3b5c',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={remember}
                                            onChange={(e) => setRemember(e.target.checked)}
                                            disabled={loading}
                                            style={{
                                                width: '14px',
                                                height: '14px',
                                                accentColor: '#6bcb77',
                                                cursor: 'pointer'
                                            }}
                                        />
                                        <span>Recordar sesión</span>
                                    </label>

                                    <Link to="/forgot-password" style={{
                                        color: '#1a3b5c',
                                        textDecoration: 'none',
                                        fontSize: '0.8rem',
                                        fontWeight: '500'
                                    }}
                                    onMouseOver={(e) => e.target.style.opacity = '0.8'}
                                    onMouseOut={(e) => e.target.style.opacity = '1'}>
                                        ¿Olvidaste?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'linear-gradient(135deg, #1a3b5c 0%, #2c4a6e 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        fontWeight: '600',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        margin: '5px 0 12px',
                                        boxShadow: '0 5px 15px rgba(26, 59, 92, 0.3)',
                                        transition: 'all 0.3s',
                                        opacity: loading ? 0.6 : 1
                                    }}
                                    onMouseOver={(e) => {
                                        if (!loading) {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 10px 20px rgba(255, 178, 107, 0.4)';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (!loading) {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 5px 15px rgba(26, 59, 92, 0.3)';
                                        }
                                    }}
                                >
                                    {loading ? 'Iniciando...' : 'Iniciar sesión'}
                                </button>
                            </form>

                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: '#1a3b5c', fontSize: '0.8rem' }}>
                                    ¿No tienes cuenta?{' '}
                                    <Link to="/register" style={{
                                        color: '#1a3b5c',
                                        fontWeight: '600',
                                        textDecoration: 'none'
                                    }}
                                    onMouseOver={(e) => e.target.style.opacity = '0.8'}
                                    onMouseOut={(e) => e.target.style.opacity = '1'}>
                                        Regístrate
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ===== COLUMNA DERECHA - LOGO Y CARRUSEL ===== */}
                    <div style={{
                        width: '60%',
                        height: '100%',
                        background: 'linear-gradient(135deg, rgba(26, 59, 92, 0.9), rgba(44, 74, 110, 0.9))',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '15px'
                    }}>
                        <div style={{
                            width: '95%',
                            maxWidth: '520px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            {/* Logo */}
                            <div style={{ 
                                textAlign: 'center', 
                                color: 'white'
                            }}>
                                <img 
                                    src={logo} 
                                    alt="5S OPTIMA" 
                                    style={{
                                        maxWidth: '220px',
                                        width: '100%',
                                        height: 'auto',
                                        margin: '0 auto 8px auto',
                                        borderRadius: '10px',
                                        boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                                        border: '2px solid rgba(255,255,255,0.2)'
                                    }}
                                />
                                
                                <h1 style={{
                                    fontSize: '2.2rem',
                                    fontWeight: '700',
                                    margin: '0 0 5px 0',
                                    letterSpacing: '-0.5px',
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                                }}>
                                    5S OPTIMA
                                </h1>
                                
                                <p style={{
                                    fontSize: '1.1rem',
                                    opacity: '0.95',
                                    fontStyle: 'italic',
                                    margin: 0
                                }}>
                                    "Gestión para un Futuro Ordenado"
                                </p>
                            </div>

                            {/* Título del carrusel */}
                            <h3 style={{
                                fontSize: '1.2rem',
                                fontWeight: '600',
                                textAlign: 'center',
                                color: 'white',
                                margin: '5px 0 5px 0',
                                opacity: 0.9
                            }}>
                                Descubre 5S OPTIMA
                            </h3>

                            {/* Carrusel */}
                            <div style={{
                                width: '100%',
                                height: '130px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                marginBottom: '8px',
                                boxShadow: '0 8px 15px rgba(0,0,0,0.3)',
                                border: '2px solid rgba(255,255,255,0.2)',
                                backgroundColor: 'rgba(0,0,0,0.1)'
                            }}>
                                <img 
                                    src={gifs[currentGifIndex]} 
                                    alt={`Imagen ${currentGifIndex + 1}`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        backgroundColor: '#1a3b5c'
                                    }}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/520x130/1a3b5c/ffffff?text=5S+OPTIMA';
                                        e.target.style.objectFit = 'contain';
                                    }}
                                />
                            </div>

                            {/* Indicadores */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '6px',
                                marginBottom: '8px'
                            }}>
                                {gifs.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentGifIndex(index)}
                                        style={{
                                            width: '20px',
                                            height: '3px',
                                            borderRadius: '2px',
                                            border: 'none',
                                            background: index === currentGifIndex ? '#ffb26b' : 'rgba(255,255,255,0.3)',
                                            cursor: 'pointer',
                                            padding: 0,
                                            transition: 'all 0.3s'
                                        }}
                                        aria-label={`Ver imagen ${index + 1}`}
                                    />
                                ))}
                            </div>

                            {/* Texto final */}
                            <div style={{
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                padding: '10px',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                textAlign: 'center'
                            }}>
                                <p style={{
                                    fontSize: '0.85rem',
                                    color: 'white',
                                    lineHeight: '1.4',
                                    margin: '0 0 3px 0'
                                }}>
                                    Gestión inteligente para un futuro ordenado.
                                </p>
                                <strong style={{
                                    color: '#ffb26b',
                                    fontSize: '1rem',
                                    display: 'block',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                }}>
                                    ¡Únete hoy!
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;