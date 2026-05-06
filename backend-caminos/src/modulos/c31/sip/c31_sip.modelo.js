const pool = require('../../../configuracion_bd/base_datos'); 

const obtenerTodosLosRegistros = async (gestion) => {
    let query = `
        SELECT s.*, u1.nombre_completo AS nombre_creador, u2.nombre_completo AS nombre_editor
        FROM c31_sip s
        LEFT JOIN usuarios u1 ON s.usuario_creador_id = u1.id
        LEFT JOIN usuarios u2 ON s.usuario_editor_id = u2.id
    `;
    if (gestion) {
        const res = await pool.query(query + ' WHERE s.gestion = $1 ORDER BY s.correlativo ASC', [gestion]);
        return res.rows;
    }
    const res = await pool.query(query + ' ORDER BY s.id ASC');
    return res.rows;
};

const obtenerSiguienteCorrelativo = async (gestion) => {
    const res = await pool.query('SELECT MAX(correlativo) as maximo FROM c31_sip WHERE gestion = $1', [gestion]);
    return res.rows[0].maximo ? res.rows[0].maximo + 1 : 1;
};

const guardarNuevoRegistro = async (datos) => {
    const { gestion, beneficiario, detalle, n_devengado, pago, n_secuencia, importe, fojas, hoja_ruta, n_libro_registro, ubicacion_fisica, ruta_archivo, usuario_id } = datos;
    const correlativo = await obtenerSiguienteCorrelativo(gestion);

    const resultado = await pool.query(
        `INSERT INTO c31_sip (gestion, correlativo, beneficiario, detalle_resumen, n_devengado, pago, n_secuencia, importe, fojas, hoja_ruta, n_libro_registro, ubicacion_fisica, ruta_archivo, usuario_creador_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
        [gestion, correlativo, beneficiario, detalle, n_devengado, pago, n_secuencia, importe, fojas, hoja_ruta, n_libro_registro, ubicacion_fisica, ruta_archivo, usuario_id]
    );
    return resultado.rows[0];
};

const modificarRegistro = async (id, datos) => {
    const { gestion, beneficiario, detalle, n_devengado, pago, n_secuencia, importe, fojas, hoja_ruta, n_libro_registro, ubicacion_fisica, ruta_archivo, usuario_id } = datos;
    const resultado = await pool.query(
        `UPDATE c31_sip SET gestion = $1, beneficiario = $2, detalle_resumen = $3, n_devengado = $4, pago = $5, n_secuencia = $6, importe = $7, fojas = $8, hoja_ruta = $9, n_libro_registro = $10, ubicacion_fisica = $11, ruta_archivo = $12, usuario_editor_id = $13, fecha_edicion = CURRENT_TIMESTAMP 
         WHERE id = $14 RETURNING *`,
        [gestion, beneficiario, detalle, n_devengado, pago, n_secuencia, importe, fojas, hoja_ruta, n_libro_registro, ubicacion_fisica, ruta_archivo, usuario_id, id]
    );
    return resultado.rows[0]; 
};

const eliminarRegistro = async (id) => {
    const resultado = await pool.query('DELETE FROM c31_sip WHERE id = $1 RETURNING *', [id]);
    return resultado.rows[0]; 
};

const obtenerRegistroPorId = async (id) => {
    const resultado = await pool.query('SELECT * FROM c31_sip WHERE id = $1', [id]);
    return resultado.rows[0];
};

module.exports = { obtenerTodosLosRegistros, guardarNuevoRegistro, modificarRegistro, eliminarRegistro, obtenerRegistroPorId };