const express = require('express');
const router = express.Router();
const empastadoControlador = require('./empastado_controlador');

router.get('/:tipo', empastadoControlador.listarEmpastados);
router.get('/:tipo/:id', empastadoControlador.obtenerEmpastado);
router.post('/:tipo', empastadoControlador.guardarEmpastado);
router.put('/:tipo/:id', empastadoControlador.actualizarEmpastado);
router.delete('/:tipo/:id', empastadoControlador.eliminarEmpastado);

module.exports = router;