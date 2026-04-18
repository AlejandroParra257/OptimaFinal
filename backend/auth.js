// backend/auth.js
import jwt from 'jsonwebtoken';

// Clave secreta para JWT (cámbiala por algo seguro)
const SECRET_KEY = '5S_OPTIMA_SECRET_KEY_2026_CAMBIAME';

// Middleware para verificar token
export const verificarToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, error: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Token inválido' });
    }
};

// Middleware para verificar rol
export const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({ success: false, error: 'No autenticado' });
        }

        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ success: false, error: 'No tienes permisos para esta acción' });
        }

        next();
    };
};

// Generar token
export const generarToken = (usuario) => {
    return jwt.sign(
        { 
            id: usuario.id, 
            email: usuario.email, 
            rol: usuario.rol 
        }, 
        SECRET_KEY, 
        { expiresIn: '7d' }
    );
};