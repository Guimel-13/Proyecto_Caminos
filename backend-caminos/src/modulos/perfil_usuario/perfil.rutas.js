const express = require('express');
const router = express.Router();
const PerfilControlador = require('./perfil.controlador');

// Ruta para actualizar los datos de un usuario por su ID
router.put('/:id', PerfilControlador.modificarPerfil);

module.exports = router;