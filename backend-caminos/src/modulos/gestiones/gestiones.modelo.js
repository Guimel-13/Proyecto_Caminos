const pool = require('../../configuracion_bd/base_datos'); 

// Obtener todas las gestiones ordenadas de la más nueva a la más vieja
const obtenerGestiones = async () => {
    // Asumo que tu tabla se llama "gestiones" y la columna del año se llama "anio"
    const resultado = await pool.query('SELECT * FROM gestiones ORDER BY anio ASC');
    return resultado.rows;
};

// Crear una nueva gestión
const crearGestion = async (anio) => {
    const resultado = await pool.query(
        'INSERT INTO gestiones (anio) VALUES ($1) RETURNING *',
        [anio]
    );
    return resultado.rows[0];
};

module.exports = { obtenerGestiones, crearGestion };