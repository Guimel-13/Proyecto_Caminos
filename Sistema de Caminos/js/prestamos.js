/* =========================================================
   MÓDULO FRONTEND - PRÉSTAMOS DE DOCUMENTOS
   ========================================================= */

let listaPrestamos = [];

async function cargarTablaPrestamos() {
    const tbody = document.getElementById('body-tabla-prestamos');
    if (!tbody) return;

    const gestionActiva = document.getElementById('gestionGlobal').value;
    tbody.innerHTML = `<tr><td colspan="9" class="p-4 text-center text-slate-400"><i class="fas fa-spinner fa-spin mr-2"></i> Cargando historial de préstamos...</td></tr>`;

    try {
        const respuesta = await fetch(`http://192.168.1.12:3000/api/prestamos?gestion=${gestionActiva}`);
        listaPrestamos = await respuesta.json();
        renderizarTablaPrestamos(listaPrestamos);
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="9" class="p-4 text-center text-red-400 font-bold">Error al conectar con la base de datos.</td></tr>`;
    }
}

function renderizarTablaPrestamos(datos) {
    const tbody = document.getElementById('body-tabla-prestamos');
    if (datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="p-4 text-center text-slate-500 font-bold">No hay préstamos registrados.</td></tr>`;
        return;
    }

    let html = '';
    datos.forEach(reg => {
        const esPendiente = reg.estado === 'pendiente';
        const formatFecha = (isoString) => isoString ? new Date(isoString).toLocaleDateString('es-ES', {timeZone: 'UTC'}) : '--/--/----';
        const filaClase = esPendiente ? 'bg-red-500/5 pendiente' : 'devuelto';
        
        const estadoHTML = esPendiente 
            ? `<span class="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest"><i class="fas fa-clock mr-1"></i> Pendiente</span>`
            : `<span class="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest"><i class="fas fa-check-double mr-1"></i> Devuelto</span>`;

        const accionHTML = esPendiente
            ? `<div class="flex gap-2">
                 <button onclick="ejecutarDevolucionBD(${reg.id})" title="Marcar como Devuelto" class="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors w-full"><i class="fas fa-check mr-1"></i> Devolver</button>
                 <button onclick="eliminarPrestamoBD(${reg.id})" title="Eliminar Registro" class="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 px-2 py-1.5 rounded-lg transition-colors"><i class="fas fa-trash"></i></button>
               </div>`
            : `<div class="flex gap-2 justify-center items-center">
                 <span class="text-[10px] text-slate-500 font-bold"><i class="fas fa-lock mr-1"></i> Cerrado</span>
                 <button onclick="eliminarPrestamoBD(${reg.id})" title="Eliminar Registro" class="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 px-2 py-1.5 rounded-lg transition-colors ml-2"><i class="fas fa-trash"></i></button>
               </div>`;

        html += `
        <tr class="fila-prestamo hover:bg-slate-800/80 transition-colors ${filaClase}">
            <td class="p-4 text-accent font-bold align-top">${reg.correlativo || reg.id}</td>
            <td class="p-4 text-center align-top">${estadoHTML}</td>
            <td class="p-4 align-top font-bold text-white">${formatFecha(reg.fecha_prestamo)}</td>
            <td class="p-4 align-top">
                <p class="font-bold text-white">${reg.nombre_completo}</p>
                <p class="text-[10px] text-slate-500">${reg.unidad_solicitante}</p>
            </td>
            <td class="p-4 align-top">
                <p class="font-bold text-accent">${reg.tipo_documento}</p>
                <p class="text-[10px] text-slate-400">Gestión: ${reg.gestion_documento} | Cód: ${reg.codigo_doc}</p>
            </td>
            <td class="p-4 align-top w-48 group/celda cursor-ns-resize">
                <div class="text-slate-400 transition-all duration-500 ease-in-out max-h-5 overflow-hidden group-hover/celda:max-h-40 whitespace-normal break-words">
                    ${reg.detalle_glosa}
                </div>
            </td>
            <td class="p-4 align-top text-red-400 font-bold">${formatFecha(reg.fecha_limite)}</td>
            <td class="p-4 align-top text-emerald-400 font-bold">${esPendiente ? '--/--/----' : formatFecha(reg.fecha_de_devolucion)}</td>
            <td class="p-4 align-top text-center sticky right-0 bg-darkcard shadow-[-5px_0_10px_rgba(0,0,0,0.1)]">
                ${accionHTML}
            </td>
        </tr>`;
    });

    tbody.innerHTML = html;
}

// =========================================================
// 🪄 LA NUEVA MAGIA: BÚSQUEDA AVANZADA EN LA BD
// =========================================================

// Esta función es un "Resaltador Local" en caso de que no esté cargado c31_cip.js
function pintarCoincidencia(texto, busqueda) {
    if (!texto) return '-';
    if (!busqueda) return texto;
    const busquedaLimpia = busqueda.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${busquedaLimpia})`, 'gi');
    return String(texto).replace(regex, '<mark class="bg-accent/60 text-white rounded px-1">$1</mark>');
}

async function ejecutarBusquedaAvanzada() {
    const docGestion = document.getElementById('bp-gestion').value;
    const docTipo = document.getElementById('bp-tipo').value;
    
    const filtroNumero = document.getElementById('bp-numero').value.trim().toLowerCase();
    const filtroImporte = document.getElementById('bp-importe').value.trim();
    const filtroDetalle = document.getElementById('bp-detalle').value.trim().toLowerCase();

    if(!docGestion) return alert("La gestión es obligatoria para buscar.");

    const divResultado = document.getElementById('resultadoBusquedaPrestamo');
    const tbody = document.getElementById('tbody-resultados-busqueda');
    
    divResultado.classList.remove('hidden');
    // Asegurarse de que el spinner ocupe todas las columnas. Usamos un colspan alto.
    tbody.innerHTML = `<tr><td colspan="15" class="p-4 text-center text-slate-400"><i class="fas fa-spinner fa-spin mr-2"></i> Buscando en el archivo...</td></tr>`;

    let endpoint = '';
    if (docTipo === 'C-31 CIP') endpoint = 'c31-cip';
    else if (docTipo === 'C-31 SIP') endpoint = 'c31-sip';
    else if (docTipo === 'C-21 ER CIP') endpoint = 'c21-cip';
    else if (docTipo === 'C-21 ER SIP') endpoint = 'c21-sip';
    else if (docTipo === 'Asiento Manual') endpoint = 'asientos';

    try {
        const res = await fetch(`http://192.168.1.12:3000/api/${endpoint}?gestion=${docGestion}`);
        const datos = await res.json();

        const filtrados = datos.filter(reg => {
            let pasaNumero = true;
            let pasaImporte = true;
            let pasaDetalle = true;

            const todosLosNumeros = String(reg.correlativo || '') + ' ' + String(reg.n_preventivo || '') + ' ' + String(reg.n_devengado || '') + ' ' + String(reg.n_documento || '') + ' ' + String(reg.sip_sin_imputacion_presupuestaria || '');
            
            if (filtroNumero) pasaNumero = todosLosNumeros.toLowerCase().includes(filtroNumero);
            if (filtroImporte) pasaImporte = Number(reg.importe || reg.importe_total) === Number(filtroImporte); // Ojo con importe_total en asientos
            if (filtroDetalle) {
                const todoElDetalle = String(reg.detalle_resumen || '') + ' ' + String(reg.detalle_glosa || '');
                pasaDetalle = todoElDetalle.toLowerCase().includes(filtroDetalle);
            }

            return pasaNumero && pasaImporte && pasaDetalle;
        });

        if (filtrados.length === 0) {
            tbody.innerHTML = `<tr><td colspan="15" class="p-4 text-center text-red-400 font-bold">No se encontraron documentos con esos criterios.</td></tr>`;
            return;
        }

        let html = '';
        filtrados.forEach(reg => {
            const codVisible = reg.correlativo ? String(reg.correlativo).padStart(3, '0') : reg.id;
            const numPrincipal = reg.n_preventivo || reg.n_devengado || reg.n_documento || reg.sip_sin_imputacion_presupuestaria || codVisible;
            const detalleReal = reg.detalle_resumen || reg.detalle_glosa || 'Sin detalle';
            
            const htmlDetalle = pintarCoincidencia(detalleReal, filtroDetalle);
            
            // Construcción dinámica de la fila según el TIPO DE DOCUMENTO
            html += `<tr class="hover:bg-slate-800/80 transition-colors group">`;
            
            // Columnas comunes al principio
            html += `<td class="p-4 text-accent font-bold">${reg.id}</td>`;
            html += `<td class="p-4">${codVisible}</td>`;
            html += `<td class="p-4">${reg.gestion}</td>`;

            // Columnas específicas por tipo
            if (docTipo === 'C-31 CIP') {
                html += `<td class="p-4 font-bold text-white">${reg.beneficiario || 'N/A'}</td>`;
                html += `<td class="p-4 text-slate-300 truncate max-w-[200px]" title="${detalleReal}">${htmlDetalle}</td>`;
                html += `<td class="p-4 text-emerald-400">${pintarCoincidencia(reg.n_preventivo, filtroNumero)}</td>`;
                html += `<td class="p-4">${reg.n_compromiso || '-'}</td>`;
                html += `<td class="p-4">${reg.n_devengado || '-'}</td>`;
                html += `<td class="p-4">${reg.secuencia || '-'}</td>`;
                html += `<td class="p-4 text-emerald-400 font-bold text-right">${reg.importe || '0.00'}</td>`;
            } 
            else if (docTipo === 'C-31 SIP') {
                html += `<td class="p-4 font-bold text-white">${reg.beneficiario || 'N/A'}</td>`;
                html += `<td class="p-4 text-slate-300 truncate max-w-[200px]" title="${detalleReal}">${htmlDetalle}</td>`;
                html += `<td class="p-4 text-emerald-400">${pintarCoincidencia(reg.n_devengado, filtroNumero)}</td>`;
                html += `<td class="p-4">${reg.n_pago || '-'}</td>`;
                html += `<td class="p-4">${reg.secuencia || '-'}</td>`;
                html += `<td class="p-4 text-emerald-400 font-bold text-right">${reg.importe || '0.00'}</td>`;
            }
            else if (docTipo === 'C-21 ER CIP') {
                html += `<td class="p-4 font-bold text-white">${reg.beneficiario || 'N/A'}</td>`;
                html += `<td class="p-4 text-slate-300 truncate max-w-[200px]" title="${detalleReal}">${htmlDetalle}</td>`;
                html += `<td class="p-4 text-emerald-400">${pintarCoincidencia(reg.n_devengado, filtroNumero)}</td>`;
                html += `<td class="p-4 text-emerald-400 font-bold text-right">${reg.importe || '0.00'}</td>`;
            }
            else if (docTipo === 'C-21 ER SIP') {
                html += `<td class="p-4 font-bold text-white">${reg.beneficiario || 'N/A'}</td>`;
                html += `<td class="p-4 text-slate-300 truncate max-w-[200px]" title="${detalleReal}">${htmlDetalle}</td>`;
                html += `<td class="p-4 text-emerald-400">${pintarCoincidencia(reg.sip_sin_imputacion_presupuestaria, filtroNumero)}</td>`;
                html += `<td class="p-4 text-emerald-400 font-bold text-right">${reg.importe || '0.00'}</td>`;
            }
            else if (docTipo === 'Asiento Manual') {
                html += `<td class="p-4 text-slate-300 truncate max-w-[200px]" title="${detalleReal}">${htmlDetalle}</td>`;
                html += `<td class="p-4 text-emerald-400">${pintarCoincidencia(reg.n_documento, filtroNumero)}</td>`;
                html += `<td class="p-4 text-emerald-400 font-bold text-right">${reg.importe_total || reg.importe || '0.00'}</td>`;
            }

            // Columnas comunes al final
            html += `<td class="p-4">${reg.fojas || '-'}</td>`; // Asientos quizás no tenga fojas, revisa tu BD
            html += `<td class="p-4">${reg.hoja_ruta || '-'}</td>`;
            html += `<td class="p-4">${reg.libro_registro || '-'}</td>`;
            html += `<td class="p-4"><span class="bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">${reg.ubicacion_fisica || 'Sin ubicar'}</span></td>`;
            
            // Botón de Acción
            html += `
                <td class="p-4 text-center sticky right-0 bg-[#0B1120] group-hover:bg-slate-800/80 transition-colors">
                    <button onclick="seleccionarParaPrestar('${docTipo}', '${docGestion}', '${numPrincipal}')" class="bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/30 px-3 py-1 rounded text-xs font-bold transition-all shadow-md">
                        <i class="fas fa-check mr-1"></i> Seleccionar
                    </button>
                </td>
            </tr>`;
        });
        
        tbody.innerHTML = html;

    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="15" class="p-4 text-center text-red-400 font-bold">Error al buscar en la Base de Datos.</td></tr>`;
    }
}


function cambiarLabelBusqueda() {
    const selector = document.getElementById('bp-tipo').value;
    const label = document.getElementById('lbl-bp-numero');
    const input = document.getElementById('bp-numero');

    // 1. Ocultar todos los thead de la tabla de resultados
    const theads = [
        'thead-c31-cip', 
        'thead-c31-sip', 
        'thead-c21-cip', 
        'thead-c21-sip', 
        'thead-asientos'
    ];
    theads.forEach(id => {
        const thead = document.getElementById(id);
        if(thead) thead.classList.add('hidden');
    });

    // 2. Limpiar la tabla actual al cambiar el tipo
    const tbody = document.getElementById('tbody-resultados-busqueda');
    if (tbody) tbody.innerHTML = '';
    const divResultado = document.getElementById('resultadoBusquedaPrestamo');
    if (divResultado) divResultado.classList.add('hidden');

    label.classList.add('opacity-50');
    setTimeout(() => {
        // 3. Mostrar el thead correspondiente y cambiar el label de búsqueda
        if (selector === 'C-31 CIP') { 
            label.innerText = 'N° Preventivo'; 
            input.placeholder = 'Ej: 1024'; 
            document.getElementById('thead-c31-cip').classList.remove('hidden');
        }
        else if (selector === 'C-31 SIP') { 
            label.innerText = 'N° Devengado'; 
            input.placeholder = 'Ej: 105'; 
            document.getElementById('thead-c31-sip').classList.remove('hidden');
        }
        else if (selector === 'C-21 ER CIP') { 
            label.innerText = 'N° Devengado'; 
            input.placeholder = 'Ej: 105'; 
            document.getElementById('thead-c21-cip').classList.remove('hidden');
        }
        else if (selector === 'C-21 ER SIP') { 
            label.innerText = 'S.I.P.'; 
            input.placeholder = 'Ej: 005-SIP'; 
            document.getElementById('thead-c21-sip').classList.remove('hidden');
        }
        else if (selector === 'Asiento Manual') { 
            label.innerText = 'N° de Documento'; 
            input.placeholder = 'Ej: DOC-9941'; 
            document.getElementById('thead-asientos').classList.remove('hidden');
        }
        
        label.classList.remove('opacity-50');
    }, 150); 
}

// 5. Esta función se ejecuta cuando le das clic a "Seleccionar" en la tabla
function seleccionarParaPrestar(tipo, gestion, codigo) {
    document.getElementById('prest_doc_gestion').value = gestion;
    document.getElementById('prest_doc_tipo').value = tipo;
    document.getElementById('prest_doc_codigo').value = codigo;

    document.getElementById('lbl-resumen-doc').innerText = `${tipo} (Cód: ${codigo}) - Gestión ${gestion}`;

    cerrarModalBusquedaPrestamo();
    setTimeout(() => { abrirModalFormularioPrestamo(); }, 350);
}


// =========================================================
// DEMÁS FUNCIONES (Cerrar/Abrir Modales, Guardar)
// =========================================================

function abrirModalBusquedaPrestamo() {
    const modal = document.getElementById('modalBusquedaPrestamo');
    const tarjeta = document.getElementById('modalBusquedaContent');
    
    document.getElementById('resultadoBusquedaPrestamo').classList.add('hidden');
    
    const gestionActual = document.getElementById('gestionGlobal');
    if(gestionActual) document.getElementById('bp-gestion').value = gestionActual.value;
    
    document.getElementById('bp-numero').value = '';
    document.getElementById('bp-importe').value = '';
    document.getElementById('bp-detalle').value = '';

    modal.classList.remove('hidden');
    setTimeout(() => {
        tarjeta.classList.remove('scale-95', 'opacity-0');
        tarjeta.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function cerrarModalBusquedaPrestamo() {
    const modal = document.getElementById('modalBusquedaPrestamo');
    const tarjeta = document.getElementById('modalBusquedaContent');
    tarjeta.classList.remove('scale-100', 'opacity-100');
    tarjeta.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

function abrirModalFormularioPrestamo() {
    const modal = document.getElementById('modalFormularioPrestamo');
    const tarjeta = document.getElementById('modalFormularioContent');
    
    document.getElementById('prest_solicitante').value = '';
    document.getElementById('prest_unidad').value = '';
    document.getElementById('prest_glosa').value = '';
    document.getElementById('prest_limite').value = '';

    modal.classList.remove('hidden');
    setTimeout(() => {
        tarjeta.classList.remove('scale-95', 'opacity-0');
        tarjeta.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function cerrarModalFormularioPrestamo() {
    const modal = document.getElementById('modalFormularioPrestamo');
    const tarjeta = document.getElementById('modalFormularioContent');
    tarjeta.classList.remove('scale-100', 'opacity-100');
    tarjeta.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

async function guardarRegistroPrestamo() {
    const usuarioLogueado = JSON.parse(sessionStorage.getItem('usuario_actual') || 'null');
    const gestionGlobalActiva = document.getElementById('gestionGlobal').value;

    const datos = {
        gestion_prestamo: parseInt(gestionGlobalActiva) || 2026,
        tipo_documento: document.getElementById('prest_doc_tipo').value,
        gestion_documento: parseInt(document.getElementById('prest_doc_gestion').value),
        codigo_doc: document.getElementById('prest_doc_codigo').value,
        
        nombre_completo: document.getElementById('prest_solicitante').value,
        unidad_solicitante: document.getElementById('prest_unidad').value,
        detalle_glosa: document.getElementById('prest_glosa').value,
        fecha_limite: document.getElementById('prest_limite').value,
        usuario_id: usuarioLogueado ? usuarioLogueado.id : null 
    };

    if (!datos.nombre_completo || !datos.unidad_solicitante || !datos.fecha_limite) {
        alert("El Nombre, la Unidad y la Fecha Límite son obligatorios.");
        return;
    }

    try {
        const respuesta = await fetch('http://192.168.1.12:3000/api/prestamos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const resultado = await respuesta.json();
        
        if (resultado.exito) {
            alert('✅ Préstamo registrado exitosamente.');
            cerrarModalFormularioPrestamo();
            cargarTablaPrestamos(); 
        } else alert('Error: ' + resultado.mensaje);
    } catch (error) { alert('Error de conexión.'); }
}

async function ejecutarDevolucionBD(id) {
    if(!confirm("¿Confirmar que el documento físico ha sido devuelto al estante?")) return;
    const usuarioLogueado = JSON.parse(sessionStorage.getItem('usuario_actual') || 'null');
    try {
        const respuesta = await fetch(`http://192.168.1.12:3000/api/prestamos/${id}/devolver`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: usuarioLogueado ? usuarioLogueado.id : null })
        });
        const resultado = await respuesta.json();
        if (resultado.exito) {
            cargarTablaPrestamos(); 
            alert('✅ Devolución registrada.');
        }
    } catch (error) { alert('Error al procesar devolución.'); }
}

async function eliminarPrestamoBD(id) {
    if(!confirm("⚠️ ¿Estás seguro de eliminar el registro de este préstamo del historial?")) return;
    try {
        const respuesta = await fetch(`http://192.168.1.12:3000/api/prestamos/${id}`, { method: 'DELETE' });
        const resultado = await respuesta.json();
        if (resultado.exito) cargarTablaPrestamos(); 
    } catch (e) { alert('Error de conexión.'); }
}

function filtrarPrestamos(estado, btnSeleccionado) {
    const botones = btnSeleccionado.parentElement.querySelectorAll('.filtro-btn');
    botones.forEach(b => {
        b.classList.remove('bg-slate-700', 'text-white');
        b.classList.add('text-slate-400');
    });
    btnSeleccionado.classList.add('bg-slate-700', 'text-white');
    btnSeleccionado.classList.remove('text-slate-400');

    const filas = document.querySelectorAll('.fila-prestamo');
    filas.forEach(fila => {
        if(estado === 'todos') fila.style.display = '';
        else if(estado === 'pendiente' && fila.classList.contains('pendiente')) fila.style.display = '';
        else if(estado === 'devuelto' && fila.classList.contains('devuelto')) fila.style.display = '';
        else fila.style.display = 'none';
    });
}

