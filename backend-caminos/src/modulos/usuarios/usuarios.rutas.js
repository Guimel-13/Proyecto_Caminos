const express = require('express');
const router = express.Router();
const UsuariosControlador = require('./usuarios.controlador');

router.get('/', UsuariosControlador.listarUsuarios);
router.get('/setup/verificar', UsuariosControlador.verificarSetup);
router.post('/setup/crear-admin', UsuariosControlador.configurarAdmin);

// Nuevas rutas CRUD
router.post('/', UsuariosControlador.guardarUsuario);
router.put('/:id', UsuariosControlador.actualizarUsuario);
router.delete('/:id', UsuariosControlador.borrarUsuario);

module.exports = router;