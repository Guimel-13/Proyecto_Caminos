// Importamos la conexión a la base de datos subiendo dos niveles de carpetas
const pool = require('../../configuracion_bd/base_datos'); 

const buscarUsuario = async (usuario, contrasenia) => {
    // 🪄 MAGIA APLICADA: Unimos la tabla usuarios con la tabla roles
    const resultado = await pool.query(`
        SELECT 
            u.*, 
            r.nombre_rol, 
            r.permiso_leer, r.permiso_crear, r.permiso_editar, 
            r.permiso_eliminar, r.permiso_pdf, r.permiso_prestar, 
            r.permiso_admin_usuarios, r.permiso_admin_gestiones
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        WHERE u.usuario = $1 AND u.contrasenia = $2
    `, [usuario, contrasenia]);
    
    return resultado.rows; // Devuelve los datos completos si lo encuentra
};

// =========================================================
// FUNCIÓN: ENCIENDE O APAGA EL ESTADO EN LÍNEA
// =========================================================
const cambiarEstadoLinea = async (id, estado) => {
    // Le pasamos $1 (true/false) y $2 (el ID del usuario)
    await pool.query('UPDATE usuarios SET en_linea = $1 WHERE id = $2', [estado, id]);
};

// Exportamos AMBAS funciones para que el Controlador no se queje
module.exports = { buscarUsuario, cambiarEstadoLinea };