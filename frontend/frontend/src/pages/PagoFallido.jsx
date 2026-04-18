import React from 'react';
import { Link } from 'react-router-dom';

const PagoFallido = () => {
    return (
        <div className="upgrade-container">
            <div className="upgrade-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '5rem', marginBottom: '20px' }}>❌</div>
                <h2>Pago no completado</h2>
                <p style={{ fontSize: '1.2rem', margin: '20px 0', color: '#d32f2f' }}>
                    El pago no pudo ser procesado.
                </p>
                <p>Esto puede deberse a:</p>
                <ul style={{ textAlign: 'left', margin: '20px 0' }}>
                    <li>Fondos insuficientes</li>
                    <li>Datos de tarjeta incorrectos</li>
                    <li>Problema con el banco</li>
                </ul>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
                    <Link to="/upgrade" className="btn-upgrade" style={{ textDecoration: 'none' }}>
                        Volver a intentar
                    </Link>
                    <Link to="/" className="btn-gray" style={{ textDecoration: 'none', padding: '12px 24px' }}>
                        Ir al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PagoFallido;