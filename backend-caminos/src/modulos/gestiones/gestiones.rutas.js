const express = require('express');
const router = express.Router();
const GestionesControlador = require('./gestiones.controlador');

// GET /api/gestiones -> Devuelve la lista
router.get('/', GestionesControlador.listarGestiones);

// POST /api/gestiones -> Crea una nueva
router.post('/', GestionesControlador.nuevaGestion);

module.exports = router;