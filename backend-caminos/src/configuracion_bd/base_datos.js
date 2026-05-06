const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sistema_caminos',
    password: '20092003', // Tu contraseña real
    port: 5432,
});

pool.connect()
    .then(() => console.log('Conexión exitosa a la base de datos PostgreSQL.'))
    .catch(err => console.error('.........Error conectando a PostgreSQL:', err.stack));

module.exports = pool;