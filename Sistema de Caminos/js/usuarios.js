// =========================================================
// MÓDULO FRONTEND - GESTIÓN DE USUARIOS
// =========================================================

let usuariosRegistrados = [];
let rolesGlobales = []; // Guardaremos los roles aquí para usarlos en el cambio rápido

async function cargarTablaUsuarios() {
    const tbody = document.getElementById('cuerpo-tabla-usuarios');
    if(!tbody) return;

    tbody.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-slate-400"><i class="fas fa-spinner fa-spin mr-2"></i> Cargando usuarios y roles...</td></tr>`;

    try {
        // 1. Primero cargamos los roles para poder armar el "Cambio Rápido" en la tabla
        if (rolesGlobales.length === 0) {
            const resRoles = await fetch('http://192.168.1.12:3000/api/roles');
            rolesGlobales = await resRoles.json();
        }

        // 2. Cargamos los usuarios
        const respuesta = await fetch('http://192.168.1.12:3000/api/usuarios'); 
        usuariosRegistrados = await respuesta.json();

        if (usuariosRegistrados.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-slate-500 font-bold">No hay usuarios registrados en el sistema.</td></tr>`;
            return;
        }

        let html = '';
        usuariosRegistrados.forEach(user => {
            const esAdmin = user.nombre_rol && user.nombre_rol.toLowerCase().includes('admin');
            const estaConectado = user.en_linea === true;
            const textoEstado = estaConectado ? 'En Línea' : 'Desconectado';
            
            // 🪄 RESTAURADO: El Select de Cambio Rápido de Rol
            let selectRolesHTML = `<select onchange="cambioRapidoRol(${user.id}, this.value, this)" class="bg-[#0B1120] border border-slate-700 text-slate-300 px-2 py-1 rounded outline-none text-[10px] font-bold cursor-pointer hover:border-blue-500 transition-colors">`;
            rolesGlobales.forEach(r => {
                const sel = r.id === user.rol_id ? 'selected' : '';
                selectRolesHTML += `<option value="${r.id}" ${sel}>${r.nombre_rol.toUpperCase()}</option>`;
            });
            selectRolesHTML += `</select>`;

            html += `
            <tr class="hover:bg-slate-800/80 group transition-colors ${esAdmin ? 'bg-accent/5' : ''}">
                <td class="p-4 text-accent font-bold">${user.id}</td>
                <td class="p-4 text-center">
                    <div class="flex items-center justify-center gap-1.5 ${estaConectado ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'} border px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest w-fit mx-auto">
                        <span class="w-1.5 h-1.5 rounded-full ${estaConectado ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}"></span>
                        ${textoEstado}
                    </div>
                </td>
                <td class="p-4 text-center">
                    ${esAdmin ? `<span class="bg-accent text-white shadow-[0_0_10px_rgba(168,85,247,0.4)] px-3 py-1 rounded-full text-[10px] font-bold">${user.nombre_rol}</span>` : selectRolesHTML}
                </td>
                <td class="p-4 font-bold text-white">${user.nombre_completo}</td>
                <td class="p-4 text-slate-400">${user.telefono || '-'}</td>
                <td class="p-4 text-emerald-400 font-bold">${user.usuario}</td>
                
                <td class="p-4 flex items-center gap-3">
                    <span id="pwd-user-${user.id}" class="font-mono tracking-widest text-slate-500 mt-1">••••••••</span>
                    <button onclick="solicitarPasswordAdmin('pwd-user-${user.id}', '${user.contrasenia}')" title="Revelar contraseña" class="text-slate-500 hover:text-accent transition-colors">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>

                <td class="p-4 text-center sticky right-0 bg-darkcard group-hover:bg-slate-800/80 shadow-[-5px_0_10px_rgba(0,0,0,0.1)] transition-colors">
                    ${esAdmin ? 
                        '<span class="text-[10px] text-slate-500 italic">Protegido por el Sistema</span>' : 
                        `<div class="flex items-center justify-center gap-2">
                            <button onclick="prepararEdicionUsuario(${user.id})" class="w-8 h-8 rounded flex items-center justify-center bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-colors"><i class="fas fa-edit"></i></button>
                            <button onclick="confirmarEliminacionFisica(${user.id})" class="w-8 h-8 rounded flex items-center justify-center bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"><i class="fas fa-trash-alt"></i></button>
                        </div>`
                    }
                </td>
            </tr>`;
        });
        
        tbody.innerHTML = html;
        
    } catch (error) {
        console.error("Error al conectar con la API de usuarios:", error);
        tbody.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-red-400 font-bold">Error de conexión con el servidor.</td></tr>`;
    }
}

// =========================================================
// 🪄 NUEVO: CAMBIO RÁPIDO DE ROLES EN LA TABLA
// =========================================================
async function cambioRapidoRol(userId, nuevoRolId, selectElement) {
    // 1. RESTRICCIÓN: Regla de 1 solo Administrador
    const rolSeleccionado = rolesGlobales.find(r => r.id == nuevoRolId);
    if(rolSeleccionado && rolSeleccionado.nombre_rol.toLowerCase().includes('admin')) {
        const adminExistente = usuariosRegistrados.find(u => u.nombre_rol && u.nombre_rol.toLowerCase().includes('admin') && u.id != userId);
        if(adminExistente) {
            alert("⚠️ ACCESO DENEGADO: El sistema solo permite tener 1 Administrador activo.");
            cargarTablaUsuarios(); // Devolvemos el select a su estado original
            return;
        }
    }

    // Buscamos los datos actuales del usuario para no borrarlos
    const user = usuariosRegistrados.find(u => u.id == userId);
    if(!user) return;

    const datosActualizados = {
        nombre_completo: user.nombre_completo,
        telefono: user.telefono,
        usuario: user.usuario,
        rol_id: nuevoRolId
        // No enviamos contraseña para que Node.js conserve la que ya tiene
    };

    try {
        const res = await fetch(`http://192.168.1.12:3000/api/usuarios/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizados)
        });
        const result = await res.json();
        
        if(result.exito) {
            // Efecto visual verde de éxito
            selectElement.classList.add('bg-emerald-500/20', 'border-emerald-500', 'text-emerald-400');
            setTimeout(() => cargarTablaUsuarios(), 500);
        } else {
            alert('Error al cambiar rol: ' + result.mensaje);
            cargarTablaUsuarios();
        }
    } catch(e) {
        alert('Error de conexión.');
        cargarTablaUsuarios();
    }
}

// =========================================================
// FUNCIONES PARA EL MODAL Y CREACIÓN DE USUARIOS
// =========================================================

function abrirModalUsuario(esEdicion = false) {
    const modal = document.getElementById('modalUsuarios');
    const tarjeta = document.getElementById('modalUsuariosContent');

    if (esEdicion) {
        document.getElementById('tituloFormularioUsuario').innerHTML = '<i class="fas fa-user-edit text-blue-400"></i> Editar Usuario';
    } else {
        document.getElementById('tituloFormularioUsuario').innerHTML = '<i class="fas fa-user-plus text-accent"></i> Nuevo Usuario';
        if (document.getElementById('formUsuario')) {
            document.getElementById('formUsuario').reset();
            document.getElementById('usr_id_oculto').value = '';
        }
        cargarRolesParaModal();
    }

    modal.classList.remove('hidden');
    setTimeout(() => {
        tarjeta.classList.remove('scale-95', 'opacity-0');
        tarjeta.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function cerrarModalUsuario() {
    const modal = document.getElementById('modalUsuarios');
    const tarjeta = document.getElementById('modalUsuariosContent');
    tarjeta.classList.remove('scale-100', 'opacity-100');
    tarjeta.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

async function cargarRolesParaModal(rolSeleccionado = '') {
    const selectRoles = document.getElementById('modal_usuario_rol_id');
    if (!selectRoles) return;

    selectRoles.innerHTML = '<option value="">Cargando roles reales...</option>';

    try {
        const respuesta = await fetch('http://192.168.1.12:3000/api/roles');
        rolesGlobales = await respuesta.json();
    } catch (error) {
        selectRoles.innerHTML = '<option value="">❌ Error de conexión</option>';
        return;
    }

    if (!rolesGlobales || rolesGlobales.length === 0) {
        selectRoles.innerHTML = '<option value="">No hay roles creados</option>';
        return;
    }

    let htmlOpciones = '<option value="" disabled>-- Seleccione un Rol --</option>';
    rolesGlobales.forEach(rol => {
        const selected = String(rol.id) === String(rolSeleccionado) ? 'selected' : '';
        htmlOpciones += `<option value="${rol.id}" ${selected}>${rol.nombre_rol.toUpperCase()}</option>`;
    });

    selectRoles.innerHTML = htmlOpciones;

    if (!rolSeleccionado) {
        selectRoles.value = '';
    }
}

// 🪄 RESTAURADO: Validaciones Estrictas al Guardar
async function guardarUsuarioBD() {
    const idOculto = document.getElementById('usr_id_oculto').value;
    
    const nom = document.getElementById('usr_nombre_completo').value.trim();
    const tel = document.getElementById('usr_telefono').value.trim();
    const rol = document.getElementById('modal_usuario_rol_id').value;
    const usr = document.getElementById('usr_username').value.trim();
    const pwd = document.getElementById('usr_password').value.trim();

    // 1. RESTRICCIÓN: Campos Obligatorios Vacíos
    if (nom === "" || rol === "" || usr === "") {
        alert("REGISTRO DENEGADO: Los campos Nombre, Rol y Usuario son estrictamente obligatorios.");
        return;
    }
    
    if (idOculto === "" && pwd === "") {
        alert("REGISTRO DENEGADO: Un usuario nuevo no puede ser registrado sin una contraseña.");
        return;
    }

    // 2. RESTRICCIÓN: Regla de 1 Administrador
    const rolSeleccionado = rolesGlobales.find(r => r.id == rol);
    if(rolSeleccionado && rolSeleccionado.nombre_rol.toLowerCase().includes('admin')) {
         const adminExistente = usuariosRegistrados.find(u => u.nombre_rol && u.nombre_rol.toLowerCase().includes('admin') && u.id != idOculto);
         if(adminExistente) {
              alert("ACCESO DENEGADO: Ya existe un Administrador en el sistema. Seleccione un rol distinto.");
              return;
         }
    }

    const datosFormulario = {
        nombre_completo: nom, telefono: tel, rol_id: rol, usuario: usr, contrasenia: pwd
    };

    let url = 'http://192.168.1.12:3000/api/usuarios';
    let metodo = 'POST'; 

    if (idOculto !== "") {
        url = `http://192.168.1.12:3000/api/usuarios/${idOculto}`;
        metodo = 'PUT';
    }

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosFormulario)
        });

        const resultado = await respuesta.json();

        if (resultado.exito) {
            cerrarModalUsuario();
            cargarTablaUsuarios(); 
        } else {
            alert('❌ Error: ' + resultado.mensaje);
        }
    } catch (error) {
        alert('Error de conexión con el servidor.');
    }
}

async function prepararEdicionUsuario(idBuscado) {
    const user = usuariosRegistrados.find(u => u.id === idBuscado);
    if (!user) return;

    document.getElementById('usr_id_oculto').value = user.id;
    document.getElementById('usr_nombre_completo').value = user.nombre_completo;
    document.getElementById('usr_telefono').value = user.telefono || '';
    document.getElementById('usr_username').value = user.usuario;
    document.getElementById('usr_password').value = '';

    document.getElementById('tituloFormularioUsuario').innerHTML = '<i class="fas fa-user-edit text-blue-400"></i> Editar Usuario';

    await cargarRolesParaModal(user.rol_id);

    const modal = document.getElementById('modalUsuarios');
    const tarjeta = document.getElementById('modalUsuariosContent');

    modal.classList.remove('hidden');
    setTimeout(() => {
        tarjeta.classList.remove('scale-95', 'opacity-0');
        tarjeta.classList.add('scale-100', 'opacity-100');
    }, 10);
}

// =========================================================
// 🪄 RESTAURADO: CONEXIÓN CON EL MODAL DE ELIMINAR
// =========================================================
let idUsuarioAEliminar = null;

// Esta función es llamada por el botón de la Basurero en la tabla
function confirmarEliminacionFisica(id) {
    idUsuarioAEliminar = id;
    abrirModalEliminarUsuario(); // Abre tu modal rojo hermoso
}

// Esta función es llamada por el botón "Aceptar" dentro de tu modal rojo
async function ejecutarEliminacionDefinitiva() {
    if(!idUsuarioAEliminar) return;
    cerrarModalEliminarUsuario(); // Cerramos el modal visual

    try {
        const respuesta = await fetch(`http://192.168.1.12:3000/api/usuarios/${idUsuarioAEliminar}`, { method: 'DELETE' });
        const resultado = await respuesta.json();
        
        if (resultado.exito) {
            cargarTablaUsuarios(); 
        } else {
            alert('Error: ' + resultado.mensaje); 
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
        alert('Error de conexión con el servidor.');
    }
}


/* =========================================================
   LÓGICA DEL OJITO (CONTRASEÑAS)
   ========================================================= */
let idCeldaPasswordActual = '';
let passwordSecretaActual = '';

function solicitarPasswordAdmin(idCeldaSpan, pwdReal) {
    idCeldaPasswordActual = idCeldaSpan;
    passwordSecretaActual = pwdReal;
    const modal = document.getElementById('modalAuthAdmin');
    const tarjeta = document.getElementById('modalAuthContent');
    document.getElementById('inputAdminPwd').value = ''; 
    document.getElementById('errorAuthMsg').classList.add('hidden'); 
    modal.classList.remove('hidden');
    setTimeout(() => {
        tarjeta.classList.remove('scale-95', 'opacity-0');
        tarjeta.classList.add('scale-100', 'opacity-100');
        document.getElementById('inputAdminPwd').focus();
    }, 10);
}

function cerrarAuthAdmin() {
    const modal = document.getElementById('modalAuthAdmin');
    const tarjeta = document.getElementById('modalAuthContent');
    tarjeta.classList.remove('scale-100', 'opacity-100');
    tarjeta.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

function verificarPasswordAdmin() {
    const input = document.getElementById('inputAdminPwd').value;
    const errorMsg = document.getElementById('errorAuthMsg');
    
    // 1. Sacamos los datos del usuario que inició sesión desde la memoria del navegador
    const usuarioStr = sessionStorage.getItem('usuario_actual');
    const usuarioLogueado = usuarioStr ? JSON.parse(usuarioStr) : null;

    // 2. Si por algún motivo no hay sesión, cortamos la ejecución por seguridad
    if (!usuarioLogueado) {
        alert("Error de sesión: No se encontró un usuario activo.");
        return;
    }

    // 3. 🪄 LA MAGIA: Comparamos lo que escribió con SU contraseña real de la base de datos
    if(input === usuarioLogueado.contrasenia) {
        const spanContra = document.getElementById(idCeldaPasswordActual);
        spanContra.innerText = passwordSecretaActual;
        spanContra.classList.remove('text-slate-500', 'tracking-widest');
        spanContra.classList.add('text-white', 'tracking-normal');
        
        cerrarAuthAdmin();
        
        setTimeout(() => {
            spanContra.innerText = '••••••••';
            spanContra.classList.add('text-slate-500', 'tracking-widest');
            spanContra.classList.remove('text-white', 'tracking-normal');
        }, 5000);
        
    } else {
        // Si no coincide, mostramos el mensaje de error rojo en el modal
        errorMsg.classList.remove('hidden');
    }
}