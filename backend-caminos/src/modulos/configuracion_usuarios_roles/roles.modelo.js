const pool = require('../../configuracion_bd/base_datos'); 

// Obtener todos los roles
const obtenerRoles = async () => {
    const resultado = await pool.query('SELECT * FROM roles ORDER BY id ASC');
    return resultado.rows;
};

// Crear un nuevo rol
const crearRol = async (datos) => {
    const { nombre_rol, descripcion, permisos } = datos;
    const resultado = await pool.query(
        `INSERT INTO roles (
            nombre_rol, descripcion, permiso_leer, permiso_crear, permiso_editar, 
            permiso_eliminar, permiso_pdf, permiso_prestar, permiso_admin_usuarios, permiso_admin_gestiones
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [
            nombre_rol, descripcion, permisos.leer, permisos.crear, permisos.editar, 
            permisos.eliminar, permisos.pdf, permisos.prestar, permisos.admin_usuarios, permisos.admin_gestiones
        ]
    );
    return resultado.rows[0];
};

// Modificar un rol
const modificarRol = async (id, datos) => {
    const { nombre_rol, descripcion, permisos } = datos;
    const resultado = await pool.query(
        `UPDATE roles SET 
            nombre_rol = $1, descripcion = $2, permiso_leer = $3, permiso_crear = $4, permiso_editar = $5, 
            permiso_eliminar = $6, permiso_pdf = $7, permiso_prestar = $8, permiso_admin_usuarios = $9, permiso_admin_gestiones = $10
        WHERE id = $11 RETURNING *`,
        [
            nombre_rol, descripcion, permisos.leer, permisos.crear, permisos.editar, 
            permisos.eliminar, permisos.pdf, permisos.prestar, permisos.admin_usuarios, permisos.admin_gestiones, id
        ]
    );
    return resultado.rows[0];
};

// Eliminar un rol
const eliminarRol = async (id) => {
    const resultado = await pool.query('DELETE FROM roles WHERE id = $1 RETURNING *', [id]);
    return resultado.rows[0];
};

module.exports = { obtenerRoles, crearRol, modificarRol, eliminarRol };