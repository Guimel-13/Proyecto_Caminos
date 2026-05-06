/* =========================================================
   GUARDIÁN DE SEGURIDAD (VERIFICAR SESIÓN)
   ========================================================= */
if (sessionStorage.getItem('sesion_caminos_activa') !== 'true') {
    window.location.href = 'login.html';
}

async function cargarComponente(idContenedor, ruta) {
    try {
        const respuesta = await fetch(ruta);
        const html = await respuesta.text();
        const contenedor = document.getElementById(idContenedor);
        if (contenedor) contenedor.innerHTML = html;
    } catch (error) {
        console.error("Uy, falló al cargar " + ruta, error);
    }
}

// =========================================================
// NUEVO: EL GOBERNADOR DE PERMISOS GLOBAL
// =========================================================
function aplicarPermisosGlobales() {
    const userStr = sessionStorage.getItem('usuario_actual');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    let reglasCSS = '';

    // 1. Permiso CREAR (Oculta botones "+ Nuevo Registro")
    if (!user.permiso_crear) {
        reglasCSS += `button[onclick*="abrirModalRegistro"], button[onclick*="abrirModalAsientos"] { display: none !important; }\n`;
    }

    // 2. Permiso EDITAR (Oculta todos los botones de Lápiz en las tablas)
    if (!user.permiso_editar) {
        reglasCSS += `button[onclick*="prepararEdicion"] { display: none !important; }\n`;
    }

    // 3. Permiso ELIMINAR (Oculta todos los botones de Basurero en las tablas)
    if (!user.permiso_eliminar) {
        reglasCSS += `button[onclick*="eliminarRegistro"] { display: none !important; }\n`;
    }

    // 4. Permiso ADMIN USUARIOS Y ROLES (Oculta los botones del menú y del perfil)
    if (!user.permiso_admin_usuarios) {
        reglasCSS += `button[onclick*="navegar('usuarios'"], button[onclick*="navegar('configuracion'"] { display: none !important; }\n`;
    }

    // 5. Permiso PRÉSTAMOS
    if (!user.permiso_prestar) {
        reglasCSS += `button[onclick*="navegar('prestamos'"] { display: none !important; }\n`;
    }

    // 6. Permiso GESTIONES (Crear nuevas gestiones)
    if (!user.permiso_admin_gestiones) {
        reglasCSS += `option[value="nuevo"] { display: none !important; }\n`;
        reglasCSS += `button[onclick*="abrirModalNuevaGestion"] { display: none !important; }\n`;
    }

    // Inyectamos este "Manto Invisible" directamente en el navegador
    const styleId = 'estilos-gobernador-rbac';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = reglasCSS;

    // Limpieza visual: Ocultar los títulos (párrafos) de las secciones restringidas en el menú lateral
    setTimeout(() => {
        if (!user.permiso_admin_usuarios) {
            const btnUsr = document.querySelector(`button[onclick*="navegar('usuarios'"]`);
            if (btnUsr && btnUsr.closest('div')) btnUsr.closest('div').style.display = 'none';
        }
        if (!user.permiso_prestar) {
            const btnPrest = document.querySelector(`button[onclick*="navegar('prestamos'"]`);
            if (btnPrest && btnPrest.closest('div')) btnPrest.closest('div').style.display = 'none';
        }
    }, 200);
}

/* =========================================================
   MAPEO DE PANTALLAS A CONTENEDORES
   ========================================================= */
function obtenerContenedorPantalla(pantalla) {
    const mapa = {
        dashboard: 'caja-dashboard',

        tabla: 'caja-tabla_c31_cip',
        tabla_c31_cip: 'caja-tabla_c31_sip',

        tabla_sip: 'caja-tabla_sip',
        tabla_c31_sip: 'caja-tabla_sip',

        tabla_c21_cip: 'caja-tabla_c21_cip',
        tabla_c21_sip: 'caja-tabla_c21_sip',

        tabla_asientos_manuales: 'caja-tabla_asientos_manuales',

        gestiones: 'caja-gestiones',
        usuarios: 'caja-usuarios',
        prestamos: 'caja-prestamos',
        perfil: 'caja-perfil',
        configuracion: 'caja-configuracion',

        registros_empastados: 'caja-empastados'
    };

    return mapa[pantalla] || ('caja-' + pantalla);
}

// =========================================================
// INICIALIZADOR DE LA APP
// =========================================================
window.onload = async () => {
    // 1. Componentes Globales
    await cargarComponente('caja-menu', 'componentes_globales/menu_lateral.html');
    await cargarComponente('caja-header', 'componentes_globales/barra_superior.html');
    pintarBarraSuperior();
    
    // 🪄 APLICAMOS EL GOBERNADOR JUSTO DESPUÉS DE CARGAR EL MENÚ
    aplicarPermisosGlobales(); 

    // 2. Módulos de Registros y Tablas
    await cargarComponente('caja-dashboard', 'interfaz_c31_cip/dashboard.html');
    await cargarComponente('caja-tabla_c31_cip', 'interfaz_c31_cip/tabla_registros.html');
    await cargarComponente('caja-tabla_c31_sip', 'interfaz_c31_sip/tabla_registros_sip.html');
    await cargarComponente('caja-tabla_c21_cip', 'interfaz_c21_cip/tabla_registros_c21_cip.html');
    await cargarComponente('caja-tabla_c21_sip', 'interfaz_c21_sip/tabla_registros_c21_sip.html');
    await cargarComponente('caja-tabla_asientos_manuales', 'interfaz_asientos_manuales/tabla_asientos_manuales.html');
    await cargarComponente('caja-gestiones', 'interfaz_gestiones/gestiones.html');
    await cargarComponente('caja-usuarios', 'interfaz_usuarios/tabla_usuarios.html');
    await cargarComponente('caja-prestamos', 'interfaz_prestamos/tabla_prestamos.html');
    await cargarComponente('caja-empastados', 'interfaz_empastados/tabla_empastados.html');

    // 3. Modales
    await cargarComponente('caja-modal-registro', 'interfaz_c31_cip/modal_registro.html');
    await cargarComponente('caja-modal-registro-sip', 'interfaz_c31_sip/modal_registro_sip.html');
    await cargarComponente('caja-modal-registro-c21-cip', 'interfaz_c21_cip/modal_registro_c21_cip.html');
    await cargarComponente('caja-modal-registro-c21-sip', 'interfaz_c21_sip/modal_registro_c21_sip.html');
    await cargarComponente('caja-modal-asientos-manuales', 'interfaz_asientos_manuales/modal_asientos_manuales.html');
    await cargarComponente('caja-modal-visor', 'interfaz_c31_cip/modal_visor.html');
    await cargarComponente('caja-modal-usuarios', 'interfaz_usuarios/modal_usuarios.html');
    await cargarComponente('caja-modal-auth-admin', 'interfaz_usuarios/modal_auth_admin.html');
    await cargarComponente('caja-modal-eliminar-usuario', 'interfaz_usuarios/modal_eliminar_usuario.html');
    await cargarComponente('caja-modal-prestamos', 'interfaz_prestamos/modales_prestamos.html');
    await cargarComponente('caja-perfil', 'interfaz_perfil/mi_perfil.html');
    await cargarComponente('caja-configuracion', 'interfaz_configuracion/configuracion.html');
    await cargarComponente('caja-modal-gestion', 'interfaz_gestiones/modal_gestion.html');
    await cargarComponente('caja-modal-empastados', 'interfaz_empastados/modal_empastados.html');

    setTimeout(() => {
        document.querySelectorAll('.menu-btn').forEach(btn => {
            const accion = btn.getAttribute('onclick') || '';
            if(!accion.includes('dashboard') && !accion.includes('usuarios') && !accion.includes('gestiones')) {
                btn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        });

        const btnDashboard = document.querySelector('.menu-btn[onclick*="dashboard"]');
        if(btnDashboard) navegar('dashboard', btnDashboard);
    }, 150);
};

// =========================================================
// ENRUTADOR Y BARRERAS DE SEGURIDAD
// =========================================================
function abrirModalAccesoDenegado() {
    const modal = document.getElementById('modalAccesoDenegado');
    const tarjeta = document.getElementById('modalAccesoDenegadoContent');
    modal.classList.remove('hidden');
    setTimeout(() => {
        tarjeta.classList.remove('scale-95', 'opacity-0');
        tarjeta.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function cerrarModalAccesoDenegado() {
    const modal = document.getElementById('modalAccesoDenegado');
    const tarjeta = document.getElementById('modalAccesoDenegadoContent');
    tarjeta.classList.remove('scale-100', 'opacity-100');
    tarjeta.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

function navegar(pantalla, btn) {
    const userStr = sessionStorage.getItem('usuario_actual');
    const user = userStr ? JSON.parse(userStr) : {};

    // 🛡️ BARRERA DE SEGURIDAD FUERTE (Por si alguien intenta forzar la función)
    if (pantalla === 'usuarios' && !user.permiso_admin_usuarios) return alert('⛔ Acceso denegado: Necesitas permisos de Administrador.');
    if (pantalla === 'configuracion' && !user.permiso_admin_usuarios) return alert('⛔ Acceso denegado: Necesitas permisos de Administrador.');
    if (pantalla === 'prestamos' && !user.permiso_prestar) return alert('⛔ Acceso denegado.');

    if (window.gestionAbierta !== true && !['dashboard', 'usuarios', 'gestiones', 'perfil', 'configuracion'].includes(pantalla)) {
        abrirModalAccesoDenegado();
        return; 
    }

    const buscador = document.getElementById('buscadorGlobal');
    if(buscador) buscador.value = ''; 

    const contenedores = [
        'caja-dashboard', 
        'caja-tabla_c31_cip', 
        'caja-tabla_c31_sip', 
        'caja-tabla_c21_cip', 
        'caja-tabla_c21_sip', 
        'caja-tabla_asientos_manuales', 
        'caja-gestiones', 
        'caja-usuarios', 
        'caja-prestamos', 
        'caja-perfil', 
        'caja-configuracion', 
        'caja-empastados'
    ];
    
    contenedores.forEach(id => {
        const div = document.getElementById(id);
        if (div) div.classList.add('hidden');
    });
    
    document.querySelectorAll('.seccion').forEach(sec => sec.classList.remove('activa'));
    
    const contenedorElegido = document.getElementById('caja-' + pantalla);
    if(contenedorElegido) {
        contenedorElegido.classList.remove('hidden');
        const seccionInterna = contenedorElegido.querySelector('.seccion');
        if(seccionInterna) seccionInterna.classList.add('activa');
        
        if(['dashboard', 'gestiones'].includes(pantalla) && typeof cargarGestionesDesdeBD === 'function') cargarGestionesDesdeBD();
        if(pantalla === 'configuracion' && typeof cargarTablaRoles === 'function') cargarTablaRoles();
        if(pantalla === 'perfil' && typeof pintarPantallaPerfil === 'function') pintarPantallaPerfil();
        if(pantalla === 'usuarios' && typeof cargarTablaUsuarios === 'function') cargarTablaUsuarios();
        
        if(pantalla === 'tabla_c31_cip' && typeof cargarTablaC31Cip === 'function') cargarTablaC31Cip();
        if(pantalla === 'tabla_c31_sip' && typeof cargarTablaC31Sip === 'function') cargarTablaC31Sip();
        if(pantalla === 'tabla_c21_cip' && typeof cargarTablaC21Cip === 'function') cargarTablaC21Cip();
        if(pantalla === 'tabla_c21_sip' && typeof cargarTablaC21Sip === 'function') cargarTablaC21Sip();
        if(pantalla === 'tabla_asientos_manuales' && typeof cargarTablaAsientos === 'function') cargarTablaAsientos();
        if(pantalla === 'prestamos' && typeof cargarTablaPrestamos === 'function') cargarTablaPrestamos();
        if(pantalla === 'empastados' && typeof inicializarVistaEmpastados === 'function') inicializarVistaEmpastados();
    }
    
    document.querySelectorAll('.menu-btn').forEach(b => {
        b.classList.remove('bg-accent', 'text-white', 'shadow-[0_0_15px_rgba(168,85,247,0.4)]');
        b.classList.add('text-slate-400');
    });
    
    if(btn) {
        btn.classList.add('bg-accent', 'text-white', 'shadow-[0_0_15px_rgba(168,85,247,0.4)]');
        btn.classList.remove('text-slate-400');
    }
}

function ejecutarBusquedaGlobal() {
    const cajaC31 = document.getElementById('caja-tabla_c31_cip');
    if (cajaC31 && !cajaC31.classList.contains('hidden')) if (typeof buscarEnC31 === 'function') buscarEnC31();

    const cajaSip = document.getElementById('caja-tabla_c31_sip');
    if (cajaSip && !cajaSip.classList.contains('hidden')) if (typeof buscarEnSip === 'function') buscarEnSip();

    const cajaC21Cip = document.getElementById('caja-tabla_c21_cip');
    if (cajaC21Cip && !cajaC21Cip.classList.contains('hidden')) if (typeof buscarEnC21Cip === 'function') buscarEnC21Cip();

    const cajaC21Sip = document.getElementById('caja-tabla_c21_sip');
    if (cajaC21Sip && !cajaC21Sip.classList.contains('hidden')) if (typeof buscarEnC21Sip === 'function') buscarEnC21Sip();

    const cajaAsientos = document.getElementById('caja-tabla_asientos_manuales');
    if (cajaAsientos && !cajaAsientos.classList.contains('hidden')) if (typeof buscarEnAsientos === 'function') buscarEnAsientos();
}

function cargarDoc(nombre, rutaArchivo) {
    const modal = document.getElementById('modalVisor');
    const tarjeta = document.getElementById('modalVisorContent');

    if (!rutaArchivo || rutaArchivo === 'null' || rutaArchivo === 'undefined') {
        alert("⚠️ Este registro aún no tiene un documento escaneado o adjunto.");
        return;
    }

    document.getElementById('tituloDocModal').innerHTML = `<i class="fas fa-file-pdf text-red-400 mr-2"></i> Viendo: ${nombre}`;
    document.getElementById('visorPdfModal').src = `http://192.168.1.12:3000/${rutaArchivo}?t=${Date.now()}`;

    modal.classList.remove('hidden');
    setTimeout(() => {
        tarjeta.classList.remove('scale-95', 'opacity-0');
        tarjeta.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function cerrarVisor() {
    const modal = document.getElementById('modalVisor');
    const tarjeta = document.getElementById('modalVisorContent');
    tarjeta.classList.remove('scale-100', 'opacity-100');
    tarjeta.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { modal.classList.add('hidden'); document.getElementById('visorPdfModal').src = ""; }, 300);
}

function cerrarSesion() {
    const userStr = sessionStorage.getItem('usuario_actual');
    if (userStr) {
        const user = JSON.parse(userStr);
        fetch('http://192.168.1.12:3000/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: user.id })
        }).then(() => {
            sessionStorage.clear(); 
            window.location.href = 'login.html';
        }).catch(() => {
            sessionStorage.clear(); 
            window.location.href = 'login.html';
        });
    } else {
        sessionStorage.clear(); 
        window.location.href = 'login.html';
    }
}

function pintarBarraSuperior() {
    const userStr = sessionStorage.getItem('usuario_actual');
    if(userStr) {
        const user = JSON.parse(userStr);
        const labelNombre = document.getElementById('lblNombreUsuario');
        const labelRol = document.getElementById('lblRolUsuario');
        const labelNombreDropdown = document.getElementById('lblNombreDropdown');
        const imgAvatar = document.getElementById('imgAvatarUsuario');
        
        if(labelNombre) labelNombre.innerText = user.nombre_completo || 'Usuario';
        if(labelNombreDropdown) labelNombreDropdown.innerText = user.nombre_completo || 'Usuario';
        
        if(labelRol) {
            const nombreRolBD = user.nombre_rol; // esto ya no se que hace falta pero lo dejo por si acaso, por si en algún momento se necesita el nombre del rol para algo más aparte de mostrarlo en la barra superior
            const esAdmin = nombreRolBD.toLowerCase().includes('admin');
            const colorRol = esAdmin ? 'text-accent' : 'text-emerald-400';
            labelRol.className = `text-[10px] uppercase font-bold tracking-wider ${colorRol}`;
            labelRol.innerText = nombreRolBD;
        }

        if(imgAvatar) {
            const nombreParaAvatar = encodeURIComponent(user.nombre_completo || 'U');
            imgAvatar.src = `https://ui-avatars.com/api/?name=${nombreParaAvatar}&background=151C2C&color=A855F7&bold=true`;
        }
    }
}

function toggleMenuPerfil() {
    const menu = document.getElementById('menuPerfilDropdown');
    if(menu) {
        if(menu.classList.contains('hidden')) {
            menu.classList.remove('hidden');
            setTimeout(() => {
                menu.classList.remove('opacity-0', 'scale-95');
                menu.classList.add('opacity-100', 'scale-100');
            }, 10);
        } else {
            menu.classList.remove('opacity-100', 'scale-100');
            menu.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                menu.classList.add('hidden');
            }, 200);
        }
    }
}

function resaltarTexto(texto, busqueda) {
    if (!texto) return '-';
    if (!busqueda) return texto; 
    const busquedaLimpia = busqueda.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${busquedaLimpia})`, 'gi');
    return String(texto).replace(regex, '<mark class="bg-accent/60 text-white rounded px-1">$1</mark>');
}