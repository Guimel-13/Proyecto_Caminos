let listaRegistrosC21Cip = [];
let eliminarPdfModificadoC21Cip = false;

function abrirModalRegistroC21Cip(esEdicion = false) {
    const modal = document.getElementById('modalRegistroC21Cip');
    const tarjeta = document.getElementById('modalRegistroContentC21Cip');
    eliminarPdfModificadoC21Cip = false; 
    
    if(!esEdicion) {
        document.getElementById('tituloFormularioC21Cip').innerHTML = '<i class="fas fa-plus-square text-accent"></i> Nuevo Formulario C-21 CIP';
        document.getElementById('lblCodigoFormularioC21Cip').innerText = "AUTO";
        limpiarFormularioC21Cip(); 
    }
    modal.classList.remove('hidden');
    setTimeout(() => { tarjeta.classList.remove('scale-95', 'opacity-0'); tarjeta.classList.add('scale-100', 'opacity-100'); }, 10);
}

function prepararEdicionC21Cip(idRegistro) {
    const registro = listaRegistrosC21Cip.find(reg => reg.id === idRegistro);
    if(!registro) return;
    eliminarPdfModificadoC21Cip = false; 
    
    document.getElementById('c21_cip_id_oculto').value = registro.id;
    document.getElementById('c21_cip_archivo_temporal').value = ''; 
    document.getElementById('c21_cip_beneficiario').value = registro.beneficiario || '';
    document.getElementById('c21_cip_detalle').value = registro.detalle_resumen || '';
    document.getElementById('c21_cip_n_devengado').value = registro.n_devengado || '';
    document.getElementById('c21_cip_importe').value = registro.importe || '';
    document.getElementById('c21_cip_fojas').value = registro.fojas || '';
    document.getElementById('c21_cip_hoja_ruta').value = registro.hoja_ruta || '';
    document.getElementById('c21_cip_n_libro_registro').value = registro.n_libro_registro || '';
    document.getElementById('c21_cip_ubicacion_fisica').value = registro.ubicacion_fisica || '';

    document.getElementById('tituloFormularioC21Cip').innerHTML = '<i class="fas fa-edit text-blue-400"></i> Editar Registro C-21 CIP';
    document.getElementById('lblCodigoFormularioC21Cip').innerText = registro.correlativo ? String(registro.correlativo).padStart(3, '0') : registro.id; 

    const cajaEsperando = document.getElementById('contenedor-esperando-pdf-c21-cip');
    const cajaListo = document.getElementById('contenedor-pdf-listo-c21-cip');
    const nombrePdfListo = document.getElementById('nombre-pdf-listo-c21-cip');

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
    abrirModalRegistroC21Cip(true);
}

function cerrarModalRegistroC21Cip() {
    const modal = document.getElementById('modalRegistroC21Cip');
    const tarjeta = document.getElementById('modalRegistroContentC21Cip');
    tarjeta.classList.remove('scale-100', 'opacity-100');
    tarjeta.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

function limpiarFormularioC21Cip() {
    document.getElementById('c21_cip_id_oculto').value = '';
    document.getElementById('c21_cip_archivo_temporal').value = ''; 
    document.getElementById('c21_cip_beneficiario').value = '';
    document.getElementById('c21_cip_detalle').value = '';
    document.getElementById('c21_cip_n_devengado').value = '';
    document.getElementById('c21_cip_importe').value = '';
    document.getElementById('c21_cip_fojas').value = '';
    document.getElementById('c21_cip_hoja_ruta').value = '';
    document.getElementById('c21_cip_n_libro_registro').value = '';
    document.getElementById('c21_cip_ubicacion_fisica').value = '';

    const lblEstado = document.getElementById('lbl-estado-escaner-c21-cip');
    if(lblEstado) lblEstado.classList.add('hidden');
    
    const btnEscanear = document.getElementById('btn-escanear-c21-cip');
    if(btnEscanear) {
        btnEscanear.innerHTML = '<i class="fas fa-satellite-dish"></i> Activar Escáner';
        btnEscanear.classList.remove('bg-emerald-600', 'text-white');
    }

    const cajaEsperando = document.getElementById('contenedor-esperando-pdf-c21-cip');
    const cajaListo = document.getElementById('contenedor-pdf-listo-c21-cip');
    if(cajaEsperando && cajaListo) {
        cajaEsperando.classList.remove('hidden'); 
        cajaListo.classList.add('hidden');        
        cajaListo.removeAttribute('data-ruta-actual');
        const inputManual = document.getElementById('ruta_archivo_c21_cip');
        if(inputManual) inputManual.value = ''; 
    }
}

async function  cargarTablaC21Cip(){
    const cuerpoTabla = document.getElementById('cuerpo-tabla-c21-cip');
    if (!cuerpoTabla) return;
    const gestionActiva = document.getElementById('gestionGlobal').value;
    cuerpoTabla.innerHTML = `<tr><td colspan="12" class="p-4 text-center text-slate-400"><i class="fas fa-spinner fa-spin mr-2"></i> Cargando registros C-21 CIP...</td></tr>`;

    try {
        const respuesta = await fetch(`http://192.168.1.17:3000/api/c21-cip?gestion=${gestionActiva}`);
        listaRegistrosC21Cip = await respuesta.json();
        renderizarTablaC21Cip(listaRegistrosC21Cip);
    } catch (error) {
        cuerpoTabla.innerHTML = `<tr><td colspan="12" class="p-4 text-center text-red-400 font-bold">Error al conectar con la base de datos.</td></tr>`;
    }
}

function buscarEnC21Cip() {
    const textoBuscado = document.getElementById('buscadorGlobal').value.toLowerCase();
    const resultados = listaRegistrosC21Cip.filter(reg => {
        return (reg.beneficiario || '').toLowerCase().includes(textoBuscado) || 
               (reg.detalle_resumen || '').toLowerCase().includes(textoBuscado) || 
               (reg.n_devengado || '').toLowerCase().includes(textoBuscado) || 
               String(reg.correlativo || '').includes(textoBuscado) ||
               String(reg.id || '').includes(textoBuscado);
    });
    renderizarTablaC21Cip(resultados);
}

function renderizarTablaC21Cip(datos) {
    const cuerpoTabla = document.getElementById('cuerpo-tabla-c21-cip');
    const textoBuscado = document.getElementById('buscadorGlobal').value.trim();

    if (datos.length === 0) {
        cuerpoTabla.innerHTML = `<tr><td colspan="12" class="p-4 text-center text-slate-500 font-bold">No se encontraron resultados C-21 CIP.</td></tr>`;
        return;
    }

    let html = '';
    datos.forEach(reg => {
        const numeroFormateado = reg.correlativo ? String(reg.correlativo).padStart(3, '0') : '-';
        const idResaltado = resaltarTexto(reg.id, textoBuscado);
        const correlativoResaltado = resaltarTexto(numeroFormateado, textoBuscado);
        const beneficiarioResaltado = resaltarTexto(reg.beneficiario || 'Sin nombre', textoBuscado);
        const detalleResaltado = resaltarTexto(reg.detalle_resumen, textoBuscado);
        const devengadoResaltado = resaltarTexto(reg.n_devengado, textoBuscado);

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
            <td class="p-4">${devengadoResaltado || '-'}</td>
            <td class="p-4 text-emerald-400 font-bold text-right">${reg.importe || '0.00'}</td>
            <td class="p-4">${reg.fojas || '-'}</td>
            <td class="p-4 text-slate-500">${reg.hoja_ruta || '-'}</td>
            <td class="p-4 text-slate-500">${reg.n_libro_registro || '-'}</td>
            <td class="p-4"><span class="bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">${reg.ubicacion_fisica || 'Sin ubicar'}</span></td>

            <td class="p-4 text-center sticky right-0 bg-darkcard group-hover:bg-slate-800/80 shadow-[-5px_0_10px_rgba(0,0,0,0.1)] transition-colors">
                <div class="flex items-center justify-center gap-2">
                    <button onclick="verAuditoriaC21Cip(${reg.id})" class="w-8 h-8 rounded flex items-center justify-center bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white"><i class="fas fa-eye"></i></button>
                    <button onclick="cargarDoc('${reg.beneficiario}', '${reg.ruta_archivo}?t=${Date.now()}')" class="w-8 h-8 rounded flex items-center justify-center bg-accent/10 text-accent hover:bg-accent hover:text-white"><i class="fas fa-file-pdf"></i></button>
                    <button onclick="prepararEdicionC21Cip(${reg.id})" class="w-8 h-8 rounded flex items-center justify-center bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white"><i class="fas fa-edit"></i></button>
                    <button onclick="eliminarRegistroC21Cip(${reg.id})" class="w-8 h-8 rounded flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"><i class="fas fa-trash-alt"></i></button>
                </div>
            </td>
        </tr>`;
    });
    cuerpoTabla.innerHTML = html;
}

async function guardarRegistroC21Cip() {
    const usuarioLogueado = JSON.parse(sessionStorage.getItem('usuario_actual') || 'null');
    const idOculto = document.getElementById('c21_cip_id_oculto').value;
    const beneficiario = document.getElementById('c21_cip_beneficiario').value;
    const detalle = document.getElementById('c21_cip_detalle').value;

    if(!beneficiario || !detalle) return alert("Beneficiario y Detalle son obligatorios.");

    const datos = {
        gestion: parseInt(document.getElementById('gestionGlobal').value) || 2026,
        beneficiario, detalle,
        n_devengado: document.getElementById('c21_cip_n_devengado').value || null,
        importe: document.getElementById('c21_cip_importe').value ? parseFloat(document.getElementById('c21_cip_importe').value) : null,
        fojas: document.getElementById('c21_cip_fojas').value ? parseInt(document.getElementById('c21_cip_fojas').value) : null,
        hoja_ruta: document.getElementById('c21_cip_hoja_ruta').value || null,
        n_libro_registro: document.getElementById('c21_cip_n_libro_registro').value || null,
        ubicacion_fisica: document.getElementById('c21_cip_ubicacion_fisica').value || null,
        archivo_temporal: document.getElementById('c21_cip_archivo_temporal').value,
        eliminar_pdf: eliminarPdfModificadoC21Cip,
        usuario_id: usuarioLogueado ? usuarioLogueado.id : null 
    };

    let url = 'http://192.168.1.17:3000/api/c21-cip';
    let metodo = 'POST';
    if (idOculto !== "") { url = `${url}/${idOculto}`; metodo = 'PUT'; }

    try {
        const respuesta = await fetch(url, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
        const resultado = await respuesta.json();
        if (resultado.exito) {
            alert('✅ Registro guardado');
            cerrarModalRegistroC21Cip(); cargarTablaC21Cip(); limpiarFormularioC21Cip(); 
        } else alert('Error: ' + resultado.mensaje);
    } catch (e) { alert('Error de conexión.'); }
}

async function eliminarRegistroC21Cip(id) {
    if (!confirm("¿Eliminar este documento C-21 CIP?")) return;
    try {
        const respuesta = await fetch(`http://192.168.1.17:3000/api/c21-cip/${id}`, { method: 'DELETE' });
        const resultado = await respuesta.json();
        if (resultado.exito) cargarTablaC21Cip(); 
    } catch (e) { alert('Error de conexión.'); }
}

function verAuditoriaC21Cip(idRegistro) {
    const registro = listaRegistrosC21Cip.find(reg => reg.id === idRegistro);
    if(!registro) return;
    document.getElementById('audi_creador_c21_cip').innerHTML = `<i class="fas fa-user-shield mr-2"></i> ${registro.nombre_creador || 'SISTEMA'}`;
    document.getElementById('audi_fecha_creacion_c21_cip').innerText = registro.fecha_creacion ? new Date(registro.fecha_creacion).toLocaleString('es-ES') : '-';
    if (registro.nombre_editor) {
        document.getElementById('audi_editor_c21_cip').innerHTML = `<i class="fas fa-user-edit mr-2"></i> ${registro.nombre_editor}`;
        document.getElementById('audi_editor_c21_cip').classList.replace('text-slate-500', 'text-blue-400');
        document.getElementById('audi_fecha_edicion_c21_cip').innerText = new Date(registro.fecha_edicion).toLocaleString('es-ES');
    } else {
        document.getElementById('audi_editor_c21_cip').innerHTML = `<span class="italic font-normal">Sin ediciones</span>`;
        document.getElementById('audi_editor_c21_cip').classList.replace('text-blue-400', 'text-slate-500');
        document.getElementById('audi_fecha_edicion_c21_cip').innerText = '-';
    }
    document.getElementById('modalAuditoriaC21Cip').classList.remove('hidden');
    setTimeout(() => { document.getElementById('modalAuditoriaContentC21Cip').classList.remove('scale-95', 'opacity-0'); }, 10);
}

function cerrarModalAuditoriaC21Cip() {
    document.getElementById('modalAuditoriaContentC21Cip').classList.add('scale-95', 'opacity-0');
    setTimeout(() => { document.getElementById('modalAuditoriaC21Cip').classList.add('hidden'); }, 300);
}

function exportarExcelC21Cip() {
    if (listaRegistrosC21Cip.length === 0) return alert("No hay datos");
    const datos = listaRegistrosC21Cip.map(reg => ({
        "Correlativo": reg.correlativo || '-', "Beneficiario": reg.beneficiario || '-', "Detalle": reg.detalle_resumen || '-',
        "Devengado": reg.n_devengado || '-', "Importe": reg.importe || 0, "Ubicación Física": reg.ubicacion_fisica || '-'
    }));
    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "C21_CIP");
    XLSX.writeFile(libro, `Reporte_C21_CIP_Gestion_${document.getElementById('gestionGlobal').value}.xlsx`);
}

// =========================================================
// 5. HARDWARE Y ESCÁNER (USANDO EL GESTOR CENTRAL)
// =========================================================
const idsHardwareC21Cip = {
    btnComprobar: 'btn-comprobar-hardware-c21-cip', luz: 'status-luz-c21-cip', iconoBg: 'status-icono-bg-c21-cip',
    texto: 'status-texto-c21-cip', nombreEscaner: 'status-nombre-escaner-c21-cip', btnEscanear: 'btn-escanear-c21-cip',
    lblEstado: 'lbl-estado-escaner-c21-cip', inputTemp: 'c21_cip_archivo_temporal', inputFojas: 'c21_cip_fojas',
    cajaEsperando: 'contenedor-esperando-pdf-c21-cip', cajaListo: 'contenedor-pdf-listo-c21-cip',
    nombrePdfListo: 'nombre-pdf-listo-c21-cip', inputRuta: 'ruta_archivo_c21_cip'
};

function verificarConexionHardwareC21Cip() { HardwareCentral.verificarConexion(idsHardwareC21Cip); }
function escanearDocumentoEpsonC21Cip(event) { HardwareCentral.escanear(event, idsHardwareC21Cip); }
function cancelarArchivoC21Cip(event) { HardwareCentral.cancelar(event, idsHardwareC21Cip, () => { eliminarPdfModificadoC21Cip = true; }); }
function previsualizarPdfTemporalC21Cip() { HardwareCentral.previsualizar(idsHardwareC21Cip); }
function archivoImportadoManualmenteC21Cip(input) { HardwareCentral.importarManual(input, idsHardwareC21Cip); }