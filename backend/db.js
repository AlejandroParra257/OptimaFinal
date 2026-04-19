import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool = null;

export const getPool = async () => {
    if (!pool) {
        try {
            pool = await mysql.createPool(config);
            console.log('✅ Conectado a Aiven MySQL - defaultdb');
        } catch (err) {
            console.error('❌ Error de conexión a Aiven:', err);
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