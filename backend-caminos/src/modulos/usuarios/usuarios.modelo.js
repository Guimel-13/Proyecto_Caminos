const pool = require('../../configuracion_bd/base_datos'); 

const contarUsuarios = async () => {
    const resultado = await pool.query('SELECT COUNT(*) AS total FROM usuarios');
    return parseInt(resultado.rows[0].total);
};

const crearPrimerAdmin = async (datos) => {
    const { nombre, telefono, usuario, contrasenia, permisos } = datos;
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN'); 
        const rolResult = await cliente.query(
            `INSERT INTO roles (
                nombre_rol, descripcion, permiso_leer, permiso_crear, permiso_editar, 
                permiso_eliminar, permiso_pdf, permiso_prestar, permiso_admin_usuarios, permiso_admin_gestiones
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
            ['Administrador', 'Rol principal con acceso total creado durante la instalación', permisos.leer, permisos.crear, permisos.editar, permisos.eliminar, permisos.pdf, permisos.prestar, permisos.admin_usuarios, permisos.admin_gestiones]
        );
        const nuevoRolId = rolResult.rows[0].id;
        const userResult = await cliente.query(
            `INSERT INTO usuarios (rol_id, en_linea, nombre_completo, telefono, usuario, contrasenia) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [nuevoRolId, true, nombre, telefono, usuario, contrasenia]
        );
        await cliente.query('COMMIT');
        return userResult.rows[0];
    } catch (error) {
        await cliente.query('ROLLBACK');
        throw error; 
    } finally {
        cliente.release();
    }
};

const obtenerTodosLosUsuarios = async () => {
    const resultado = await pool.query(`
        SELECT u.*, r.nombre_rol FROM usuarios u LEFT JOIN roles r ON u.rol_id = r.id ORDER BY u.id ASC
    `);
    return resultado.rows;
};

// --- NUEVO CRUD ---
const crearUsuario = async (datos) => {
    const { rol_id, nombre_completo, telefono, usuario, contrasenia } = datos;
    const resultado = await pool.query(
        `INSERT INTO usuarios (rol_id, en_linea, nombre_completo, telefono, usuario, contrasenia) VALUES ($1, false, $2, $3, $4, $5) RETURNING *`,
        [rol_id, nombre_completo, telefono, usuario, contrasenia]
    );
    return resultado.rows[0];
};

const modificarUsuario = async (id, datos) => {
    const { rol_id, nombre_completo, telefono, usuario, contrasenia } = datos;
    if (contrasenia) {
        const res = await pool.query(
            `UPDATE usuarios SET rol_id = $1, nombre_completo = $2, telefono = $3, usuario = $4, contrasenia = $5 WHERE id = $6 RETURNING *`,
            [rol_id, nombre_completo, telefono, usuario, contrasenia, id]
        );
        return res.rows[0];
    } else {
        const res = await pool.query(
            `UPDATE usuarios SET rol_id = $1, nombre_completo = $2, telefono = $3, usuario = $4 WHERE id = $5 RETURNING *`,
            [rol_id, nombre_completo, telefono, usuario, id]
        );
        return res.rows[0];
    }
};

const eliminarUsuario = async (id) => {
    const resultado = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [id]);
    return resultado.rows[0];
};

module.exports = { contarUsuarios, crearPrimerAdmin, obtenerTodosLosUsuarios, crearUsuario, modificarUsuario, eliminarUsuario };