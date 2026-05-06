const PrestamosModelo = require('./prestamos.modelo');

const listarPrestamos = async (req, res) => {
    try {
        const registros = await PrestamosModelo.obtenerPrestamos(req.query.gestion);
        res.json(registros);
    } catch (error) { res.status(500).json({ error: 'Error interno' }); }
};

const crearPrestamo = async (req, res) => {
    try {
        const nuevoPrestamo = await PrestamosModelo.guardarPrestamo(req.body);
        res.json({ exito: true, registro: nuevoPrestamo });
    } catch (error) { res.status(500).json({ error: 'Error al guardar el préstamo' }); }
};

const marcarDevuelto = async (req, res) => {
    try {
        const { id } = req.params;
        const { usuario_id } = req.body;
        const registroActualizado = await PrestamosModelo.registrarDevolucionFisica(id, usuario_id);
        res.json({ exito: true, registro: registroActualizado });
    } catch (error) { res.status(500).json({ error: 'Error al registrar devolución' }); }
};

const borrarPrestamo = async (req, res) => {
    try {
        await PrestamosModelo.eliminarPrestamo(req.params.id);
        res.json({ exito: true, mensaje: 'Eliminado' });
    } catch (error) { res.status(500).json({ error: 'Error al eliminar' }); }
};

module.exports = { listarPrestamos, crearPrestamo, marcarDevuelto, borrarPrestamo };