const express = require('express');
const router = express.Router();
const AsientosControlador = require('./asientos.controlador');

// Rutas para Asientos Manuales - http://192.168.1.12:3000/api/asientos
router.get('/', AsientosControlador.listarRegistros);
router.post('/', AsientosControlador.crearRegistro);
router.put('/:id', AsientosControlador.editarRegistro);
router.delete('/:id', AsientosControlador.borrarRegistro);

module.exports = router;