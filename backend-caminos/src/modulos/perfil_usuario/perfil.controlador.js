const PerfilModelo = require('./perfil.modelo');

const modificarPerfil = async (req, res) => {
    const { id } = req.params;
    const { nombre, telefono, contrasenia } = req.body;

    try {
        const usuarioActualizado = await PerfilModelo.actualizarPerfil(id, nombre, telefono, contrasenia);
        
        if (usuarioActualizado) {
            res.json({ exito: true, usuario: usuarioActualizado });
        } else {
            res.status(404).json({ exito: false, mensaje: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        res.status(500).json({ exito: false, mensaje: 'Error interno al guardar' });
    }
};

module.exports = { modificarPerfil };