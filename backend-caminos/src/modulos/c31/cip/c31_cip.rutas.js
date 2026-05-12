const express = require('express');
const router = express.Router();
const C31Controlador = require('./c31_cip.controlador');


// Rutas para C31 CIP - http://192.168.1.17:3000/api/c31-cip

// Cuando el frontend pida los datos para mostrar la tabla (GET)
router.get('/', C31Controlador.listarRegistros);

// Cuando el frontend quiera crear un nuevo registro (POST)
router.post('/', C31Controlador.crearRegistro);

// Cuando el frontend quiera editar un registro existente (PUT)
router.put('/:id', C31Controlador.editarRegistro);

// Cuando el frontend quiera eliminar un registro (DELETE)
router.delete('/:id', C31Controlador.borrarRegistro);
module.exports = router;