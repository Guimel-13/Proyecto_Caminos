const pool = require('../../configuracion_bd/base_datos'); 

const obtenerPrestamos = async (gestion) => {
    let query = `
        SELECT p.*, u.nombre_completo AS nombre_creador
        FROM prestamos p
        LEFT JOIN usuarios u ON p.usuario_creador_id = u.id
    `;
    if (gestion) {
        const res = await pool.query(query + ' WHERE p.gestion_prestamo = $1 ORDER BY p.id ASC', [gestion]);
        return res.rows;
    }
    const res = await pool.query(query + ' ORDER BY p.id ASC');
    return res.rows;
};

const obtenerSiguienteCorrelativo = async (gestion) => {
    const res = await pool.query('SELECT MAX(correlativo) as maximo FROM prestamos WHERE gestion_prestamo = $1', [gestion]);
    return res.rows[0].maximo ? res.rows[0].maximo + 1 : 1;
};

const guardarPrestamo = async (datos) => {
    const { gestion_prestamo, nombre_completo, unidad_solicitante, tipo_documento, gestion_documento, codigo_doc, detalle_glosa, fecha_limite, usuario_id } = datos;
    const correlativo = await obtenerSiguienteCorrelativo(gestion_prestamo);

    const resultado = await pool.query(
        `INSERT INTO prestamos (
            gestion_prestamo, correlativo, nombre_completo, unidad_solicitante, 
            tipo_documento, gestion_documento, codigo_doc, detalle_glosa, 
            fecha_limite, usuario_creador_id, estado, fecha_prestamo
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pendiente', CURRENT_DATE) RETURNING *`,
        [gestion_prestamo, correlativo, nombre_completo, unidad_solicitante, tipo_documento, gestion_documento, codigo_doc, detalle_glosa, fecha_limite, usuario_id]
    );
    return resultado.rows[0];
};

// Función especial para marcar como devuelto
const registrarDevolucionFisica = async (id, usuario_id) => {
    const resultado = await pool.query(
        `UPDATE prestamos SET 
            estado = 'devuelto', 
            fecha_de_devolucion = CURRENT_DATE,
            usuario_editor_id = $1, 
            fecha_edicion = CURRENT_TIMESTAMP 
        WHERE id = $2 RETURNING *`,
        [usuario_id, id]
    );
    return resultado.rows[0];
};

const eliminarPrestamo = async (id) => {
    const resultado = await pool.query('DELETE FROM prestamos WHERE id = $1 RETURNING *', [id]);
    return resultado.rows[0];
};

module.exports = { obtenerPrestamos, guardarPrestamo, registrarDevolucionFisica, eliminarPrestamo };