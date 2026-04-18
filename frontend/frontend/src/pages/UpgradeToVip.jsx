import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';

const UpgradeToVip = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Verificar que el usuario sea No VIP
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.rol !== 'no_vip') {
            navigate('/');
        }
    }, [user, navigate]);

    const handleUpgrade = async () => {
        setLoading(true);
        setError('');
        
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No hay sesión activa. Por favor inicia sesión nuevamente.');
            }

            const res = await fetch('http://localhost:4000/api/pagos/crear-preferencia', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                if (res.status === 401) {
                    throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
                }
                if (res.status === 400) {
                    const data = await res.json();
                    throw new Error(data.error || 'Solicitud incorrecta');
                }
                throw new Error(`Error ${res.status}: ${res.statusText}`);
            }

            const data = await res.json();

            if (data.success) {
                window.location.href = data.init_point || data.sandbox_init_point;
            } else {
                throw new Error(data.error || 'Error al procesar el pago');
            }

        } catch (err) {
            console.error('Error completo:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.rol !== 'no_vip') {
        return null;
    }

    return (
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            display: 'flex',
            background: '#fff9f0',
            margin: 0,
            padding: 0,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        }}>
            {/* ===== CONTENEDOR PRINCIPAL ===== */}
            <div style={{
                display: 'flex',
                width: '100%',
                maxWidth: '1300px',
                margin: '0 auto',
                padding: '20px',
                gap: '20px',
                alignItems: 'center'
            }}>
                {/* ===== COLUMNA IZQUIERDA - LOGO Y DESCRIPCIÓN ===== */}
                <div style={{
                    flex: 1,
                    background: 'linear-gradient(145deg, #1a3b5c 0%, #2c4a6e 100%)',
                    borderRadius: '24px',
                    padding: '40px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '500px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Elementos decorativos */}
                    <div style={{
                        position: 'absolute',
                        width: '300px',
                        height: '300px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '50%',
                        top: '-100px',
                        right: '-100px',
                        zIndex: 1
                    }}></div>
                    <div style={{
                        position: 'absolute',
                        width: '200px',
                        height: '200px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '50%',
                        bottom: '-50px',
                        left: '-50px',
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
                                maxWidth: '200px',
                                width: '100%',
                                height: 'auto',
                                margin: '0 auto 20px auto',
                                borderRadius: '16px',
                                boxShadow: '0 15px 30px rgba(0,0,0,0.3)'
                            }}
                        />
                        
                        <h1 style={{
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            margin: '0 0 10px',
                            letterSpacing: '-0.5px'
                        }}>
                            5S OPTIMA
                        </h1>
                        
                        <p style={{
                            fontSize: '1.1rem',
                            opacity: '0.9',
                            fontStyle: 'italic',
                            marginBottom: '30px'
                        }}>
                            "Gestión para un Futuro Ordenado"
                        </p>

                        <div style={{
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            padding: '20px',
                            backdropFilter: 'blur(5px)'
                        }}>
                            <p style={{
                                fontSize: '1rem',
                                lineHeight: '1.6',
                                margin: 0
                            }}>
                                Actualiza a VIP y disfruta de <strong>todos los beneficios</strong> que tenemos para ti.
                                <br /><br />
                                Suscripción mensual, cancela cuando quieras.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ===== COLUMNA DERECHA - BENEFICIOS Y BOTÓN ===== */}
                <div style={{
                    flex: 1,
                    background: 'white',
                    borderRadius: '24px',
                    padding: '40px',
                    boxShadow: '0 20px 40px rgba(255, 178, 107, 0.15)',
                    border: '1px solid rgba(255, 178, 107, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: '500px'
                }}>
                    <h2 style={{
                        color: '#1a3b5c',
                        fontSize: '2.2rem',
                        marginBottom: '10px',
                        fontWeight: '700',
                        textAlign: 'center'
                    }}>
                        ✨ Actualizar a VIP
                    </h2>
                    
                    {error && (
                        <div style={{
                            background: 'rgba(255, 107, 107, 0.1)',
                            border: '1px solid #ff6b6b',
                            borderRadius: '12px',
                            padding: '15px',
                            marginBottom: '25px',
                            textAlign: 'center',
                            color: '#c33',
                            fontWeight: '500',
                            fontSize: '0.9rem'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}
                    
                    <div style={{
                        background: '#f8fafc',
                        borderRadius: '20px',
                        padding: '30px',
                        marginBottom: '30px'
                    }}>
                        <h3 style={{
                            color: '#1a3b5c',
                            marginBottom: '20px',
                            fontSize: '1.3rem',
                            fontWeight: '600'
                        }}>
                            Beneficios exclusivos:
                        </h3>
                        
                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0
                        }}>
                            <li style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 0',
                                borderBottom: '1px solid #edf2f7'
                            }}>
                                <span style={{ color: '#4CAF50', fontSize: '1.2rem' }}>✅</span>
                                <span style={{ color: '#1a3b5c' }}>Sin límite de entradas diarias</span>
                            </li>
                            <li style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 0',
                                borderBottom: '1px solid #edf2f7'
                            }}>
                                <span style={{ color: '#4CAF50', fontSize: '1.2rem' }}>✅</span>
                                <span style={{ color: '#1a3b5c' }}>Acceso a reportes avanzados</span>
                            </li>
                            <li style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 0',
                                borderBottom: '1px solid #edf2f7'
                            }}>
                                <span style={{ color: '#4CAF50', fontSize: '1.2rem' }}>✅</span>
                                <span style={{ color: '#1a3b5c' }}>Prioridad en soporte</span>
                            </li>
                            <li style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 0',
                                borderBottom: '1px solid #edf2f7'
                            }}>
                                <span style={{ color: '#4CAF50', fontSize: '1.2rem' }}>✅</span>
                                <span style={{ color: '#1a3b5c' }}>Estadísticas detalladas</span>
                            </li>
                            <li style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 0',
                                borderBottom: '1px solid #edf2f7'
                            }}>
                                <span style={{ color: '#4CAF50', fontSize: '1.2rem' }}>✅</span>
                                <span style={{ color: '#1a3b5c' }}>Exportación de datos ilimitada</span>
                            </li>
                            <li style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 0'
                            }}>
                                <span style={{ color: '#4CAF50', fontSize: '1.2rem' }}>✅</span>
                                <span style={{ color: '#1a3b5c' }}>Gráficas en tiempo real</span>
                            </li>
                        </ul>
                    </div>
                    
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '20px'
                    }}>
                        <span style={{
                            fontSize: '3rem',
                            fontWeight: '700',
                            color: '#1a3b5c',
                            lineHeight: '1'
                        }}>
                            $394 MXN
                        </span>
                        <span style={{
                            color: '#6b7a8f',
                            fontSize: '1rem',
                            marginLeft: '5px'
                        }}>
                            / mes
                        </span>
                    </div>
                    
                    <button 
                        onClick={handleUpgrade}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #1a3b5c 0%, #2c4a6e 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1.2rem',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginBottom: '15px',
                            boxShadow: '0 8px 20px rgba(26, 59, 92, 0.3)',
                            transition: 'all 0.2s',
                            opacity: loading ? 0.6 : 1
                        }}
                        onMouseOver={(e) => {
                            if (!loading) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 12px 25px rgba(255, 178, 107, 0.4)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!loading) {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 8px 20px rgba(26, 59, 92, 0.3)';
                            }
                        }}
                    >
                        {loading ? (
                            <>
                                <span className="loading-spinner" style={{ marginRight: '8px' }}></span>
                                Procesando...
                            </>
                        ) : (
                            'Actualizar ahora'
                        )}
                    </button>
                    
                    <p style={{
                        color: '#6b7a8f',
                        fontSize: '0.85rem',
                        textAlign: 'center',
                        margin: 0
                    }}>
                        🔒 Pago seguro procesado por Mercado Pago
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UpgradeToVip;