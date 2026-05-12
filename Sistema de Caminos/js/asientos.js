let listaRegistrosAsientos = [];
let eliminarPdfModificadoAsientos = false;

function abrirModalAsientosManuales(esEdicion = false) {
    const modal = document.getElementById('modalAsientosManuales');
    const tarjeta = document.getElementById('modalAsientosManualesContent');

    eliminarPdfModificadoAsientos = false;

    if (!esEdicion) {
        document.getElementById('tituloFormularioAsientos').innerHTML = '<i class="fas fa-plus-square text-accent"></i> Nuevo Asiento Manual';
        document.getElementById('lblCodigoFormularioAsientos').innerText = "AUTO";
        limpiarFormularioAsientos();
    }

    modal.classList.remove('hidden');
    setTimeout(() => {
        tarjeta.classList.remove('scale-95', 'opacity-0');
        tarjeta.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function prepararEdicionAsientos(idRegistro) {
    const registro = listaRegistrosAsientos.find(reg => reg.id === idRegistro);
    if (!registro) return;

    eliminarPdfModificadoAsientos = false;

    document.getElementById('asientos_id_oculto').value = registro.id;
    document.getElementById('asientos_archivo_temporal').value = '';
    document.getElementById('asientos_detalle_glosa').value = registro.detalle_glosa || '';
    document.getElementById('asientos_n_documento').value = registro.n_documento || '';
    document.getElementById('asientos_importe').value = registro.importe || '';
    document.getElementById('asientos_hoja_ruta').value = registro.hoja_ruta || '';
    document.getElementById('asientos_n_libro_registro').value = registro.n_libro_registro || '';
    document.getElementById('asientos_ubicacion_fisica').value = registro.ubicacion_fisica || '';

    document.getElementById('tituloFormularioAsientos').innerHTML = '<i class="fas fa-edit text-blue-400"></i> Editar Asiento Manual';
    document.getElementById('lblCodigoFormularioAsientos').innerText = registro.correlativo ? String(registro.correlativo).padStart(3, '0') : registro.id;

    const cajaEsperando = document.getElementById('contenedor-esperando-pdf-asientos');
    const cajaListo = document.getElementById('contenedor-pdf-listo-asientos');
    const nombrePdfListo = document.getElementById('nombre-pdf-listo-asientos');

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

    abrirModalAsientosManuales(true);
}

function cerrarModalAsientosManuales() {
    const modal = document.getElementById('modalAsientosManuales');
    const tarjeta = document.getElementById('modalAsientosManualesContent');
    tarjeta.classList.remove('scale-100', 'opacity-100');
    tarjeta.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

function limpiarFormularioAsientos() {
    document.getElementById('asientos_id_oculto').value = '';
    document.getElementById('asientos_archivo_temporal').value = '';
    document.getElementById('asientos_detalle_glosa').value = '';
    document.getElementById('asientos_n_documento').value = '';
    document.getElementById('asientos_importe').value = '';
    document.getElementById('asientos_hoja_ruta').value = '';
    document.getElementById('asientos_n_libro_registro').value = '';
    document.getElementById('asientos_ubicacion_fisica').value = '';

    const lblEstado = document.getElementById('lbl-estado-escaner-asientos');
    if (lblEstado) lblEstado.classList.add('hidden');

    const btnEscanear = document.getElementById('btn-escanear-asientos');
    if (btnEscanear) {
        btnEscanear.innerHTML = '<i class="fas fa-satellite-dish"></i> Activar Escáner';
        btnEscanear.classList.remove('bg-emerald-600', 'text-white');
    }

    const cajaEsperando = document.getElementById('contenedor-esperando-pdf-asientos');
    const cajaListo = document.getElementById('contenedor-pdf-listo-asientos');

    if (cajaEsperando && cajaListo) {
        cajaEsperando.classList.remove('hidden');
        cajaListo.classList.add('hidden');
        cajaListo.removeAttribute('data-ruta-actual');

        const inputManual = document.getElementById('ruta_archivo_asientos');
        if (inputManual) inputManual.value = '';
    }
}

async function cargarTablaAsientos() {
    const cuerpoTabla = document.getElementById('cuerpo-tabla-asientos');
    if (!cuerpoTabla) return;

    const gestionActiva = document.getElementById('gestionGlobal').value;
    cuerpoTabla.innerHTML = `<tr><td colspan="10" class="p-4 text-center text-slate-400"><i class="fas fa-spinner fa-spin mr-2"></i> Cargando Asientos Manuales...</td></tr>`;

    try {
        const respuesta = await fetch(`http://192.168.1.17:3000/api/asientos?gestion=${gestionActiva}`);
        listaRegistrosAsientos = await respuesta.json();
        renderizarTablaAsientos(listaRegistrosAsientos);
    } catch (error) {
        cuerpoTabla.innerHTML = `<tr><td colspan="10" class="p-4 text-center text-red-400 font-bold">Error al conectar con la base de datos.</td></tr>`;
    }
}

function buscarEnAsientos() {
    const textoBuscado = document.getElementById('buscadorGlobal').value.toLowerCase();
    const resultados = listaRegistrosAsientos.filter(reg => {
        return (reg.detalle_glosa || '').toLowerCase().includes(textoBuscado) ||
               (reg.n_documento || '').toLowerCase().includes(textoBuscado) ||
               String(reg.correlativo || '').includes(textoBuscado) ||
               String(reg.id || '').includes(textoBuscado);
    });
    renderizarTablaAsientos(resultados);
}

function renderizarTablaAsientos(datos) {
    const cuerpoTabla = document.getElementById('cuerpo-tabla-asientos');
    const textoBuscado = document.getElementById('buscadorGlobal').value.trim();

    if (datos.length === 0) {
        cuerpoTabla.innerHTML = `<tr><td colspan="10" class="p-4 text-center text-slate-500 font-bold">No se encontraron resultados en Asientos Manuales.</td></tr>`;
        return;
    }

    let html = '';
    datos.forEach(reg => {
        const numeroFormateado = reg.correlativo ? String(reg.correlativo).padStart(3, '0') : '-';

        const idResaltado = typeof resaltarTexto === 'function' ? resaltarTexto(reg.id, textoBuscado) : reg.id;
        const correlativoResaltado = typeof resaltarTexto === 'function' ? resaltarTexto(numeroFormateado, textoBuscado) : numeroFormateado;
        const glosaResaltado = typeof resaltarTexto === 'function' ? resaltarTexto(reg.detalle_glosa || '-', textoBuscado) : (reg.detalle_glosa || '-');
        const docResaltado = typeof resaltarTexto === 'function' ? resaltarTexto(reg.n_documento || '-', textoBuscado) : (reg.n_documento || '-');

        html += `
        <tr class="hover:bg-slate-800/80 group transition-colors">
            <td class="p-4 text-slate-500 font-bold">${idResaltado}</td>
            <td class="p-4 text-accent font-bold">${correlativoResaltado}</td>
            <td class="p-4">${reg.gestion || '-'}</td>
            <td class="p-4 align-top w-64 group/celda cursor-ns-resize">
                <div class="mt-1.5 text-slate-400 transition-all duration-500 ease-in-out max-h-5 overflow-hidden group-hover/celda:max-h-40 whitespace-normal break-words">
                    ${glosaResaltado}
                </div>
            </td>
            <td class="p-4 text-white font-bold">${docResaltado}</td>
            <td class="p-4 text-emerald-400 font-bold text-right">${reg.importe || '0.00'}</td>
            <td class="p-4 text-slate-500">${reg.hoja_ruta || '-'}</td>
            <td class="p-4 text-slate-500">${reg.n_libro_registro || '-'}</td>
            <td class="p-4"><span class="bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">${reg.ubicacion_fisica || 'Sin ubicar'}</span></td>
            <td class="p-4 text-center sticky right-0 bg-darkcard group-hover:bg-slate-800/80 shadow-[-5px_0_10px_rgba(0,0,0,0.1)] transition-colors">
                <div class="flex items-center justify-center gap-2">
                    <button onclick="verAuditoriaAsientos(${reg.id})" class="w-8 h-8 rounded flex items-center justify-center bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500 hover:text-white"><i class="fas fa-eye"></i></button>
                    <button onclick="cargarDoc('${reg.n_documento || 'Asiento Manual'}', '${reg.ruta_archivo || ''}')" class="w-8 h-8 rounded flex items-center justify-center bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-white"><i class="fas fa-file-pdf"></i></button>
                    <button onclick="prepararEdicionAsientos(${reg.id})" class="w-8 h-8 rounded flex items-center justify-center bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white"><i class="fas fa-edit"></i></button>
                    <button onclick="eliminarRegistroAsientos(${reg.id})" class="w-8 h-8 rounded flex items-center justify-center bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white"><i class="fas fa-trash-alt"></i></button>
                </div>
            </td>
        </tr>`;
    });

    cuerpoTabla.innerHTML = html;
}

async function guardarRegistroAsientos() {
    const usuarioLogueado = JSON.parse(sessionStorage.getItem('usuario_actual') || 'null');
    const idOculto = document.getElementById('asientos_id_oculto').value;
    const detalle_glosa = document.getElementById('asientos_detalle_glosa').value;

    if (!detalle_glosa) return alert("El Detalle / Glosa es obligatorio.");

    const datos = {
        gestion: parseInt(document.getElementById('gestionGlobal').value) || 2026,
        detalle_glosa,
        n_documento: document.getElementById('asientos_n_documento').value || null,
        importe: document.getElementById('asientos_importe').value ? parseFloat(document.getElementById('asientos_importe').value) : null,
        hoja_ruta: document.getElementById('asientos_hoja_ruta').value || null,
        n_libro_registro: document.getElementById('asientos_n_libro_registro').value || null,
        ubicacion_fisica: document.getElementById('asientos_ubicacion_fisica').value || null,
        archivo_temporal: document.getElementById('asientos_archivo_temporal').value,
        eliminar_pdf: eliminarPdfModificadoAsientos,
        usuario_id: usuarioLogueado ? usuarioLogueado.id : null
    };

    let url = 'http://192.168.1.17:3000/api/asientos';
    let metodo = 'POST';

    if (idOculto !== "") {
        url = `${url}/${idOculto}`;
        metodo = 'PUT';
    }

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        if (resultado.exito) {
            alert('✅ Asiento Manual guardado');
            cerrarModalAsientosManuales();
            cargarTablaAsientos();
            limpiarFormularioAsientos();
        } else {
            alert('Error: ' + resultado.mensaje);
        }
    } catch (e) {
        alert('Error de conexión.');
    }
}

async function eliminarRegistroAsientos(id) {
    if (!confirm("¿Eliminar este Asiento Manual?")) return;

    try {
        const respuesta = await fetch(`http://192.168.1.17:3000/api/asientos/${id}`, { method: 'DELETE' });
        const resultado = await respuesta.json();
        if (resultado.exito) cargarTablaAsientos();
    } catch (e) {
        alert('Error al eliminar.');
    }
}

function verAuditoriaAsientos(idRegistro) {
    const registro = listaRegistrosAsientos.find(reg => reg.id === idRegistro);
    if (!registro) return;

    document.getElementById('audi_creador_asientos').innerHTML = `<i class="fas fa-user-shield mr-2"></i> ${registro.nombre_creador || 'SISTEMA'}`;
    document.getElementById('audi_fecha_creacion_asientos').innerText = registro.fecha_creacion ? new Date(registro.fecha_creacion).toLocaleString('es-ES') : '-';

    if (registro.nombre_editor) {
        document.getElementById('audi_editor_asientos').innerHTML = `<i class="fas fa-user-edit mr-2"></i> ${registro.nombre_editor}`;
        document.getElementById('audi_editor_asientos').classList.replace('text-slate-500', 'text-blue-400');
        document.getElementById('audi_fecha_edicion_asientos').innerText = new Date(registro.fecha_edicion).toLocaleString('es-ES');
    } else {
        document.getElementById('audi_editor_asientos').innerHTML = `<span class="italic font-normal">Sin ediciones</span>`;
        document.getElementById('audi_editor_asientos').classList.replace('text-blue-400', 'text-slate-500');
        document.getElementById('audi_fecha_edicion_asientos').innerText = '-';
    }

    document.getElementById('modalAuditoriaAsientos').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('modalAuditoriaContentAsientos').classList.remove('scale-95', 'opacity-0');
    }, 10);
}

function cerrarModalAuditoriaAsientos() {
    document.getElementById('modalAuditoriaContentAsientos').classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        document.getElementById('modalAuditoriaAsientos').classList.add('hidden');
    }, 300);
}

// =========================================================
// HARDWARE Y ESCÁNER (USANDO EL GESTOR CENTRAL)
// =========================================================
const idsHardwareAsientos = {
    btnComprobar: 'btn-comprobar-hardware-asientos',
    luz: 'status-luz-asientos',
    iconoBg: 'status-icono-bg-asientos',
    texto: 'status-texto-asientos',
    nombreEscaner: 'status-nombre-escaner-asientos',
    btnEscanear: 'btn-escanear-asientos',
    lblEstado: 'lbl-estado-escaner-asientos',
    inputTemp: 'asientos_archivo_temporal',
    cajaEsperando: 'contenedor-esperando-pdf-asientos',
    cajaListo: 'contenedor-pdf-listo-asientos',
    nombrePdfListo: 'nombre-pdf-listo-asientos',
    inputRuta: 'ruta_archivo_asientos'
};

function verificarConexionHardwareAsientos() { HardwareCentral.verificarConexion(idsHardwareAsientos); }
function escanearDocumentoEpsonAsientos(event) { HardwareCentral.escanear(event, idsHardwareAsientos); }
function cancelarArchivoAsientos(event) { HardwareCentral.cancelar(event, idsHardwareAsientos, () => { eliminarPdfModificadoAsientos = true; }); }
function previsualizarPdfTemporalAsientos() { HardwareCentral.previsualizar(idsHardwareAsientos); }
function archivoImportadoManualmenteAsientos(input) { HardwareCentral.importarManual(input, idsHardwareAsientos); }

function exportarExcelAsientos() {
    if (listaRegistrosAsientos.length === 0) {
        alert("No hay datos guardados para exportar en esta gestión.");
        return;
    }

    const datosLimpios = listaRegistrosAsientos.map(reg => ({
        "Correlativo": reg.correlativo ? String(reg.correlativo).padStart(3, '0') : '-',
        "Gestión": reg.gestion || '-',
        "Detalle / Glosa": reg.detalle_glosa || '-',
        "N° de Documento": reg.n_documento || '-',
        "Importe (Bs.)": reg.importe ? parseFloat(reg.importe) : 0,
        "Hoja de Ruta": reg.hoja_ruta || '-',
        "Libro Reg.": reg.n_libro_registro || '-',
        "Ubicación Física": reg.ubicacion_fisica || '-'
    }));

    const hoja = XLSX.utils.json_to_sheet(datosLimpios);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "ASIENTOS");

    const gestionActiva = document.getElementById('gestionGlobal').value;
    XLSX.writeFile(libro, `Reporte_Asientos_Gestion_${gestionActiva}.xlsx`);
}