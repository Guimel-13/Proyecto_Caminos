const express = require('express');
const router = express.Router();
const Controlador = require('./c21_cip.controlador');

router.get('/', Controlador.listarRegistros);
router.post('/', Controlador.crearRegistro);
router.put('/:id', Controlador.editarRegistro);
router.delete('/:id', Controlador.borrarRegistro);

module.exports = router;