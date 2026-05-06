const pool = require('../../../configuracion_bd/base_datos'); 

const obtenerTodosLosRegistros = async (gestion) => {
    let query = `
        SELECT c.*, u1.nombre_completo AS nombre_creador, u2.nombre_completo AS nombre_editor
        FROM c21_er_cip c
        LEFT JOIN usuarios u1 ON c.usuario_creador_id = u1.id
        LEFT JOIN usuarios u2 ON c.usuario_editor_id = u2.id
    `;
    if (gestion) {
        const res = await pool.query(query + ' WHERE c.gestion = $1 ORDER BY c.correlativo ASC', [gestion]);
        return res.rows;
    }
    const res = await pool.query(query + ' ORDER BY c.id ASC');
    return res.rows;
};

const obtenerSiguienteCorrelativo = async (gestion) => {
    const res = await pool.query('SELECT MAX(correlativo) as maximo FROM c21_er_cip WHERE gestion = $1', [gestion]);
    return res.rows[0].maximo ? res.rows[0].maximo + 1 : 1;
};

const guardarNuevoRegistro = async (datos) => {
    const { gestion, beneficiario, detalle, n_devengado, importe, fojas, hoja_ruta, n_libro_registro, ubicacion_fisica, ruta_archivo, usuario_id } = datos;
    const correlativo = await obtenerSiguienteCorrelativo(gestion);

    const resultado = await pool.query(
        `INSERT INTO c21_er_cip (gestion, correlativo, beneficiario, detalle_resumen, n_devengado, importe, fojas, hoja_ruta, n_libro_registro, ubicacion_fisica, ruta_archivo, usuario_creador_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [gestion, correlativo, beneficiario, detalle, n_devengado, importe, fojas, hoja_ruta, n_libro_registro, ubicacion_fisica, ruta_archivo, usuario_id]
    );
    return resultado.rows[0];
};

const modificarRegistro = async (id, datos) => {
    const { gestion, beneficiario, detalle, n_devengado, importe, fojas, hoja_ruta, n_libro_registro, ubicacion_fisica, ruta_archivo, usuario_id } = datos;
    const resultado = await pool.query(
        `UPDATE c21_er_cip SET gestion = $1, beneficiario = $2, detalle_resumen = $3, n_devengado = $4, importe = $5, fojas = $6, hoja_ruta = $7, n_libro_registro = $8, ubicacion_fisica = $9, ruta_archivo = $10, usuario_editor_id = $11, fecha_edicion = CURRENT_TIMESTAMP 
         WHERE id = $12 RETURNING *`,
        [gestion, beneficiario, detalle, n_devengado, importe, fojas, hoja_ruta, n_libro_registro, ubicacion_fisica, ruta_archivo, usuario_id, id]
    );
    return resultado.rows[0]; 
};

const eliminarRegistro = async (id) => {
    const resultado = await pool.query('DELETE FROM c21_er_cip WHERE id = $1 RETURNING *', [id]);
    return resultado.rows[0]; 
};

const obtenerRegistroPorId = async (id) => {
    const resultado = await pool.query('SELECT * FROM c21_er_cip WHERE id = $1', [id]);
    return resultado.rows[0];
};

module.exports = { obtenerTodosLosRegistros, guardarNuevoRegistro, modificarRegistro, eliminarRegistro, obtenerRegistroPorId };