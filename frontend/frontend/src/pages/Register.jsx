import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import fondoRegister from '../assets/5s.jpg';

const Register = () => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userType, setUserType] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentGifIndex, setCurrentGifIndex] = useState(0);

    const { register } = useAuth();
    const navigate = useNavigate();

    const gifs = [
        'https://cdn-icons-gif.flaticon.com/17771/17771121.gif',
        'https://www.etac.edu.mx/hs-fs/hubfs/Imported_Blog_Media/giphy-May-05-2023-06-19-13-4284-AM-1.gif?width=480&height=276&name=giphy-May-05-2023-06-19-13-4284-AM-1.gif',
        'https://cdn-icons-gif.flaticon.com/16104/16104406.gif'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentGifIndex((prevIndex) => (prevIndex + 1) % gifs.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Función para convertir userType a rol_id
    const getUserRolId = (type) => {
        const roles = {
            'egresado': 2, // VIP
            'aspirante': 3, // No VIP
            'empresa': 2    // VIP (o el que prefieras)
        };
        return roles[type] || 3;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!userType) {
            return setError('Debes seleccionar un tipo de usuario');
        }

        if (password !== confirmPassword) {
            return setError('Las contraseñas no coinciden');
        }

        if (password.length < 6) {
            return setError('La contraseña debe tener al menos 6 caracteres');
        }

        setLoading(true);
        
        // Obtener el rol_id basado en el userType seleccionado
        const rol_id = getUserRolId(userType);
        
        // Llamar a register con los datos + el rol_id
        const result = await register(nombre, email, password, rol_id);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Error al registrar usuario');
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
            {/* ===== FONDO DIFUMINADO ===== */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${fondoRegister})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                filter: 'blur(12px)',
                transform: 'scale(1.1)',
                zIndex: 0
            }} />
            
            {/* ===== CONTENIDO ===== */}
            <div style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px'
            }}>
                {/* ===== CONTENEDOR PRINCIPAL ===== */}
                <div style={{
                    display: 'flex',
                    width: '100%',
                    maxWidth: '1300px',
                    gap: '20px'
                }}>
                    {/* ===== CONTENEDOR IZQUIERDO - LOGO ===== */}
                    <div style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, rgba(26, 59, 92, 0.85), rgba(44, 74, 110, 0.85))',
                        borderRadius: '24px',
                        padding: '32px 24px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        backdropFilter: 'blur(2px)'
                    }}>
                        <div style={{
                            position: 'absolute',
                            width: '250px',
                            height: '250px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '50%',
                            top: '-80px',
                            right: '-80px',
                            zIndex: 1
                        }}></div>
                        <div style={{
                            position: 'absolute',
                            width: '180px',
                            height: '180px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '50%',
                            bottom: '-60px',
                            left: '-60px',
                            zIndex: 1
                        }}></div>

                        <div style={{
                            textAlign: 'center',
                            color: 'white',
                            position: 'relative',
                            zIndex: 2,
                            width: '100%'
                        }}>
                            <img
                                src={logo}
                                alt="5S OPTIMA"
                                style={{
                                    maxWidth: '220px',
                                    width: '100%',
                                    height: 'auto',
                                    margin: '0 auto 16px auto',
                                    borderRadius: '16px',
                                    boxShadow: '0 15px 30px rgba(0,0,0,0.3)'
                                }}
                            />

                            <h1 style={{
                                fontSize: '2.2rem',
                                fontWeight: '700',
                                margin: '0 0 8px',
                                letterSpacing: '-0.5px'
                            }}>
                                5S OPTIMA
                            </h1>

                            <p style={{
                                fontSize: '1rem',
                                opacity: '0.9',
                                fontStyle: 'italic',
                                marginBottom: '24px'
                            }}>
                                "Gestión para un Futuro Ordenado"
                            </p>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                textAlign: 'left',
                                background: 'rgba(255,255,255,0.15)',
                                padding: '16px',
                                borderRadius: '16px',
                                backdropFilter: 'blur(5px)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '1.1rem' }}>✅</span>
                                    <span style={{ fontSize: '0.9rem' }}>Metodología 5S completa</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '1.1rem' }}>✅</span>
                                    <span style={{ fontSize: '0.9rem' }}>Reportes PDF profesionales</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '1.1rem' }}>✅</span>
                                    <span style={{ fontSize: '0.9rem' }}>Gestión de roles y permisos</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '1.1rem' }}>✅</span>
                                    <span style={{ fontSize: '0.9rem' }}>Sistema de pagos integrado</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== CONTENEDOR CENTRAL - FORMULARIO ===== */}
                    <div style={{
                        flex: 1,
                        background: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '24px',
                        padding: '32px 28px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(255, 178, 107, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        backdropFilter: 'blur(2px)'
                    }}>
                        <h2 style={{
                            color: '#1a3b5c',
                            fontSize: '2rem',
                            marginBottom: '4px',
                            fontWeight: '700'
                        }}>
                            Crear cuenta
                        </h2>

                        <p style={{
                            color: '#4a6b8f',
                            marginBottom: '24px',
                            fontSize: '0.9rem'
                        }}>
                            Únete a 5S OPTIMA
                        </p>

                        {/* Selección de tipo de usuario */}
                        <div style={{ marginBottom: '24px' }}>
                            <p style={{
                                color: '#1a3b5c',
                                fontWeight: '600',
                                marginBottom: '12px',
                                fontSize: '0.85rem'
                            }}>
                                Tipo de usuario:
                            </p>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '8px'
                            }}>
                                {['egresado', 'aspirante', 'empresa'].map((type) => (
                                    <div
                                        key={type}
                                        onClick={() => setUserType(type)}
                                        style={{
                                            background: userType === type ? 'rgba(255, 178, 107, 0.3)' : 'rgba(255,255,255,0.7)',
                                            border: userType === type
                                                ? '2px solid #ffb26b'
                                                : '2px solid rgba(26, 59, 92, 0.1)',
                                            borderRadius: '12px',
                                            padding: '14px 4px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            backdropFilter: 'blur(2px)'
                                        }}
                                    >
                                        <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>
                                            {type === 'egresado' && '🎓'}
                                            {type === 'aspirante' && '📚'}
                                            {type === 'empresa' && '💼'}
                                        </div>
                                        <h4 style={{
                                            color: '#1a3b5c',
                                            margin: '0 0 4px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600'
                                        }}>
                                            {type === 'egresado' ? 'Egresado' : type === 'aspirante' ? 'Aspirante' : 'Empresa'}
                                        </h4>
                                        <p style={{
                                            color: '#4a6b8f',
                                            fontSize: '0.7rem',
                                            margin: 0
                                        }}>
                                            {type === 'egresado' ? 'Acceso a beneficios' : 
                                             type === 'aspirante' ? 'Primera vez aquí' : 
                                             'Registro corporativo'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                background: 'rgba(255, 107, 107, 0.2)',
                                border: '1px solid #ff6b6b',
                                borderRadius: '10px',
                                padding: '10px',
                                marginBottom: '20px',
                                textAlign: 'center',
                                color: '#c33',
                                fontSize: '0.85rem'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '5px',
                                    color: '#1a3b5c',
                                    fontWeight: '500',
                                    fontSize: '0.8rem'
                                }}>
                                    Nombre completo
                                </label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Juan Pérez"
                                    required
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #e0e7ef',
                                        borderRadius: '10px',
                                        fontSize: '0.9rem',
                                        background: '#ffffff',
                                        color: '#1e3a5f',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#ffb26b';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(255, 178, 107, 0.2)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e0e7ef';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '5px',
                                    color: '#1a3b5c',
                                    fontWeight: '500',
                                    fontSize: '0.8rem'
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
                                        border: '1px solid #e0e7ef',
                                        borderRadius: '10px',
                                        fontSize: '0.9rem',
                                        background: '#ffffff',
                                        color: '#1e3a5f',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#ffb26b';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(255, 178, 107, 0.2)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e0e7ef';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '5px',
                                    color: '#1a3b5c',
                                    fontWeight: '500',
                                    fontSize: '0.8rem'
                                }}>
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                    disabled={loading}
                                    minLength={6}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #e0e7ef',
                                        borderRadius: '10px',
                                        fontSize: '0.9rem',
                                        background: '#ffffff',
                                        color: '#1e3a5f',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#ffb26b';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(255, 178, 107, 0.2)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e0e7ef';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '5px',
                                    color: '#1a3b5c',
                                    fontWeight: '500',
                                    fontSize: '0.8rem'
                                }}>
                                    Confirmar contraseña
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repite tu contraseña"
                                    required
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #e0e7ef',
                                        borderRadius: '10px',
                                        fontSize: '0.9rem',
                                        background: '#ffffff',
                                        color: '#1e3a5f',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#ffb26b';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(255, 178, 107, 0.2)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e0e7ef';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !userType}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: 'linear-gradient(135deg, #1a3b5c 0%, #2c4a6e 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: loading || !userType ? 'not-allowed' : 'pointer',
                                    marginBottom: '16px',
                                    boxShadow: '0 4px 12px rgba(26, 59, 92, 0.3)',
                                    opacity: loading || !userType ? 0.5 : 1,
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    if (!loading && userType) {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 8px 20px rgba(255, 178, 107, 0.4)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!loading && userType) {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 4px 12px rgba(26, 59, 92, 0.3)';
                                    }
                                }}
                            >
                                {loading ? 'Registrando...' : 'Registrarse'}
                            </button>
                        </form>

                        <div style={{ textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '16px' }}>
                            <p style={{ color: '#4a6b8f', fontSize: '0.85rem' }}>
                                ¿Ya tienes cuenta?{' '}
                                <Link to="/login" style={{
                                    color: '#ffb26b',
                                    fontWeight: '600',
                                    textDecoration: 'none'
                                }}>
                                    Inicia Sesión
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* ===== CONTENEDOR DERECHO - CARRUSEL DE GIFS ===== */}
                    <div style={{
                        flex: 1,
                        background: 'linear-gradient(145deg, rgba(255, 178, 107, 0.85), rgba(255, 217, 61, 0.85))',
                        borderRadius: '24px',
                        padding: '28px 20px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.5)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        backdropFilter: 'blur(2px)'
                    }}>
                        <h3 style={{
                            fontSize: '1.4rem',
                            marginBottom: '16px',
                            fontWeight: '600',
                            textAlign: 'center',
                            color: '#1a3b5c'
                        }}>
                            Aprendé 5S
                        </h3>

                        <div style={{
                            width: '100%',
                            height: '160px',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            marginBottom: '12px',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                            border: '2px solid white'
                        }}>
                            <img
                                src={gifs[currentGifIndex]}
                                alt={`GIF ${currentGifIndex + 1}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/350x160/ffb26b/1a3b5c?text=5S';
                                }}
                            />
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '8px',
                            marginBottom: '12px'
                        }}>
                            {gifs.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentGifIndex(index)}
                                    style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: index === currentGifIndex ? '#1a3b5c' : 'rgba(26, 59, 92, 0.3)',
                                        cursor: 'pointer',
                                        padding: 0,
                                        transition: 'all 0.2s'
                                    }}
                                    aria-label={`Ver GIF ${index + 1}`}
                                />
                            ))}
                        </div>

                        <p style={{
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            background: 'rgba(255,255,255,0.8)',
                            padding: '12px',
                            borderRadius: '12px',
                            margin: 0,
                            color: '#1a3b5c'
                        }}>
                            <strong>Mejora continua</strong>
                            <br />
                            Con nuestra metodología 5S
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;