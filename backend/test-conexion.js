import sql from 'mssql';

const config = {
    server: 'ALEXANDER_PARRA',
    database: 'prototipo_5s',
    port: 1434,
    connectionTimeout: 30000,
    options: {
        encrypt: false,
        trustedConnection: true,
        trustServerCertificate: true
    }
};

async function test() {
    console.log('Intentando conectar al puerto 1434...');
    try {
        await sql.connect(config);
        console.log('✅ Conectado a SQL Server');
        const result = await sql.query('SELECT @@VERSION as version');
        console.log('Versión:', result.recordset[0].version);
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

test();