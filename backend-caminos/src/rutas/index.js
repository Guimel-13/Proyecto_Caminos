const express = require('express');
const router = express.Router();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// importaciones de rutas de módulos //

// 0. Ruta del módulo Hardware (Escaneo)
const rutasHardware = require('../modulos/hardware/hardware.rutas');

// 1. Ruta del modulo autenticación Login
const rutasAuth = require('../modulos/autenticacion_login/autenticacion.rutas');

// 2. Ruta del módulo C31 CIP
const rutasC31Cip = require('../modulos/c31/cip/c31_cip.rutas');

// 3. Ruta del módulo Gestiones
const rutasGestiones = require('../modulos/gestiones/gestiones.rutas');

// 4. Ruta del módulo Usuarios
const rutasUsuarios = require('../modulos/usuarios/usuarios.rutas');

// 5. Ruta del módulo Roles
const rutasRoles = require('../modulos/configuracion_usuarios_roles/roles.rutas');

// 6. Ruta del módulo Perfil de Usuario
const rutasPerfil = require('../modulos/perfil_usuario/perfil.rutas');

// 7. Ruta del módulo C31 SIP
const rutasC31Sip = require('../modulos/c31/sip/c31_sip.rutas');

// 8. Ruta del módulo C21 CIP
const rutasC21Cip = require('../modulos/c21/cip/c21_cip.rutas');

// 9. Ruta del módulo C21 SIP
const rutasC21Sip = require('../modulos/c21/sip/c21_sip.rutas');

// 10. Ruta del modulo Asientos Manuales
const rutasAsientos = require('../modulos/asientos_manuales/asientos.rutas');

// 11. Ruta del módulo Prestamos
const rutasPrestamos = require('../modulos/prestamos/prestamos.rutas');

// 12. Ruta del módulo Registros Empastados
const rutasEmpastados = require('../modulos/empastados/empastado.ruta');


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Aquí agregamos las rutas de cada módulo

// 0. Rutas del módulo Hardware (Escaneo)
router.use('/hardware', rutasHardware);

// 1. Rutas del módulo autenticación Login
router.use('/auth', rutasAuth);

// 2. Rutas del módulo C31 CIP
router.use('/c31-cip', rutasC31Cip);

// 3. Rutas del módulo Gestiones
router.use('/gestiones', rutasGestiones);

// 4. Rutas del módulo Usuarios
router.use('/usuarios', rutasUsuarios);

// 5. Rutas del módulo Roles
router.use('/roles', rutasRoles);

// 6. Rutas del módulo Perfil de Usuario
router.use('/perfil', rutasPerfil);

// 7. Rutas del módulo C31 SIP
router.use('/c31-sip', rutasC31Sip);

// 8. Rutas del módulo C21 CIP
router.use('/c21-cip', rutasC21Cip);

// 9. Rutas del módulo C21 SIP
router.use('/c21-sip', rutasC21Sip);

// 10. Rutas del módulo Asientos Manuales
router.use('/asientos', rutasAsientos);

// 11. Rutas del módulo Prestamos
router.use('/prestamos', rutasPrestamos);

// 12. Rutas del módulo Registros Empastados
router.use('/empastados', rutasEmpastados);


module.exports = router;