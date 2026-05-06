// Este archivo se encarga de interactuar con la base de datos para el módulo C31 CIP
const pool = require('../../../configuracion_bd/base_datos'); 

// =========================================================
// 1. OBTENER TODOS LOS REGISTROS (CON DOBLE JOIN PARA TRADUCIR IDs A NOMBRES)
// =========================================================
const obtenerTodosLosRegistros = async (gestion) => {
    if (gestion) {
        const resultado = await pool.query(`
            SELECT 
                c31.*, 
                u1.nombre_completo AS nombre_creador,
                u2.nombre_completo AS nombre_editor
            FROM c31_cip c31
            LEFT JOIN usuarios u1 ON c31.usuario_creador_id = u1.id
            LEFT JOIN usuarios u2 ON c31.usuario_editor_id = u2.id
            WHERE c31.gestion = $1 
            ORDER BY c31.correlativo ASC
        `, [gestion]);
        return resultado.rows;
    } else {
        const resultado = await pool.query(`
            SELECT 
                c31.*, 
                u1.nombre_completo AS nombre_creador,
                u2.nombre_completo AS nombre_editor
            FROM c31_cip c31
            LEFT JOIN usuarios u1 ON c31.usuario_creador_id = u1.id
            LEFT JOIN usuarios u2 ON c31.usuario_editor_id = u2.id
            ORDER BY c31.id ASC
        `);
        return resultado.rows;
    }
};

// =========================================================
// 🪄 CALCULADORA DE CORRELATIVOS AUTOMÁTICOS
// =========================================================
const obtenerSiguienteCorrelativo = async (gestion) => {
    const resultado = await pool.query('SELECT MAX(correlativo) as maximo FROM c31_cip WHERE gestion = $1', [gestion]);
    const maximo = resultado.rows[0].maximo;
    // Si ya hay registros, le sumamos 1 al máximo. Si está vacío, empezamos en 1.
    return maximo ? maximo + 1 : 1;
};

// =========================================================
// 2. GUARDAR UN NUEVO REGISTRO (Calcula correlativo y guarda creador)
// =========================================================
const guardarNuevoRegistro = async (datos) => {
    const { gestion, beneficiario, detalle, n_preventivo, n_compromiso, n_devengado, n_secuencia, importe, fojas, hoja_ruta, n_libro_registro, ubicacion_fisica, ruta_archivo, usuario_id } = datos;
    
    // Calculamos el número exacto que le toca en este año
    const correlativo = await obtenerSiguienteCorrelativo(gestion);

    const resultado = await pool.query(
        `INSERT INTO c31_cip (
            gestion, correlativo, beneficiario, detalle_resumen, n_preventivo, n_compromiso, 
            n_devengado, n_secuencia, importe, fojas, hoja_ruta, n_libro_registro, 
            ubicacion_fisica, ruta_archivo, usuario_creador_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
        [gestion, correlativo, beneficiario, detalle, n_preventivo, n_compromiso, n_devengado, n_secuencia, importe, fojas, hoja_ruta, n_libro_registro, ubicacion_fisica, ruta_archivo, usuario_id]
    );
    return resultado.rows[0];
};

// =========================================================
// 3. EDITAR REGISTRO (Guarda quién fue el último en editar y la fecha)
// =========================================================
const modificarRegistro = async (id, datos) => {
    const { gestion, beneficiario, detalle, n_preventivo, n_compromiso, n_devengado, n_secuencia, importe, fojas, hoja_ruta, n_libro_registro, ubicacion_fisica, ruta_archivo, usuario_id } = datos;

    const resultado = await pool.query(
        `UPDATE c31_cip SET 
            gestion = $1, beneficiario = $2, detalle_resumen = $3, n_preventivo = $4, 
            n_compromiso = $5, n_devengado = $6, n_secuencia = $7, importe = $8, 
            fojas = $9, hoja_ruta = $10, n_libro_registro = $11, ubicacion_fisica = $12, 
            ruta_archivo = $13, usuario_editor_id = $14, fecha_edicion = CURRENT_TIMESTAMP 
        WHERE id = $15 RETURNING *`,
        [gestion, beneficiario, detalle, n_preventivo, n_compromiso, n_devengado, n_secuencia, importe, fojas, hoja_ruta, n_libro_registro, ubicacion_fisica, ruta_archivo, usuario_id, id]
    );
    return resultado.rows[0]; 
};

// =========================================================
// 4. ELIMINAR REGISTRO
// =========================================================
const eliminarRegistro = async (id) => {
    const resultado = await pool.query('DELETE FROM c31_cip WHERE id = $1 RETURNING *', [id]);
    return resultado.rows[0]; 
};

// =========================================================
// 5. OBTENER UN REGISTRO POR ID (Para buscar PDFs viejos)
// =========================================================
const obtenerRegistroPorId = async (id) => {
    const resultado = await pool.query('SELECT * FROM c31_cip WHERE id = $1', [id]);
    return resultado.rows[0];
};

module.exports = { obtenerTodosLosRegistros, guardarNuevoRegistro, modificarRegistro, eliminarRegistro, obtenerRegistroPorId };