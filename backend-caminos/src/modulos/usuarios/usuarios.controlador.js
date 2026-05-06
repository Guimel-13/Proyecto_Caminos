const UsuariosModelo = require('./usuarios.modelo');

const verificarSetup = async (req, res) => {
    try {
        const total = await UsuariosModelo.contarUsuarios();
        res.json({ requiereSetup: total === 0 });
    } catch (error) {
        console.error("Error al verificar usuarios:", error.message);
        res.status(500).json({ error: 'Error interno' });
    }
};

const configurarAdmin = async (req, res) => {
    try {
        const total = await UsuariosModelo.contarUsuarios();
        if (total > 0) return res.status(403).json({ exito: false, mensaje: 'El sistema ya tiene un administrador.' });
        const nuevoAdmin = await UsuariosModelo.crearPrimerAdmin(req.body);
        res.json({ exito: true, admin: nuevoAdmin });
    } catch (error) {
        console.error("Error al crear admin:", error.message);
        res.status(500).json({ exito: false, mensaje: 'Error al configurar el sistema' });
    }
};

const listarUsuarios = async (req, res) => {
    try {
        const usuarios = await UsuariosModelo.obtenerTodosLosUsuarios();
        res.json(usuarios); 
    } catch (error) {
        console.error("Error al obtener lista de usuarios:", error.message);
        res.status(500).json({ error: 'Error interno al listar usuarios' });
    }
};

// --- NUEVO CRUD ---
const guardarUsuario = async (req, res) => {
    try {
        const nuevoUser = await UsuariosModelo.crearUsuario(req.body);
        res.json({ exito: true, usuario: nuevoUser });
    } catch (error) {
        console.error("Error al crear usuario:", error);
        if (error.code === '23505') return res.status(400).json({ exito: false, mensaje: 'El nombre de usuario ya está en uso. Elija otro.' });
        res.status(500).json({ exito: false, mensaje: 'Error al guardar el usuario' });
    }
};

const actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioActualizado = await UsuariosModelo.modificarUsuario(id, req.body);
        res.json({ exito: true, usuario: usuarioActualizado });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ exito: false, mensaje: 'Error al actualizar' });
    }
};

const borrarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        await UsuariosModelo.eliminarUsuario(id);
        res.json({ exito: true, mensaje: 'Usuario eliminado' });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ exito: false, mensaje: 'Error al eliminar' });
    }
};

module.exports = { verificarSetup, configurarAdmin, listarUsuarios, guardarUsuario, actualizarUsuario, borrarUsuario };