import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PagoExitoso = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Esperar 5 segundos y redirigir al login
        const timer = setTimeout(() => {
            navigate('/login');
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="upgrade-container">
            <div className="upgrade-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '5rem', marginBottom: '20px' }}>✅</div>
                <h2>¡Pago exitoso!</h2>
                <p style={{ fontSize: '1.2rem', margin: '20px 0' }}>
                    Tu cuenta ha sido actualizada a <strong>VIP</strong>.
                </p>
                <p>
                    Serás redirigido al login en 5 segundos para que inicies sesión nuevamente.
                </p>
                <div className="loading-spinner" style={{ margin: '30px auto' }}></div>
                <button 
                    onClick={() => navigate('/login')}
                    className="btn-upgrade"
                    style={{ marginTop: '20px' }}
                >
                    Ir al login ahora
                </button>
            </div>
        </div>
    );
};

export default PagoExitoso;