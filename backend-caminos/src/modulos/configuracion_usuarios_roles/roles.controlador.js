const RolesModelo = require('./roles.modelo');

const listarRoles = async (req, res) => {
    try {
        const roles = await RolesModelo.obtenerRoles();
        res.json(roles);
    } catch (error) {
        console.error("Error al obtener roles:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const guardarRol = async (req, res) => {
    try {
        const nuevoRol = await RolesModelo.crearRol(req.body);
        res.json({ exito: true, rol: nuevoRol });
    } catch (error) {
        console.error("Error al crear rol:", error);
        res.status(500).json({ exito: false, mensaje: 'Error al guardar el rol' });
    }
};

const actualizarRol = async (req, res) => {
    try {
        const { id } = req.params;
        const rolActualizado = await RolesModelo.modificarRol(id, req.body);
        res.json({ exito: true, rol: rolActualizado });
    } catch (error) {
        console.error("Error al actualizar rol:", error);
        res.status(500).json({ exito: false, mensaje: 'Error al actualizar el rol' });
    }
};

const borrarRol = async (req, res) => {
    try {
        const { id } = req.params;
        await RolesModelo.eliminarRol(id);
        res.json({ exito: true, mensaje: 'Rol eliminado' });
    } catch (error) {
        console.error("Error al eliminar rol:", error);
        // El error 23503 es cuando intentas borrar un rol que ya está asignado a un usuario
        if (error.code === '23503') {
            return res.status(400).json({ exito: false, mensaje: 'No se puede eliminar este rol porque hay usuarios usándolo.' });
        }
        res.status(500).json({ exito: false, mensaje: 'Error al eliminar el rol' });
    }
};

module.exports = { listarRoles, guardarRol, actualizarRol, borrarRol };