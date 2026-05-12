// =========================================================
// LÓGICA DE INICIO DE SESIÓN Y CONFIGURACIÓN INICIAL
// =========================================================

// 1. VERIFICAR EL ESTADO DEL SISTEMA AL CARGAR LA PÁGINA
window.onload = async () => {
    try {
        const respuesta = await fetch('http://192.168.1.17:3000/api/usuarios/setup/verificar');
        const datos = await respuesta.json();

        // Si el sistema dice que está vacío (requiereSetup es true)
        if (datos.requiereSetup) {
            document.getElementById('caja-setup').classList.remove('hidden');
        } else {
            // Si ya hay usuarios, mostramos el login normal
            document.getElementById('caja-login').classList.remove('hidden');
        }
    } catch (error) {
        console.error("Error conectando al servidor:", error);
        // Si el servidor está apagado, mostramos el login normal para que ahí salte tu mensaje de error
        document.getElementById('caja-login').classList.remove('hidden');
    }
};

// 2. LÓGICA DE AUTENTICACIÓN (LOGIN) - ¡Con tu efecto de carga!
async function iniciarSesion(event) {
    if(event) event.preventDefault(); 
    
    const user = document.getElementById('login_usuario').value;
    const pass = document.getElementById('login_password').value;
    const msgError = document.getElementById('msgError');
    const btnSubmit = document.querySelector('#caja-login button');

    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...';
    btnSubmit.disabled = true;

    try {
        const respuesta = await fetch('http://192.168.1.17:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass }) 
        });

        const datos = await respuesta.json();

        if (datos.exito === true) {
            // 🪄 MAGIA ANTI-FANTASMAS: Limpiamos TODO rastro del usuario anterior
            sessionStorage.clear(); 
            
            sessionStorage.setItem('sesion_caminos_activa', 'true');
            if(datos.usuario) {
                sessionStorage.setItem('usuario_actual', JSON.stringify(datos.usuario));
            }
            window.location.href = "index.html";
        } else {
            msgError.innerText = datos.mensaje || "Usuario o contraseña incorrectos.";
            msgError.classList.remove('hidden');
            document.getElementById('login_password').value = ''; 
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        msgError.innerText = "Error: El servidor Backend está apagado.";
        msgError.classList.remove('hidden');
    } finally {
        btnSubmit.innerHTML = textoOriginal;
        btnSubmit.disabled = false;
    }
}

// 3. FUNCIÓN PARA CREAR EL SÚPER ADMINISTRADOR (LA PRIMERA VEZ)
async function crearPrimerAdmin() {
    const nombre = document.getElementById('setup_nombre').value;
    const telefono = document.getElementById('setup_telefono').value;
    const usuario = document.getElementById('setup_usuario').value;
    const password = document.getElementById('setup_password').value;

    const p_leer = document.getElementById('permiso_leer').checked;
    const p_crear = document.getElementById('permiso_crear').checked;
    const p_editar = document.getElementById('permiso_editar').checked;
    const p_eliminar = document.getElementById('permiso_eliminar').checked;
    const p_pdf = document.getElementById('permiso_pdf').checked;
    const p_prestar = document.getElementById('permiso_prestar').checked;
    const p_admin_usuarios = document.getElementById('permiso_admin_usuarios').checked;
    const p_admin_gestiones = document.getElementById('permiso_admin_gestiones').checked;

    const btnSubmit = document.querySelector('#caja-setup button');

    if (!nombre || !usuario || !password) {
        alert("Por favor, llena los campos obligatorios (Nombre, Usuario y Contraseña).");
        return;
    }

    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Configurando...';
    btnSubmit.disabled = true;

    const datosNuevos = {
        nombre: nombre,
        telefono: telefono || null, 
        usuario: usuario,
        contrasenia: password,
        permisos: {
            leer: p_leer, crear: p_crear, editar: p_editar, eliminar: p_eliminar,
            pdf: p_pdf, prestar: p_prestar, admin_usuarios: p_admin_usuarios, admin_gestiones: p_admin_gestiones
        }
    };

    try {
        const respuesta = await fetch('http://192.168.1.17:3000/api/usuarios/setup/crear-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosNuevos)
        });
        
        const resultado = await respuesta.json();

        if (resultado.exito) {
            sessionStorage.clear(); // Limpiamos por si acaso
            alert("¡Sistema inicializado con éxito! Bienvenido Administrador.");
            sessionStorage.setItem('sesion_caminos_activa', 'true');
            if(resultado.admin) {
                sessionStorage.setItem('usuario_actual', JSON.stringify(resultado.admin));
            }
            window.location.href = 'login.html'; 
        } else alert(resultado.mensaje);
    } catch (error) { alert("Error al inicializar el sistema."); } 
    finally { btnSubmit.innerHTML = textoOriginal; btnSubmit.disabled = false; }
}