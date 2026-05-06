const pool = require('../../configuracion_bd/base_datos');

// =========================================================
// 1. OBTENER TODOS LOS REGISTROS (CON DOBLE JOIN PARA AUDITORÍA)
// =========================================================
const obtenerTodosLosRegistros = async (gestion) => {
    if (gestion) {
        const resultado = await pool.query(`
            SELECT
                a.*,
                u1.nombre_completo AS nombre_creador,
                u2.nombre_completo AS nombre_editor
            FROM asientos_manuales a
            LEFT JOIN usuarios u1 ON a.usuario_creador_id = u1.id
            LEFT JOIN usuarios u2 ON a.usuario_editor_id = u2.id
            WHERE a.gestion = $1
            ORDER BY a.correlativo ASC
        `, [gestion]);
        return resultado.rows;
    } else {
        const resultado = await pool.query(`
            SELECT
                a.*,
                u1.nombre_completo AS nombre_creador,
                u2.nombre_completo AS nombre_editor
            FROM asientos_manuales a
            LEFT JOIN usuarios u1 ON a.usuario_creador_id = u1.id
            LEFT JOIN usuarios u2 ON a.usuario_editor_id = u2.id
            ORDER BY a.id ASC
        `);
        return resultado.rows;
    }
};

// =========================================================
// 2. CALCULAR SIGUIENTE CORRELATIVO
// =========================================================
const obtenerSiguienteCorrelativo = async (gestion) => {
    const resultado = await pool.query(
        'SELECT MAX(correlativo) as maximo FROM asientos_manuales WHERE gestion = $1',
        [gestion]
    );

    const maximo = resultado.rows[0].maximo;
    return maximo ? maximo + 1 : 1;
};

// =========================================================
// 3. GUARDAR NUEVO REGISTRO
// =========================================================
const guardarNuevoRegistro = async (datos) => {
    const {
        gestion,
        detalle_glosa,
        n_documento,
        importe,
        hoja_ruta,
        n_libro_registro,
        ubicacion_fisica,
        ruta_archivo,
        usuario_id
    } = datos;

    const correlativo = await obtenerSiguienteCorrelativo(gestion);

    const resultado = await pool.query(`
        INSERT INTO asientos_manuales (
            gestion,
            correlativo,
            detalle_glosa,
            n_documento,
            importe,
            hoja_ruta,
            n_libro_registro,
            ubicacion_fisica,
            ruta_archivo,
            usuario_creador_id
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *
    `, [
        gestion,
        correlativo,
        detalle_glosa,
        n_documento,
        importe,
        hoja_ruta,
        n_libro_registro,
        ubicacion_fisica,
        ruta_archivo,
        usuario_id
    ]);

    return resultado.rows[0];
};

// =========================================================
// 4. MODIFICAR REGISTRO
// =========================================================
const modificarRegistro = async (id, datos) => {
    const {
        gestion,
        detalle_glosa,
        n_documento,
        importe,
        hoja_ruta,
        n_libro_registro,
        ubicacion_fisica,
        ruta_archivo,
        usuario_id
    } = datos;

    const resultado = await pool.query(`
        UPDATE asientos_manuales SET
            gestion = $1,
            detalle_glosa = $2,
            n_documento = $3,
            importe = $4,
            hoja_ruta = $5,
            n_libro_registro = $6,
            ubicacion_fisica = $7,
            ruta_archivo = $8,
            usuario_editor_id = $9,
            fecha_edicion = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *
    `, [
        gestion,
        detalle_glosa,
        n_documento,
        importe,
        hoja_ruta,
        n_libro_registro,
        ubicacion_fisica,
        ruta_archivo,
        usuario_id,
        id
    ]);

    return resultado.rows[0];
};

// =========================================================
// 5. ELIMINAR REGISTRO
// =========================================================
const eliminarRegistro = async (id) => {
    const resultado = await pool.query(
        'DELETE FROM asientos_manuales WHERE id = $1 RETURNING *',
        [id]
    );
    return resultado.rows[0];
};

// =========================================================
// 6. OBTENER REGISTRO POR ID
// =========================================================
const obtenerRegistroPorId = async (id) => {
    const resultado = await pool.query(
        'SELECT * FROM asientos_manuales WHERE id = $1',
        [id]
    );
    return resultado.rows[0];
};

module.exports = {
    obtenerTodosLosRegistros,
    guardarNuevoRegistro,
    modificarRegistro,
    eliminarRegistro,
    obtenerRegistroPorId
};