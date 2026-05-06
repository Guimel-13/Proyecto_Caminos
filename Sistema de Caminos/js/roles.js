// =========================================================
// MÓDULO FRONTEND - CONFIGURACIÓN DE ROLES (CRUD COMPLETO)
// =========================================================

let rolesRegistrados = [];

async function cargarTablaRoles() {
    const tbody = document.getElementById('cuerpo-tabla-roles');
    if(!tbody) return;

    tbody.innerHTML = `<tr><td colspan="11" class="p-4 text-center text-slate-400"><i class="fas fa-spinner fa-spin mr-2"></i> Cargando roles dende PostgreSQL...</td></tr>`;

    try {
        const respuesta = await fetch('http://192.168.1.12:3000/api/roles');
        rolesRegistrados = await respuesta.json();

        if (rolesRegistrados.length === 0) {
            tbody.innerHTML = `<tr><td colspan="11" class="p-4 text-center text-slate-500 font-bold">Non hai roles rexistrados.</td></tr>`;
            return;
        }

        let html = '';
        rolesRegistrados.forEach(rol => {
            const esAdmin = rol.nombre_rol.toLowerCase().includes('admin');
            html += `
            <tr class="hover:bg-slate-800/80 transition-colors">
                <td class="p-4 text-accent font-bold">${rol.id}</td>
                <td class="p-4 font-bold text-white">
                    ${esAdmin ? '<span class="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-[10px] uppercase tracking-widest mr-2"><i class="fas fa-star"></i></span>' : ''}
                    ${rol.nombre_rol}
                </td>
                <td class="p-4 text-center"><input type="checkbox" ${rol.permiso_leer ? 'checked' : ''} onclick="return false;" class="w-4 h-4 accent-blue-500 cursor-default"></td>
                <td class="p-4 text-center"><input type="checkbox" ${rol.permiso_crear ? 'checked' : ''} onclick="return false;" class="w-4 h-4 accent-blue-500 cursor-default"></td>
                <td class="p-4 text-center"><input type="checkbox" ${rol.permiso_editar ? 'checked' : ''} onclick="return false;" class="w-4 h-4 accent-blue-500 cursor-default"></td>
                <td class="p-4 text-center"><input type="checkbox" ${rol.permiso_eliminar ? 'checked' : ''} onclick="return false;" class="w-4 h-4 accent-red-500 cursor-default"></td>
                <td class="p-4 text-center"><input type="checkbox" ${rol.permiso_pdf ? 'checked' : ''} onclick="return false;" class="w-4 h-4 accent-blue-500 cursor-default"></td>
                <td class="p-4 text-center"><input type="checkbox" ${rol.permiso_prestar ? 'checked' : ''} onclick="return false;" class="w-4 h-4 accent-blue-500 cursor-default"></td>
                
                <td class="p-4 text-center"><input type="checkbox" ${rol.permiso_admin_usuarios ? 'checked' : ''} onclick="return false;" class="w-4 h-4 accent-emerald-500 cursor-default"></td>
                <td class="p-4 text-center"><input type="checkbox" ${rol.permiso_admin_gestiones ? 'checked' : ''} onclick="return false;" class="w-4 h-4 accent-emerald-500 cursor-default"></td>
                
                <td class="p-4 text-center sticky right-0 bg-darkcard shadow-[-5px_0_10px_rgba(0,0,0,0.1)]">
                    <div class="flex items-center justify-center gap-2">
                        <button onclick="prepararEdicionRol(${rol.id})" class="w-8 h-8 rounded flex items-center justify-center bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-colors"><i class="fas fa-edit"></i></button>
                        ${esAdmin ? '' : `<button onclick="eliminarRolBD(${rol.id})" class="w-8 h-8 rounded flex items-center justify-center bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"><i class="fas fa-trash"></i></button>`}
                    </div>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="11" class="p-4 text-center text-red-400">Error de conexión ao cargar roles.</td></tr>`;
    }
}

// ---------------------------------------------------------
// FUNCIONES DEL FORMULARIO Y MODAL
// ---------------------------------------------------------

function limpiarFormularioRol() {
    document.getElementById('rol_id_oculto').value = '';
    document.getElementById('rol_nombre').value = '';
    document.getElementById('rol_descripcion').value = '';
    
    document.getElementById('rol_p_leer').checked = false;
    document.getElementById('rol_p_crear').checked = false;
    document.getElementById('rol_p_editar').checked = false;
    document.getElementById('rol_p_eliminar').checked = false;
    document.getElementById('rol_p_pdf').checked = false;
    document.getElementById('rol_p_prestar').checked = false;
    document.getElementById('rol_p_admin_usr').checked = false;
    document.getElementById('rol_p_admin_gest').checked = false;
}

function abrirModalRol(esEdicion = false) {
    const modal = document.getElementById('modalRol');
    const tarjeta = document.getElementById('modalRolContent');
    const titulo = document.getElementById('tituloModalRol');
    
    if(!esEdicion) {
        limpiarFormularioRol();
        if(titulo) titulo.innerHTML = '<i class="fas fa-shield-alt text-accent"></i> Crear Nuevo Rol';
    } else {
        if(titulo) titulo.innerHTML = '<i class="fas fa-edit text-blue-400"></i> Editar Rol';
    }

    modal.classList.remove('hidden');
    setTimeout(() => {
        tarjeta.classList.remove('scale-95', 'opacity-0');
        tarjeta.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function cerrarModalRol() {
    const modal = document.getElementById('modalRol');
    const tarjeta = document.getElementById('modalRolContent');
    tarjeta.classList.remove('scale-100', 'opacity-100');
    tarjeta.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

function prepararEdicionRol(id) {
    const rol = rolesRegistrados.find(r => r.id === id);
    if(!rol) return;

    document.getElementById('rol_id_oculto').value = rol.id;
    document.getElementById('rol_nombre').value = rol.nombre_rol;
    document.getElementById('rol_descripcion').value = rol.descripcion || '';
    
    document.getElementById('rol_p_leer').checked = rol.permiso_leer;
    document.getElementById('rol_p_crear').checked = rol.permiso_crear;
    document.getElementById('rol_p_editar').checked = rol.permiso_editar;
    document.getElementById('rol_p_eliminar').checked = rol.permiso_eliminar;
    document.getElementById('rol_p_pdf').checked = rol.permiso_pdf;
    document.getElementById('rol_p_prestar').checked = rol.permiso_prestar;
    document.getElementById('rol_p_admin_usr').checked = rol.permiso_admin_usuarios;
    document.getElementById('rol_p_admin_gest').checked = rol.permiso_admin_gestiones;

    abrirModalRol(true);
}

// ---------------------------------------------------------
// CONEXIÓN CON EL BACKEND (NODE.JS)
// ---------------------------------------------------------

async function guardarRolBD() {
    const id = document.getElementById('rol_id_oculto').value;
    const btnSubmit = document.getElementById('btnGuardarRol');
    const textoOriginal = btnSubmit.innerHTML;

    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    btnSubmit.disabled = true;

    const paquete = {
        nombre_rol: document.getElementById('rol_nombre').value,
        descripcion: document.getElementById('rol_descripcion').value,
        permisos: {
            leer: document.getElementById('rol_p_leer').checked,
            crear: document.getElementById('rol_p_crear').checked,
            editar: document.getElementById('rol_p_editar').checked,
            eliminar: document.getElementById('rol_p_eliminar').checked,
            pdf: document.getElementById('rol_p_pdf').checked,
            prestar: document.getElementById('rol_p_prestar').checked,
            admin_usuarios: document.getElementById('rol_p_admin_usr').checked,
            admin_gestiones: document.getElementById('rol_p_admin_gest').checked
        }
    };

    let url = 'http://192.168.1.12:3000/api/roles';
    let metodo = 'POST'; // Crear nuevo

    if (id !== '') {
        url = `http://192.168.1.12:3000/api/roles/${id}`;
        metodo = 'PUT'; // Editar existente
    }

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paquete)
        });

        const resultado = await respuesta.json();

        if (resultado.exito) {
            cerrarModalRol();
            await cargarTablaRoles();

            if (typeof rolesGlobales !== 'undefined') {
                rolesGlobales = [];
            }

        } else {
            alert('Error: ' + (resultado.mensaje || 'No se pudo guardar'));
        }
    } catch (error) {
        console.error("Error al guardar rol:", error);
        alert('Error de conexión con el servidor.');
    } finally {
        btnSubmit.innerHTML = textoOriginal;
        btnSubmit.disabled = false;
    }
}

async function eliminarRolBD(id) {
    if(!confirm("¿Estás seguro de que deseas eliminar este rol?")) return;

    try {
        const respuesta = await fetch(`http://192.168.1.12:3000/api/roles/${id}`, { method: 'DELETE' });
        const resultado = await respuesta.json();

        if (resultado.exito) {
            await cargarTablaRoles();

            if (typeof rolesGlobales !== 'undefined') {
                rolesGlobales = [];
            }

        } else {
            alert('Atención: ' + resultado.mensaje); // Por si está asignado a un usuario
        }
    } catch (error) {
        console.error("Error al eliminar rol:", error);
        alert('Error de conexión con el servidor.');
    }
}