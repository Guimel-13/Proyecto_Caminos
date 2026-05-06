const GestionesModelo = require('./gestiones.modelo');

const listarGestiones = async (req, res) => {
    try {
        const gestiones = await GestionesModelo.obtenerGestiones();
        res.json(gestiones);
    } catch (error) {
        console.error("Error al obtener gestiones:", error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const nuevaGestion = async (req, res) => {
    try {
        const { anio } = req.body;
        const nueva = await GestionesModelo.crearGestion(anio);
        res.json({ exito: true, gestion: nueva });
    } catch (error) {
        console.error("Error al crear gestión:", error.message);
        // Si el error es porque el año ya existe (llave primaria duplicada)
        if (error.code === '23505') {
            return res.status(400).json({ exito: false, mensaje: 'Esta gestión ya existe.' });
        }
        res.status(500).json({ exito: false, mensaje: 'Error interno al crear' });
    }
};

module.exports = { listarGestiones, nuevaGestion };