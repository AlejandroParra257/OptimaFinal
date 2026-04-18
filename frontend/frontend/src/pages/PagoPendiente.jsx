import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const PagoPendiente = () => {
    const [segundos, setSegundos] = useState(10);

    useEffect(() => {
        const timer = setInterval(() => {
            setSegundos(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="upgrade-container">
            <div className="upgrade-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '5rem', marginBottom: '20px' }}>⏳</div>
                <h2>Pago pendiente</h2>
                <p style={{ fontSize: '1.2rem', margin: '20px 0' }}>
                    Estamos procesando tu pago.
                </p>
                <p>
                    Esto puede tomar unos segundos. Te notificaremos cuando se complete.
                </p>
                <p style={{ marginTop: '20px' }}>
                    <strong>Redirigiendo al inicio en {segundos} segundos...</strong>
                </p>
                <div className="loading-spinner" style={{ margin: '30px auto' }}></div>
                <Link to="/" className="btn-upgrade" style={{ textDecoration: 'none', marginTop: '20px', display: 'inline-block' }}>
                    Ir al inicio ahora
                </Link>
            </div>
        </div>
    );
};

export default PagoPendiente;