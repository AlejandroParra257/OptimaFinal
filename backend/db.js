import mysql from 'mysql2/promise';

const config = {
    host: 'localhost',      // Cambia si es necesario
    port: 3307,             // El puerto que usas en DBeaver (3306 o 3307)
    user: 'root',
    password: '',           // Tu contraseña de MySQL
    database: 'prototipo_5s',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool = null;

export const getPool = async () => {
    if (!pool) {
        try {
            pool = await mysql.createPool(config);
            console.log('✅ Conectado a MySQL - prototipo_5s');
        } catch (err) {
            console.error('❌ Error de conexión:', err);
            throw err;
        }
    }
    return pool;
};

// Para mantener compatibilidad con tu código actual
export const sql = {
    Int: 'INT',
    VarChar: (size) => `VARCHAR(${size})`,
    DateTime: 'DATETIME',
    Bit: 'BOOLEAN',
    NVarChar: (size) => `VARCHAR(${size})`,
    MAX: 'MAX'
};

export default { getPool, sql };