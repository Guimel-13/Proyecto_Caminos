const pool = require('../../configuracion_bd/base_datos');

const actualizarPerfil = async (id, nombre, telefono, contrasenia) => {
    if (contrasenia) {
        // Actualiza TODO (incluida la contraseña)
        const resultado = await pool.query(
            'UPDATE usuarios SET nombre_completo = $1, telefono = $2, contrasenia = $3 WHERE id = $4 RETURNING *',
            [nombre, telefono, contrasenia, id]
        );
        return resultado.rows[0];
    } else {
        // Actualiza SOLO nombre y teléfono (mantiene la contraseña vieja)
        const resultado = await pool.query(
            'UPDATE usuarios SET nombre_completo = $1, telefono = $2 WHERE id = $3 RETURNING *',
            [nombre, telefono, id]
        );
        return resultado.rows[0];
    }
};

module.exports = { actualizarPerfil };