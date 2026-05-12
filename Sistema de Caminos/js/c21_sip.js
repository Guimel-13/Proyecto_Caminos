let listaRegistrosC21Sip = [];
let eliminarPdfModificadoC21Sip = false;

function abrirModalRegistroC21Sip(esEdicion = false) {
    const modal = document.getElementById('modalRegistroC21Sip');
    const tarjeta = document.getElementById('modalRegistroContentC21Sip');
    eliminarPdfModificadoC21Sip = false; 
    
    if(!esEdicion) {
        document.getElementById('tituloFormularioC21Sip').innerHTML = '<i class="fas fa-plus-square text-accent"></i> Nuevo Formulario C-21 SIP';
        document.getElementById('lblCodigoFormularioC21Sip').innerText = "AUTO";
        limpiarFormularioC21Sip(); 
    }
    modal.classList.remove('hidden');
    setTimeout(() => { tarjeta.classList.remove('scale-95', 'opacity-0'); tarjeta.classList.add('scale-100', 'opacity-100'); }, 10);
}

function prepararEdicionC21Sip(idRegistro) {
    const registro = listaRegistrosC21Sip.find(reg => reg.id === idRegistro);
    if(!registro) return;
    eliminarPdfModificadoC21Sip = false; 
    
    document.getElementById('c21_sip_id_oculto').value = registro.id;
    document.getElementById('c21_sip_archivo_temporal').value = ''; 
    document.getElementById('c21_sip_beneficiario').value = registro.beneficiario || '';
    document.getElementById('c21_sip_detalle').value = registro.detalle_resumen || '';
    document.getElementById('c21_sip_sip').value = registro.sip_sin_imputacion_presupuestaria || '';
    document.getElementById('c21_sip_importe').value = registro.importe || '';
    document.getElementById('c21_sip_fojas').value = registro.fojas || '';
    document.getElementById('c21_sip_hoja_ruta').value = registro.hoja_ruta || '';
    document.getElementById('c21_sip_n_libro_registro').value = registro.n_libro_registro || '';
    document.getElementById('c21_sip_ubicacion_fisica').value = registro.ubicacion_fisica || '';

    document.getElementById('tituloFormularioC21Sip').innerHTML = '<i class="fas fa-edit text-blue-400"></i> Editar Registro C-21 SIP';
    document.getElementById('lblCodigoFormularioC21Sip').innerText = registro.correlativo ? String(registro.correlativo).padStart(3, '0') : registro.id; 

    const cajaEsperando = document.getElementById('contenedor-esperando-pdf-c21-sip');
    const cajaListo = document.getElementById('contenedor-pdf-listo-c21-sip');
    const nombrePdfListo = document.getElementById('nombre-pdf-listo-c21-sip');

    if (registro.ruta_archivo && registro.ruta_archivo !== 'null') {
        cajaEsperando.classList.add('hidden');
        cajaListo.classList.remove('hidden');
        nombrePdfListo.innerText = "Documento_Guardado.pdf";
        cajaListo.setAttribute('data-ruta-actual', registro.ruta_archivo);
    } else {
        cajaEsperando.classList.remove('hidden');
        cajaListo.classList.add('hidden');
        cajaListo.removeAttribute('data-ruta-actual');
    }
    abrirModalRegistroC21Sip(true);
}

function cerrarModalRegistroC21Sip() {
    const modal = document.getElementById('modalRegistroC21Sip');
    const tarjeta = document.getElementById('modalRegistroContentC21Sip');
    tarjeta.classList.remove('scale-100', 'opacity-100');
    tarjeta.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

function limpiarFormularioC21Sip() {
    document.getElementById('c21_sip_id_oculto').value = '';
    document.getElementById('c21_sip_archivo_temporal').value = ''; 
    document.getElementById('c21_sip_beneficiario').value = '';
    document.getElementById('c21_sip_detalle').value = '';
    document.getElementById('c21_sip_sip').value = '';
    document.getElementById('c21_sip_importe').value = '';
    document.getElementById('c21_sip_fojas').value = '';
    document.getElementById('c21_sip_hoja_ruta').value = '';
    document.getElementById('c21_sip_n_libro_registro').value = '';
    document.getElementById('c21_sip_ubicacion_fisica').value = '';

    const lblEstado = document.getElementById('lbl-estado-escaner-c21-sip');
    if(lblEstado) lblEstado.classList.add('hidden');
    
    const btnEscanear = document.getElementById('btn-escanear-c21-sip');
    if(btnEscanear) {
        btnEscanear.innerHTML = '<i class="fas fa-satellite-dish"></i> Activar Escáner';
        btnEscanear.classList.remove('bg-emerald-600', 'text-white');
    }

    const cajaEsperando = document.getElementById('contenedor-esperando-pdf-c21-sip');
    const cajaListo = document.getElementById('contenedor-pdf-listo-c21-sip');
    if(cajaEsperando && cajaListo) {
        cajaEsperando.classList.remove('hidden'); 
        cajaListo.classList.add('hidden');        
        cajaListo.removeAttribute('data-ruta-actual');
        const inputManual = document.getElementById('ruta_archivo_c21_sip');
        if(inputManual) inputManual.value = ''; 
    }
}

async function cargarTablaC21Sip() {
    const cuerpoTabla = document.getElementById('cuerpo-tabla-c21-sip');
    if (!cuerpoTabla) return;
    const gestionActiva = document.getElementById('gestionGlobal').value;
    cuerpoTabla.innerHTML = `<tr><td colspan="12" class="p-4 text-center text-slate-400"><i class="fas fa-spinner fa-spin mr-2"></i> Cargando registros C-21 SIP...</td></tr>`;

    try {
        const respuesta = await fetch(`http://192.168.1.17:3000/api/c21-sip?gestion=${gestionActiva}`);
        listaRegistrosC21Sip = await respuesta.json();
        renderizarTablaC21Sip(listaRegistrosC21Sip);
    } catch (error) {
        cuerpoTabla.innerHTML = `<tr><td colspan="12" class="p-4 text-center text-red-400 font-bold">Error al conectar con la base de datos.</td></tr>`;
    }
}

function buscarEnC21Sip() {
    const textoBuscado = document.getElementById('buscadorGlobal').value.toLowerCase();
    const resultados = listaRegistrosC21Sip.filter(reg => {
        return (reg.beneficiario || '').toLowerCase().includes(textoBuscado) || 
               (reg.detalle_resumen || '').toLowerCase().includes(textoBuscado) || 
               (reg.sip_sin_imputacion_presupuestaria || '').toLowerCase().includes(textoBuscado) || 
               String(reg.correlativo || '').includes(textoBuscado) ||
               String(reg.id || '').includes(textoBuscado);
    });
    renderizarTablaC21Sip(resultados);
}

function renderizarTablaC21Sip(datos) {
    const cuerpoTabla = document.getElementById('cuerpo-tabla-c21-sip');
    const textoBuscado = document.getElementById('buscadorGlobal').value.trim();

    if (datos.length === 0) {
        cuerpoTabla.innerHTML = `<tr><td colspan="12" class="p-4 text-center text-slate-500 font-bold">No se encontraron resultados C-21 SIP.</td></tr>`;
        return;
    }

    let html = '';
    datos.forEach(reg => {
        const numeroFormateado = reg.correlativo ? String(reg.correlativo).padStart(3, '0') : '-';
        const idResaltado = resaltarTexto(reg.id, textoBuscado);
        const correlativoResaltado = resaltarTexto(numeroFormateado, textoBuscado);
        const beneficiarioResaltado = resaltarTexto(reg.beneficiario || 'Sin nombre', textoBuscado);
        const detalleResaltado = resaltarTexto(reg.detalle_resumen, textoBuscado);
        const sipResaltado = resaltarTexto(reg.sip_sin_imputacion_presupuestaria, textoBuscado);

        html += `
        <tr class="hover:bg-slate-800/80 group transition-colors">
            <td class="p-4 text-slate-500 font-bold">${idResaltado}</td>
            <td class="p-4 text-accent font-bold">${correlativoResaltado}</td>
            <td class="p-4">${reg.gestion || '-'}</td>
            <td class="p-4 font-bold text-white">${beneficiarioResaltado}</td>
            <td class="p-4 align-top w-64 group/celda cursor-ns-resize">
                <div class="mt-1.5 text-slate-400 transition-all duration-500 ease-in-out max-h-5 overflow-hidden group-hover/celda:max-h-40 whitespace-normal break-words">
                    ${detalleResaltado}
                </div>
            </td>
            <td class="p-4 text-emerald-400">${sipResaltado || '-'}</td>
            <td class="p-4 text-emerald-400 font-bold text-right">${reg.importe || '0.00'}</td>
            <td class="p-4">${reg.fojas || '-'}</td>
            <td class="p-4 text-slate-500">${reg.hoja_ruta || '-'}</td>
            <td class="p-4 text-slate-500">${reg.n_libro_registro || '-'}</td>
            <td class="p-4"><span class="bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">${reg.ubicacion_fisica || 'Sin ubicar'}</span></td>

            <td class="p-4 text-center sticky right-0 bg-darkcard group-hover:bg-slate-800/80 shadow-[-5px_0_10px_rgba(0,0,0,0.1)] transition-colors">
                <div class="flex items-center justify-center gap-2">
                    <button onclick="verAuditoriaC21Sip(${reg.id})" class="w-8 h-8 rounded flex items-center justify-center bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white"><i class="fas fa-eye"></i></button>
                    <button onclick="cargarDoc('${reg.beneficiario}', '${reg.ruta_archivo}?t=${Date.now()}')" class="w-8 h-8 rounded flex items-center justify-center bg-accent/10 text-accent hover:bg-accent hover:text-white"><i class="fas fa-file-pdf"></i></button>
                    <button onclick="prepararEdicionC21Sip(${reg.id})" class="w-8 h-8 rounded flex items-center justify-center bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white"><i class="fas fa-edit"></i></button>
                    <button onclick="eliminarRegistroC21Sip(${reg.id})" class="w-8 h-8 rounded flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"><i class="fas fa-trash-alt"></i></button>
                </div>
            </td>
        </tr>`;
    });
    cuerpoTabla.innerHTML = html;
}

async function guardarRegistroC21Sip() {
    const usuarioLogueado = JSON.parse(sessionStorage.getItem('usuario_actual') || 'null');
    const idOculto = document.getElementById('c21_sip_id_oculto').value;
    const beneficiario = document.getElementById('c21_sip_beneficiario').value;
    const detalle = document.getElementById('c21_sip_detalle').value;

    if(!beneficiario || !detalle) return alert("Beneficiario y Detalle son obligatorios.");

    const datos = {
        gestion: parseInt(document.getElementById('gestionGlobal').value) || 2026,
        beneficiario, detalle,
        sip_sin_imputacion_presupuestaria: document.getElementById('c21_sip_sip').value || null,
        importe: document.getElementById('c21_sip_importe').value ? parseFloat(document.getElementById('c21_sip_importe').value) : null,
        fojas: document.getElementById('c21_sip_fojas').value ? parseInt(document.getElementById('c21_sip_fojas').value) : null,
        hoja_ruta: document.getElementById('c21_sip_hoja_ruta').value || null,
        n_libro_registro: document.getElementById('c21_sip_n_libro_registro').value || null,
        ubicacion_fisica: document.getElementById('c21_sip_ubicacion_fisica').value || null,
        archivo_temporal: document.getElementById('c21_sip_archivo_temporal').value,
        eliminar_pdf: eliminarPdfModificadoC21Sip,
        usuario_id: usuarioLogueado ? usuarioLogueado.id : null 
    };

    let url = 'http://192.168.1.17:3000/api/c21-sip';
    let metodo = 'POST';
    if (idOculto !== "") { url = `${url}/${idOculto}`; metodo = 'PUT'; }

    try {
        const respuesta = await fetch(url, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
        const resultado = await respuesta.json();
        if (resultado.exito) {
            alert('✅ Registro guardado');
            cerrarModalRegistroC21Sip(); cargarTablaC21Sip(); limpiarFormularioC21Sip(); 
        } else alert('Error: ' + resultado.mensaje);
    } catch (e) { alert('Error de conexión.'); }
}

async function eliminarRegistroC21Sip(id) {
    if (!confirm("¿Eliminar este documento C-21 SIP?")) return;
    try {
        const respuesta = await fetch(`http://192.168.1.17:3000/api/c21-sip/${id}`, { method: 'DELETE' });
        const resultado = await respuesta.json();
        if (resultado.exito) cargarTablaC21Sip(); 
    } catch (e) { alert('Error de conexión.'); }
}

function verAuditoriaC21Sip(idRegistro) {
    const registro = listaRegistrosC21Sip.find(reg => reg.id === idRegistro);
    if(!registro) return;
    document.getElementById('audi_creador_c21_sip').innerHTML = `<i class="fas fa-user-shield mr-2"></i> ${registro.nombre_creador || 'SISTEMA'}`;
    document.getElementById('audi_fecha_creacion_c21_sip').innerText = registro.fecha_creacion ? new Date(registro.fecha_creacion).toLocaleString('es-ES') : '-';
    if (registro.nombre_editor) {
        document.getElementById('audi_editor_c21_sip').innerHTML = `<i class="fas fa-user-edit mr-2"></i> ${registro.nombre_editor}`;
        document.getElementById('audi_editor_c21_sip').classList.replace('text-slate-500', 'text-blue-400');
        document.getElementById('audi_fecha_edicion_c21_sip').innerText = new Date(registro.fecha_edicion).toLocaleString('es-ES');
    } else {
        document.getElementById('audi_editor_c21_sip').innerHTML = `<span class="italic font-normal">Sin ediciones</span>`;
        document.getElementById('audi_editor_c21_sip').classList.replace('text-blue-400', 'text-slate-500');
        document.getElementById('audi_fecha_edicion_c21_sip').innerText = '-';
    }
    document.getElementById('modalAuditoriaC21Sip').classList.remove('hidden');
    setTimeout(() => { document.getElementById('modalAuditoriaContentC21Sip').classList.remove('scale-95', 'opacity-0'); }, 10);
}

function cerrarModalAuditoriaC21Sip() {
    document.getElementById('modalAuditoriaContentC21Sip').classList.add('scale-95', 'opacity-0');
    setTimeout(() => { document.getElementById('modalAuditoriaC21Sip').classList.add('hidden'); }, 300);
}

function exportarExcelC21Sip() {
    if (listaRegistrosC21Sip.length === 0) return alert("No hay datos");
    const datos = listaRegistrosC21Sip.map(reg => ({
        "Correlativo": reg.correlativo || '-', "Beneficiario": reg.beneficiario || '-', "Detalle": reg.detalle_resumen || '-',
        "S.I.P.": reg.sip_sin_imputacion_presupuestaria || '-', "Importe": reg.importe || 0, "Ubicación Física": reg.ubicacion_fisica || '-'
    }));
    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "C21_SIP");
    XLSX.writeFile(libro, `Reporte_C21_SIP_Gestion_${document.getElementById('gestionGlobal').value}.xlsx`);
}

// =========================================================
// 5. HARDWARE Y ESCÁNER (USANDO EL GESTOR CENTRAL)
// =========================================================
const idsHardwareC21Sip = {
    btnComprobar: 'btn-comprobar-hardware-c21-sip', luz: 'status-luz-c21-sip', iconoBg: 'status-icono-bg-c21-sip',
    texto: 'status-texto-c21-sip', nombreEscaner: 'status-nombre-escaner-c21-sip', btnEscanear: 'btn-escanear-c21-sip',
    lblEstado: 'lbl-estado-escaner-c21-sip', inputTemp: 'c21_sip_archivo_temporal', inputFojas: 'c21_sip_fojas',
    cajaEsperando: 'contenedor-esperando-pdf-c21-sip', cajaListo: 'contenedor-pdf-listo-c21-sip',
    nombrePdfListo: 'nombre-pdf-listo-c21-sip', inputRuta: 'ruta_archivo_c21_sip'
};

function verificarConexionHardwareC21Sip() { HardwareCentral.verificarConexion(idsHardwareC21Sip); }
function escanearDocumentoEpsonC21Sip(event) { HardwareCentral.escanear(event, idsHardwareC21Sip); }
function cancelarArchivoC21Sip(event) { HardwareCentral.cancelar(event, idsHardwareC21Sip, () => { eliminarPdfModificadoC21Sip = true; }); }
function previsualizarPdfTemporalC21Sip() { HardwareCentral.previsualizar(idsHardwareC21Sip); }
function archivoImportadoManualmenteC21Sip(input) { HardwareCentral.importarManual(input, idsHardwareC21Sip); }