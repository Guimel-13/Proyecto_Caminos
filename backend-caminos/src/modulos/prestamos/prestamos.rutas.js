const express = require('express');
const router = express.Router();
const Controlador = require('./prestamos.controlador');

router.get('/', Controlador.listarPrestamos);
router.post('/', Controlador.crearPrestamo);
router.put('/:id/devolver', Controlador.marcarDevuelto); // Ruta especial
router.delete('/:id', Controlador.borrarPrestamo);

module.exports = router;