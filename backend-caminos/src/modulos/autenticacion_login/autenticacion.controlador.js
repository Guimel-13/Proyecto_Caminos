const AuthModelo = require('./autenticacion.modelo');

// 1. FUNCIÓN PARA ENTRAR (ENCENDER LUZ VERDE)
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const usuarios = await AuthModelo.buscarUsuario(username, password);

        if (usuarios.length > 0) {
            const usuarioEncontrado = usuarios[0];
            
            // 🪄 MAGIA NUEVA: Le decimos al modelo que cambie el estado a true (Conectado)
            await AuthModelo.cambiarEstadoLinea(usuarioEncontrado.id, true);

            res.json({ exito: true, usuario: usuarioEncontrado });
        } else {
            res.status(401).json({ exito: false, mensaje: 'Usuario o contraseña incorrectos' });
        }
    } catch (err) {
        console.error("Error en el login:", err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// 2. NUEVA FUNCIÓN PARA SALIR (APAGAR LUZ VERDE)
const logout = async (req, res) => {
    const { id } = req.body;
    try {
        if(id) {
            await AuthModelo.cambiarEstadoLinea(id, false);
        }
        res.json({ exito: true, mensaje: 'Sesión cerrada' });
    } catch (err) {
        console.error("Error en el logout:", err.message);
        res.status(500).json({ error: 'Error interno' });
    }
};

// Exportamos ambas funciones
module.exports = { login, logout };