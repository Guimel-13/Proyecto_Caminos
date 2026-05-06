let listaRegistrosSip = [];
let eliminarPdfModificadoSip = false;

function abrirModalRegistroSip(esEdicion = false) {
    const modal = document.getElementById('modalRegistroSip');
    const tarjeta = document.getElementById('modalRegistroContentSip');
    eliminarPdfModificadoSip = false; 
    
    if(!esEdicion) {
        document.getElementById('tituloFormularioSip').innerHTML = '<i class="fas fa-plus-square text-accent"></i> Nuevo Formulario C-31 SIP';
        document.getElementById('lblCodigoFormularioSip').innerText = "AUTO";
        limpiarFormularioSip(); 
    }
    modal.classList.remove('hidden');
    setTimeout(() => { tarjeta.classList.remove('scale-95', 'opacity-0'); tarjeta.classList.add('scale-100', 'opacity-100'); }, 10);
}

function prepararEdicionSip(idRegistro) {
    const registro = listaRegistrosSip.find(reg => reg.id === idRegistro);
    if(!registro) return;
    eliminarPdfModificadoSip = false; 
    
    document.getElementById('sip_id_oculto').value = registro.id;
    document.getElementById('sip_archivo_temporal').value = ''; 
    document.getElementById('sip_beneficiario').value = registro.beneficiario || '';
    document.getElementById('sip_detalle').value = registro.detalle_resumen || '';
    document.getElementById('sip_n_devengado').value = registro.n_devengado || '';
    document.getElementById('sip_pago').value = registro.pago || '';
    document.getElementById('sip_n_secuencia').value = registro.n_secuencia || '';
    document.getElementById('sip_importe').value = registro.importe || '';
    document.getElementById('sip_fojas').value = registro.fojas || '';
    document.getElementById('sip_hoja_ruta').value = registro.hoja_ruta || '';
    document.getElementById('sip_n_libro_registro').value = registro.n_libro_registro || '';
    document.getElementById('sip_ubicacion_fisica').value = registro.ubicacion_fisica || '';

    document.getElementById('tituloFormularioSip').innerHTML = '<i class="fas fa-edit text-blue-400"></i> Editar Registro C-31 SIP';
    document.getElementById('lblCodigoFormularioSip').innerText = registro.correlativo ? String(registro.correlativo).padStart(3, '0') : registro.id; 

    const cajaEsperando = document.getElementById('contenedor-esperando-pdf-sip');
    const cajaListo = document.getElementById('contenedor-pdf-listo-sip');
    const nombrePdfListo = document.getElementById('nombre-pdf-listo-sip');

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
    abrirModalRegistroSip(true);
}

function cerrarModalRegistroSip() {
    const modal = document.getElementById('modalRegistroSip');
    const tarjeta = document.getElementById('modalRegistroContentSip');
    tarjeta.classList.remove('scale-100', 'opacity-100');
    tarjeta.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

function limpiarFormularioSip() {
    document.getElementById('sip_id_oculto').value = '';
    document.getElementById('sip_archivo_temporal').value = ''; 
    document.getElementById('sip_beneficiario').value = '';
    document.getElementById('sip_detalle').value = '';
    document.getElementById('sip_n_devengado').value = '';
    document.getElementById('sip_pago').value = '';
    document.getElementById('sip_n_secuencia').value = '';
    document.getElementById('sip_importe').value = '';
    document.getElementById('sip_fojas').value = '';
    document.getElementById('sip_hoja_ruta').value = '';
    document.getElementById('sip_n_libro_registro').value = '';
    document.getElementById('sip_ubicacion_fisica').value = '';

    const lblEstado = document.getElementById('lbl-estado-escaner-sip');
    if(lblEstado) lblEstado.classList.add('hidden');
    
    const btnEscanear = document.getElementById('btn-escanear-sip');
    if(btnEscanear) {
        btnEscanear.innerHTML = '<i class="fas fa-satellite-dish"></i> Activar Escáner';
        btnEscanear.classList.remove('bg-emerald-600', 'text-white');
    }

    const cajaEsperando = document.getElementById('contenedor-esperando-pdf-sip');
    const cajaListo = document.getElementById('contenedor-pdf-listo-sip');
    if(cajaEsperando && cajaListo) {
        cajaEsperando.classList.remove('hidden'); 
        cajaListo.classList.add('hidden');        
        cajaListo.removeAttribute('data-ruta-actual');
        const inputManual = document.getElementById('ruta_archivo_sip');
        if(inputManual) inputManual.value = ''; 
    }
}

async function cargarTablaC31Sip() {
    const cuerpoTabla = document.getElementById('cuerpo-tabla-c31-sip');
    if (!cuerpoTabla) return;
    const gestionActiva = document.getElementById('gestionGlobal').value;
    cuerpoTabla.innerHTML = `<tr><td colspan="14" class="p-4 text-center text-slate-400"><i class="fas fa-spinner fa-spin mr-2"></i> Cargando registros SIP...</td></tr>`;

    try {
        const respuesta = await fetch(`http://192.168.1.12:3000/api/c31-sip?gestion=${gestionActiva}`);
        listaRegistrosSip = await respuesta.json();
        renderizarTablaSip(listaRegistrosSip);
    } catch (error) {
        cuerpoTabla.innerHTML = `<tr><td colspan="14" class="p-4 text-center text-red-400 font-bold">Error al conectar con la base de datos.</td></tr>`;
    }
}

function buscarEnSip() {
    const textoBuscado = document.getElementById('buscadorGlobal').value.toLowerCase();
    const resultados = listaRegistrosSip.filter(reg => {
        return (reg.beneficiario || '').toLowerCase().includes(textoBuscado) || 
               (reg.detalle_resumen || '').toLowerCase().includes(textoBuscado) || 
               (reg.pago || '').toLowerCase().includes(textoBuscado) || 
               String(reg.correlativo || '').includes(textoBuscado) ||
               String(reg.id || '').includes(textoBuscado);
    });
    renderizarTablaSip(resultados);
}

function renderizarTablaSip(datos) {
    const cuerpoTabla = document.getElementById('cuerpo-tabla-c31-sip');
    const textoBuscado = document.getElementById('buscadorGlobal').value.trim();

    if (datos.length === 0) {
        cuerpoTabla.innerHTML = `<tr><td colspan="14" class="p-4 text-center text-slate-500 font-bold">No se encontraron resultados SIP.</td></tr>`;
        return;
    }

    let html = '';
    datos.forEach(reg => {
        const numeroFormateado = reg.correlativo ? String(reg.correlativo).padStart(3, '0') : '-';
        const idResaltado = resaltarTexto(reg.id, textoBuscado);
        const correlativoResaltado = resaltarTexto(numeroFormateado, textoBuscado);
        const beneficiarioResaltado = resaltarTexto(reg.beneficiario || 'Sin nombre', textoBuscado);
        const detalleResaltado = resaltarTexto(reg.detalle_resumen, textoBuscado);
        const pagoResaltado = resaltarTexto(reg.pago, textoBuscado);

        html += `
        <tr class="hover:bg-slate-800/80 group transition-colors">
            <td class="p-4 text-slate-500 font-bold">${idResaltado}</td>
            <td class="p-4 text-accent font-bold">${correlativoResaltado}</td>
            <td class="p-4">${reg.gestion || '-'}</td>
            <td class="p-4 font-bold text-white">${beneficiarioResaltado}</td>
            <td class="p-4 align-top w-64">
                <div class="mt-1.5 text-slate-400 max-h-16 overflow-y-auto scroll-custom whitespace-normal break-words pr-2">
                    ${detalleResaltado}
                </div>
            </td>
            <td class="p-4">${reg.n_devengado || '-'}</td>
            <td class="p-4 text-emerald-400">${pagoResaltado || '-'}</td>
            <td class="p-4 text-slate-500">${reg.n_secuencia || '-'}</td>
            <td class="p-4 text-emerald-400 font-bold text-right">${reg.importe || '0.00'}</td>
            <td class="p-4">${reg.fojas || '-'}</td>
            <td class="p-4 text-slate-500">${reg.hoja_ruta || '-'}</td>
            <td class="p-4 text-slate-500">${reg.n_libro_registro || '-'}</td>
            <td class="p-4"><span class="bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">${reg.ubicacion_fisica || 'Sin ubicar'}</span></td>

            <td class="p-4 text-center sticky right-0 bg-darkcard group-hover:bg-slate-800/80 shadow-[-5px_0_10px_rgba(0,0,0,0.1)] transition-colors">
                <div class="flex items-center justify-center gap-2">
                    <button onclick="verAuditoriaSip(${reg.id})" class="w-8 h-8 rounded flex items-center justify-center bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white"><i class="fas fa-eye"></i></button>
                    <button onclick="cargarDoc('${reg.beneficiario}', '${reg.ruta_archivo}?t=${Date.now()}')" class="w-8 h-8 rounded flex items-center justify-center bg-accent/10 text-accent hover:bg-accent hover:text-white"><i class="fas fa-file-pdf"></i></button>
                    <button onclick="prepararEdicionSip(${reg.id})" class="w-8 h-8 rounded flex items-center justify-center bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white"><i class="fas fa-edit"></i></button>
                    <button onclick="eliminarRegistroSip(${reg.id})" class="w-8 h-8 rounded flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"><i class="fas fa-trash-alt"></i></button>
                </div>
            </td>
        </tr>`;
    });
    cuerpoTabla.innerHTML = html;
}

async function guardarRegistroSip() {
    const usuarioLogueado = JSON.parse(sessionStorage.getItem('usuario_actual') || 'null');
    const idOculto = document.getElementById('sip_id_oculto').value;
    const beneficiario = document.getElementById('sip_beneficiario').value;
    const detalle = document.getElementById('sip_detalle').value;

    if(!beneficiario || !detalle) return alert("Beneficiario y Detalle son obligatorios.");

    const datos = {
        gestion: parseInt(document.getElementById('gestionGlobal').value) || 2026,
        beneficiario, detalle,
        n_devengado: document.getElementById('sip_n_devengado').value || null,
        pago: document.getElementById('sip_pago').value || null,
        n_secuencia: document.getElementById('sip_n_secuencia').value ? parseInt(document.getElementById('sip_n_secuencia').value) : null,
        importe: document.getElementById('sip_importe').value ? parseFloat(document.getElementById('sip_importe').value) : null,
        fojas: document.getElementById('sip_fojas').value ? parseInt(document.getElementById('sip_fojas').value) : null,
        hoja_ruta: document.getElementById('sip_hoja_ruta').value || null,
        n_libro_registro: document.getElementById('sip_n_libro_registro').value || null,
        ubicacion_fisica: document.getElementById('sip_ubicacion_fisica').value || null,
        archivo_temporal: document.getElementById('sip_archivo_temporal').value,
        eliminar_pdf: eliminarPdfModificadoSip,
        usuario_id: usuarioLogueado ? usuarioLogueado.id : null 
    };

    let url = 'http://192.168.1.12:3000/api/c31-sip';
    let metodo = 'POST';
    if (idOculto !== "") { url = `${url}/${idOculto}`; metodo = 'PUT'; }

    try {
        const respuesta = await fetch(url, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
        const resultado = await respuesta.json();
        if (resultado.exito) {
            alert('✅ Registro guardado');
            cerrarModalRegistroSip(); cargarTablaC31Sip(); limpiarFormularioSip(); 
        } else alert('Error: ' + resultado.mensaje);
    } catch (e) { alert('Error de conexión.'); }
}

async function eliminarRegistroSip(id) {
    if (!confirm("¿Eliminar este documento SIP?")) return;
    try {
        const respuesta = await fetch(`http://192.168.1.12:3000/api/c31-sip/${id}`, { method: 'DELETE' });
        const resultado = await respuesta.json();
        if (resultado.exito) cargarTablaC31Sip(); 
    } catch (e) { alert('Error de conexión.'); }
}

function verAuditoriaSip(idRegistro) {
    const registro = listaRegistrosSip.find(reg => reg.id === idRegistro);
    if(!registro) return;
    document.getElementById('audi_creador_sip').innerHTML = `<i class="fas fa-user-shield mr-2"></i> ${registro.nombre_creador || 'SISTEMA'}`;
    document.getElementById('audi_fecha_creacion_sip').innerText = registro.fecha_creacion ? new Date(registro.fecha_creacion).toLocaleString('es-ES') : '-';
    if (registro.nombre_editor) {
        document.getElementById('audi_editor_sip').innerHTML = `<i class="fas fa-user-edit mr-2"></i> ${registro.nombre_editor}`;
        document.getElementById('audi_editor_sip').classList.replace('text-slate-500', 'text-blue-400');
        document.getElementById('audi_fecha_edicion_sip').innerText = new Date(registro.fecha_edicion).toLocaleString('es-ES');
    } else {
        document.getElementById('audi_editor_sip').innerHTML = `<span class="italic font-normal">Sin ediciones</span>`;
        document.getElementById('audi_editor_sip').classList.replace('text-blue-400', 'text-slate-500');
        document.getElementById('audi_fecha_edicion_sip').innerText = '-';
    }
    document.getElementById('modalAuditoriaSip').classList.remove('hidden');
    setTimeout(() => { document.getElementById('modalAuditoriaContentSip').classList.remove('scale-95', 'opacity-0'); }, 10);
}

function cerrarModalAuditoriaSip() {
    document.getElementById('modalAuditoriaContentSip').classList.add('scale-95', 'opacity-0');
    setTimeout(() => { document.getElementById('modalAuditoriaSip').classList.add('hidden'); }, 300);
}

function exportarExcelSip() {
    if (listaRegistrosSip.length === 0) return alert("No hay datos");
    const datos = listaRegistrosSip.map(reg => ({
        "Correlativo": reg.correlativo || '-', "Beneficiario": reg.beneficiario || '-', "Detalle": reg.detalle_resumen || '-',
        "Devengado": reg.n_devengado || '-', "Pago": reg.pago || '-', "Importe": reg.importe || 0
    }));
    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "SIP");
    XLSX.writeFile(libro, `Reporte_SIP_Gestion_${document.getElementById('gestionGlobal').value}.xlsx`);
}

// =========================================================
// 5. HARDWARE Y ESCÁNER (USANDO EL GESTOR CENTRAL)
// =========================================================
const idsHardwareSip = {
    btnComprobar: 'btn-comprobar-hardware-sip', luz: 'status-luz-sip', iconoBg: 'status-icono-bg-sip',
    texto: 'status-texto-sip', nombreEscaner: 'status-nombre-escaner-sip', btnEscanear: 'btn-escanear-sip',
    lblEstado: 'lbl-estado-escaner-sip', inputTemp: 'sip_archivo_temporal', inputFojas: 'sip_fojas',
    cajaEsperando: 'contenedor-esperando-pdf-sip', cajaListo: 'contenedor-pdf-listo-sip',
    nombrePdfListo: 'nombre-pdf-listo-sip', inputRuta: 'ruta_archivo_sip'
};

function verificarConexionHardwareSip() { HardwareCentral.verificarConexion(idsHardwareSip); }
function escanearDocumentoEpsonSip(event) { HardwareCentral.escanear(event, idsHardwareSip); }
function cancelarArchivoSip(event) { HardwareCentral.cancelar(event, idsHardwareSip, () => { eliminarPdfModificadoSip = true; }); }
function previsualizarPdfTemporalSip() { HardwareCentral.previsualizar(idsHardwareSip); }
function archivoImportadoManualmenteSip(input) { HardwareCentral.importarManual(input, idsHardwareSip); }