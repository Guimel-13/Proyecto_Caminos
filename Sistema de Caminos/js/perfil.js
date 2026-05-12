// =========================================================
// MÓDULO FRONTEND - PERFIL E BARRA SUPERIOR
// =========================================================

// 1. FUNCIÓN PARA PINTAR SOLO LA BARRA DE ARRIBA (Se llama al inicio)
function pintarBarraSuperior() {
    const usuarioStr = sessionStorage.getItem('usuario_actual');
    if (!usuarioStr) return;

    const usuarioLogueado = JSON.parse(usuarioStr);
    const nombre = usuarioLogueado.nombre_completo || 'Usuario';
    const rol = usuarioLogueado.nombre_rol || 'Administrador'; 
    const esAdmin = rol.toLowerCase().includes('admin');
    
    const nombreUrl = nombre.replace(/ /g, "+");

    const lblNombre = document.getElementById('lblNombreUsuario');
    const lblNombreDrop = document.getElementById('lblNombreDropdown');
    const lblRol = document.getElementById('lblRolUsuario');
    const imgAvatar = document.getElementById('imgAvatarUsuario');
    
    if(lblNombre) lblNombre.innerText = nombre;
    if(lblNombreDrop) lblNombreDrop.innerText = nombre;
    if(imgAvatar) imgAvatar.src = `https://ui-avatars.com/api/?name=${nombreUrl}&background=A855F7&color=fff`;
    
    if(lblRol) {
        lblRol.innerText = rol;
        lblRol.className = esAdmin 
            ? "text-[10px] text-emerald-400 uppercase font-bold tracking-wider"
            : "text-[10px] text-blue-400 uppercase font-bold tracking-wider";
    }
}

// 2. FUNCIÓN PARA PINTAR LA PANTALLA GIGANTE DEL PERFIL (Se llama solo al entrar al Perfil)
function pintarPantallaPerfil() {
    const usuarioStr = sessionStorage.getItem('usuario_actual');
    if (!usuarioStr) return;

    const usuarioLogueado = JSON.parse(usuarioStr);
    const nombre = usuarioLogueado.nombre_completo || 'Usuario';
    const rol = usuarioLogueado.nombre_rol || 'Administrador'; 
    const telefono = usuarioLogueado.telefono || '';
    const username = usuarioLogueado.usuario || 'admin';
    const nombreUrl = nombre.replace(/ /g, "+");

    // Llenar inputs del formulario
    const inputNombre = document.getElementById('perfil_nombre');
    const inputTel = document.getElementById('perfil_telefono');
    const inputUsr = document.getElementById('perfil_usuario');

    if(inputNombre) inputNombre.value = nombre;
    if(inputTel) inputTel.value = telefono;
    if(inputUsr) inputUsr.value = username;
    
    // Llenar la tarjeta de presentación
    const tarjetaNombre = document.getElementById('tarjeta_nombre');
    const tarjetaRol = document.getElementById('tarjeta_rol');
    const tarjetaUsuario = document.getElementById('tarjeta_usuario');
    const tarjetaTelefono = document.getElementById('tarjeta_telefono');
    const tarjetaAvatar = document.getElementById('tarjeta_avatar');

    if(tarjetaNombre) tarjetaNombre.innerText = nombre;
    if(tarjetaRol) tarjetaRol.innerText = rol;
    if(tarjetaUsuario) tarjetaUsuario.innerHTML = `<i class="fas fa-user-shield mr-1"></i> ${username}`;
    if(tarjetaTelefono) tarjetaTelefono.innerHTML = `<i class="fas fa-phone mr-1"></i> ${telefono || 'Sin teléfono'}`;
    if(tarjetaAvatar) tarjetaAvatar.src = `https://ui-avatars.com/api/?name=${nombreUrl}&background=A855F7&color=fff&size=128`;
}

// =========================================================
// NUEVO: GUARDAR CAMBIOS EN LA BASE DE DATOS
// =========================================================
async function actualizarPerfilBD() {
    const usuarioStr = sessionStorage.getItem('usuario_actual');
    if (!usuarioStr) return;
    const usuarioLogueado = JSON.parse(usuarioStr);

    const nombre = document.getElementById('perfil_nombre').value;
    const telefono = document.getElementById('perfil_telefono').value;
    const pwdNueva = document.getElementById('perfil_pwd_nueva').value;
    const pwdConf = document.getElementById('perfil_pwd_conf').value;

    if (pwdNueva !== "" || pwdConf !== "") {
        if (pwdNueva !== pwdConf) {
            alert("❌ Las contraseñas no coinciden. Por favor, verifica.");
            return;
        }
    }

    const btn = document.getElementById('btnGuardarPerfil');
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    btn.disabled = true;

    const paquete = {
        nombre: nombre,
        telefono: telefono,
        contrasenia: pwdNueva !== "" ? pwdNueva : null
    };

    try {
        const respuesta = await fetch(`http://192.168.1.17:3000/api/perfil/${usuarioLogueado.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paquete)
        });

        const resultado = await respuesta.json();

        if (resultado.exito) {
            alert("✅ Perfil actualizado con éxito.");
            
            usuarioLogueado.nombre_completo = resultado.usuario.nombre_completo;
            usuarioLogueado.telefono = resultado.usuario.telefono;
            sessionStorage.setItem('usuario_actual', JSON.stringify(usuarioLogueado));

            document.getElementById('perfil_pwd_nueva').value = '';
            document.getElementById('perfil_pwd_conf').value = '';

            // Repintamos ambos lados
            pintarBarraSuperior();
            pintarPantallaPerfil();
        } else {
            alert("Error al actualizar: " + resultado.mensaje);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión con el servidor.");
    } finally {
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
    }
}

// =========================================================
// MENÚ DESPLEGABLE Y SESIÓN
// =========================================================
function toggleMenuPerfil() {
    const menu = document.getElementById('menuPerfilDropdown');
    if(menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        setTimeout(() => {
            menu.classList.remove('opacity-0', 'scale-95');
            menu.classList.add('opacity-100', 'scale-100');
        }, 10);
    } else {
        menu.classList.remove('opacity-100', 'scale-100');
        menu.classList.add('opacity-0', 'scale-95');
        setTimeout(() => { menu.classList.add('hidden'); }, 200);
    }
}

document.addEventListener('click', function(event) {
    const menu = document.getElementById('menuPerfilDropdown');
    const areaPerfil = event.target.closest('.relative');
    if (menu && !menu.classList.contains('hidden') && !areaPerfil) {
        menu.classList.remove('opacity-100', 'scale-100');
        menu.classList.add('opacity-0', 'scale-95');
        setTimeout(() => { menu.classList.add('hidden'); }, 200);
    }
});

async function cerrarSesion() {
    const usuarioStr = sessionStorage.getItem('usuario_actual');
    if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr);
        try {
            await fetch('http://192.168.1.17:3000/api/auth/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: usuario.id })
            });
        } catch(error) {}
    }
    sessionStorage.removeItem('sesion_caminos_activa');
    sessionStorage.removeItem('usuario_actual');
    window.location.href = 'login.html';
}