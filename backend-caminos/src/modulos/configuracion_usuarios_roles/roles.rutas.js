const express = require('express');
const router = express.Router();
const RolesControlador = require('./roles.controlador');

router.get('/', RolesControlador.listarRoles);
router.post('/', RolesControlador.guardarRol);
router.put('/:id', RolesControlador.actualizarRol);
router.delete('/:id', RolesControlador.borrarRol);

module.exports = router;