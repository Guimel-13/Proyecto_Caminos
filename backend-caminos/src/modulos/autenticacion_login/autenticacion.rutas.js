const express = require('express');
const router = express.Router();
const AuthControlador = require('./autenticacion.controlador');

// Cuando el frontend haga un POST a esta ruta, ejecuta el controlador
router.post('/login', AuthControlador.login);

module.exports = router;