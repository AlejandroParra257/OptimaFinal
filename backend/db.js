import mysql from 'mysql2/promise';

const config = {
    host: 'mysql-fce179c-ramonjunior257-12ee.d.aivencloud.com',
    port: 14199,
    user: 'avnadmin',
    password: 'AVNS_-TiR1lwoIODvhhtumN_',
    database: 'defaultdb',
    ssl: {
        rejectUnauthorized: false  // Necesario para Aiven
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