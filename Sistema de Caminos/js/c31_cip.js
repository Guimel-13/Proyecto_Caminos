// =========================================================
// MÓDULO FRONTEND - FUNCIONES: C-31 CIP
// =========================================================

let listaRegistrosC31 = [];
let eliminarPdfModificado = false; // 🪄 Bandera secreta para saber si borraron el PDF al editar

function abrirModalRegistro(esEdicion = false) {
    const modal = document.getElementById('modalRegistro');
    const tarjeta = document.getElementById('modalRegistroContent');
    
    eliminarPdfModificado = false; // Reiniciamos la bandera
    
    if(!esEdicion) {
        document.getElementById('tituloFormulario').innerHTML = '<i class="fas fa-plus-square text-accent"></i> Nuevo Formulario C-31 CIP';
        document.getElementById('lblCodigoFormulario').innerText = "AUTO";
        limpiarFormularioC31(); 
    }
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        tarjeta.classList.remove('scale-95', 'opacity-0');
        tarjeta.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function prepararEdicionC31(idRegistro) {
    const registro = listaRegistrosC31.find(reg => reg.id === idRegistro);
    if(!registro) return;

    eliminarPdfModificado = false; // Reiniciamos
    
    document.getElementById('c31_id_oculto').value = registro.id;
    document.getElementById('c31_archivo_temporal').value = ''; 
    document.getElementById('c31_beneficiario').value = registro.beneficiario || '';
    document.getElementById('c31_detalle').value = registro.detalle_resumen || '';
    document.getElementById('c31_n_preventivo').value = registro.n_preventivo || '';
    document.getElementById('c31_n_compromiso').value = registro.n_compromiso || '';
    document.getElementById('c31_n_devengado').value = registro.n_devengado || '';
    document.getElementById('c31_n_secuencia').value = registro.n_secuencia || '';
    document.getElementById('c31_importe').value = registro.importe || '';
    document.getElementById('c31_fojas').value = registro.fojas || '';
    document.getElementById('c31_hoja_ruta').value = registro.hoja_ruta || '';
    document.getElementById('c31_n_libro_registro').value = registro.n_libro_registro || '';
    document.getElementById('c31_ubicacion_fisica').value = registro.ubicacion_fisica || '';

    document.getElementById('tituloFormulario').innerHTML = '<i class="fas fa-edit text-blue-400"></i> Editar Registro C-31';
    document.getElementById('lblCodigoFormulario').innerText = registro.correlativo ? String(registro.correlativo).padStart(3, '0') : registro.id; 

    const cajaEsperando = document.getElementById('contenedor-esperando-pdf');
    const cajaListo = document.getElementById('contenedor-pdf-listo');
    const nombrePdfListo = document.getElementById('nombre-pdf-listo');

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
    abrirModalRegistro(true);
}

function cerrarModalRegistro() {
    const modal = document.getElementById('modalRegistro');
    const tarjeta = document.getElementById('modalRegistroContent');
    tarjeta.classList.remove('scale-100', 'opacity-100');
    tarjeta.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

function limpiarFormularioC31() {
    document.getElementById('c31_id_oculto').value = '';
    document.getElementById('c31_archivo_temporal').value = ''; 
    document.getElementById('c31_beneficiario').value = '';
    document.getElementById('c31_detalle').value = '';
    document.getElementById('c31_n_preventivo').value = '';
    document.getElementById('c31_n_compromiso').value = '';
    document.getElementById('c31_n_devengado').value = '';
    document.getElementById('c31_n_secuencia').value = '';
    document.getElementById('c31_importe').value = '';
    document.getElementById('c31_fojas').value = '';
    document.getElementById('c31_hoja_ruta').value = '';
    document.getElementById('c31_n_libro_registro').value = '';
    document.getElementById('c31_ubicacion_fisica').value = '';

    const lblEstado = document.getElementById('lbl-estado-escaner');
    if(lblEstado) lblEstado.classList.add('hidden');
    
    const btnEscanear = document.getElementById('btn-escanear-c31');
    if(btnEscanear) {
        btnEscanear.innerHTML = '<i class="fas fa-satellite-dish"></i> Activar Escáner';
        btnEscanear.classList.remove('bg-emerald-600', 'text-white');
    }

    const cajaEsperando = document.getElementById('contenedor-esperando-pdf');
    const cajaListo = document.getElementById('contenedor-pdf-listo');
    if(cajaEsperando && cajaListo) {
        cajaEsperando.classList.remove('hidden'); 
        cajaListo.classList.add('hidden');        
        cajaListo.removeAttribute('data-ruta-actual');
        const inputManual = document.getElementById('ruta_archivo');
        if(inputManual) inputManual.value = ''; 
    }
}   

async function cargarTablaC31Cip(){
    const cuerpoTabla = document.getElementById('cuerpo-tabla-c31-cip');
    if (!cuerpoTabla) return;
    const gestionActiva = document.getElementById('gestionGlobal').value;
    cuerpoTabla.innerHTML = `<tr><td colspan="15" class="p-4 text-center text-slate-400"><i class="fas fa-spinner fa-spin mr-2"></i> Cargando registros de la Gestión ${gestionActiva}...</td></tr>`;

    try {
        const respuesta = await fetch(`http://192.168.1.17:3000/api/c31-cip?gestion=${gestionActiva}`);
        listaRegistrosC31 = await respuesta.json();
        renderizarTablaC31(listaRegistrosC31);
    } catch (error) {
        cuerpoTabla.innerHTML = `<tr><td colspan="15" class="p-4 text-center text-red-400 font-bold">Error al conectar con la base de datos.</td></tr>`;
    }
}

function buscarEnC31() {
    const textoBuscado = document.getElementById('buscadorGlobal').value.toLowerCase();
    const resultados = listaRegistrosC31.filter(reg => {
        return (reg.beneficiario || '').toLowerCase().includes(textoBuscado) || 
               (reg.detalle_resumen || '').toLowerCase().includes(textoBuscado) || 
               (reg.n_preventivo || '').toLowerCase().includes(textoBuscado) || 
               String(reg.correlativo || '').includes(textoBuscado) ||
               String(reg.id || '').includes(textoBuscado);
    });
    renderizarTablaC31(resultados);
}

function renderizarTablaC31(datosA_Mostrar) {
    const cuerpoTabla = document.getElementById('cuerpo-tabla-c31-cip');
    const gestionActiva = document.getElementById('gestionGlobal').value;
    const textoBuscado = document.getElementById('buscadorGlobal').value.trim();

    if (datosA_Mostrar.length === 0) {
        cuerpoTabla.innerHTML = `<tr><td colspan="15" class="p-4 text-center text-slate-500 font-bold">No se encontraron resultados en la Gestión ${gestionActiva}.</td></tr>`;
        return;
    }

    let html = '';
    datosA_Mostrar.forEach(reg => {
        const numeroFormateado = reg.correlativo ? String(reg.correlativo).padStart(3, '0') : '-';
        
        // Asume que resaltarTexto está en app.js y es global
        const idResaltado = typeof resaltarTexto === 'function' ? resaltarTexto(reg.id, textoBuscado) : reg.id;
        const correlativoResaltado = typeof resaltarTexto === 'function' ? resaltarTexto(numeroFormateado, textoBuscado) : numeroFormateado;
        const beneficiarioResaltado = typeof resaltarTexto === 'function' ? resaltarTexto(reg.beneficiario || 'Sin nombre', textoBuscado) : (reg.beneficiario || 'Sin nombre');
        const detalleResaltado = typeof resaltarTexto === 'function' ? resaltarTexto(reg.detalle_resumen, textoBuscado) : reg.detalle_resumen;
        const preventivoResaltado = typeof resaltarTexto === 'function' ? resaltarTexto(reg.n_preventivo, textoBuscado) : reg.n_preventivo;

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
            <td class="p-4">${preventivoResaltado || '-'}</td>
            <td class="p-4">${reg.n_compromiso || '-'}</td>
            <td class="p-4">${reg.n_devengado || '-'}</td>
            <td class="p-4 text-slate-500">${reg.n_secuencia || '-'}</td>
            <td class="p-4 text-emerald-400 font-bold text-right">${reg.importe || '0.00'}</td>
            <td class="p-4">${reg.fojas || '-'}</td>
            <td class="p-4 text-slate-500">${reg.hoja_ruta || '-'}</td>
            <td class="p-4 text-slate-500">${reg.n_libro_registro || '-'}</td>
            <td class="p-4"><span class="bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">${reg.ubicacion_fisica || 'Sin ubicar'}</span></td>
            <td class="p-4 text-center sticky right-0 bg-darkcard group-hover:bg-slate-800/80 shadow-[-5px_0_10px_rgba(0,0,0,0.1)] transition-colors">
                <div class="flex items-center justify-center gap-2">
                    <button onclick="verAuditoriaC31(${reg.id})" class="w-8 h-8 rounded flex items-center justify-center bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white"><i class="fas fa-eye"></i></button>
                    <button onclick="cargarDoc('${reg.beneficiario}', '${reg.ruta_archivo}?t=${Date.now()}')" class="w-8 h-8 rounded flex items-center justify-center bg-accent/10 text-accent hover:bg-accent hover:text-white"><i class="fas fa-file-pdf"></i></button>
                    <button onclick="prepararEdicionC31(${reg.id})" class="w-8 h-8 rounded flex items-center justify-center bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white"><i class="fas fa-edit"></i></button>
                    <button onclick="eliminarRegistroC31(${reg.id})" class="w-8 h-8 rounded flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"><i class="fas fa-trash-alt"></i></button>
                </div>
            </td>
        </tr>`;
    });
    cuerpoTabla.innerHTML = html;
}

function verAuditoriaC31(idRegistro) {
    const registro = listaRegistrosC31.find(reg => reg.id === idRegistro);
    if(!registro) return;
    document.getElementById('audi_creador').innerHTML = `<i class="fas fa-user-shield mr-2"></i> ${registro.nombre_creador || 'SISTEMA'}`;
    document.getElementById('audi_fecha_creacion').innerText = registro.fecha_creacion ? new Date(registro.fecha_creacion).toLocaleString('es-ES') : '-';
    if (registro.nombre_editor) {
        document.getElementById('audi_editor').innerHTML = `<i class="fas fa-user-edit mr-2"></i> ${registro.nombre_editor}`;
        document.getElementById('audi_editor').classList.replace('text-slate-500', 'text-blue-400');
        document.getElementById('audi_fecha_edicion').innerText = new Date(registro.fecha_edicion).toLocaleString('es-ES');
    } else {
        document.getElementById('audi_editor').innerHTML = `<span class="italic font-normal">Sin ediciones registradas</span>`;
        document.getElementById('audi_editor').classList.replace('text-blue-400', 'text-slate-500');
        document.getElementById('audi_fecha_edicion').innerText = '-';
    }
    document.getElementById('modalAuditoria').classList.remove('hidden');
    setTimeout(() => { document.getElementById('modalAuditoriaContent').classList.remove('scale-95', 'opacity-0'); }, 10);
}

function cerrarModalAuditoria() {
    document.getElementById('modalAuditoriaContent').classList.add('scale-95', 'opacity-0');
    setTimeout(() => { document.getElementById('modalAuditoria').classList.add('hidden'); }, 300);
}

async function guardarRegistroC31() {
    const usuarioLogueado = JSON.parse(sessionStorage.getItem('usuario_actual') || 'null');
    const idOculto = document.getElementById('c31_id_oculto').value;
    const beneficiario = document.getElementById('c31_beneficiario').value;
    const detalle = document.getElementById('c31_detalle').value;
    
    if(!beneficiario || !detalle) return alert("Por favor, llena al menos Beneficiario y Detalle.");

    const datos = {
        gestion: parseInt(document.getElementById('gestionGlobal').value) || 2026,
        beneficiario, detalle,
        n_preventivo: document.getElementById('c31_n_preventivo').value || null,
        n_compromiso: document.getElementById('c31_n_compromiso').value || null,
        n_devengado: document.getElementById('c31_n_devengado').value || null,
        n_secuencia: document.getElementById('c31_n_secuencia').value ? parseInt(document.getElementById('c31_n_secuencia').value) : null,
        importe: document.getElementById('c31_importe').value ? parseFloat(document.getElementById('c31_importe').value) : null,
        fojas: document.getElementById('c31_fojas').value ? parseInt(document.getElementById('c31_fojas').value) : null,
        hoja_ruta: document.getElementById('c31_hoja_ruta').value || null,
        n_libro_registro: document.getElementById('c31_n_libro_registro').value || null,
        ubicacion_fisica: document.getElementById('c31_ubicacion_fisica').value || null,
        archivo_temporal: document.getElementById('c31_archivo_temporal').value,
        eliminar_pdf: eliminarPdfModificado, 
        usuario_id: usuarioLogueado ? usuarioLogueado.id : null 
    };

    let url = 'http://192.168.1.17:3000/api/c31-cip';
    let metodo = 'POST';
    if (idOculto !== "") { url = `${url}/${idOculto}`; metodo = 'PUT'; }

    try {
        const respuesta = await fetch(url, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
        const resultado = await respuesta.json();
        if (resultado.exito) {
            alert('✅ Registro guardado');
            cerrarModalRegistro(); cargarTablaC31Cip(); limpiarFormularioC31(); 
        } else alert('Error: ' + resultado.mensaje);
    } catch (e) { alert('Error de conexión.'); }
}

async function eliminarRegistroC31(id) {
    if (!confirm("¿Eliminar documento permanentemente?")) return;
    try {
        const respuesta = await fetch(`http://192.168.1.17:3000/api/c31-cip/${id}`, { method: 'DELETE' });
        const resultado = await respuesta.json();
        if (resultado.exito) cargarTablaC31Cip(); 
    } catch (e) { alert('Error al eliminar.'); }
}

// 🪄 EXCEL PREMIUM RESTAURADO
function exportarExcelC31() {
    if (listaRegistrosC31.length === 0) {
        alert("No hay datos guardados para exportar en esta gestión.");
        return;
    }

    const datosLimpios = listaRegistrosC31.map(reg => {
        return {
            "Correlativo": reg.correlativo ? String(reg.correlativo).padStart(3, '0') : '-',
            "Gestión": reg.gestion || '-',
            "Beneficiario": reg.beneficiario || 'Sin nombre',
            "Detalle / Resumen": reg.detalle_resumen || '-',
            "N° Preventivo": reg.n_preventivo || '-',
            "N° Compromiso": reg.n_compromiso || '-',
            "N° Devengado": reg.n_devengado || '-',
            "Secuencia": reg.n_secuencia || '-',
            "Importe (Bs.)": reg.importe ? parseFloat(reg.importe) : 0,
            "Fojas": reg.fojas || '-',
            "Hoja de Ruta": reg.hoja_ruta || '-',
            "Libro Reg.": reg.n_libro_registro || '-',
            "Ubicación Física": reg.ubicacion_fisica || '-'
        };
    });

    const hoja = XLSX.utils.json_to_sheet(datosLimpios);
    const rango = XLSX.utils.decode_range(hoja['!ref']); 

    for (let fila = rango.s.r; fila <= rango.e.r; fila++) {
        for (let col = rango.s.c; col <= rango.e.c; col++) {
            const direccionCelda = XLSX.utils.encode_cell({ r: fila, c: col });
            if (!hoja[direccionCelda]) continue; 

            hoja[direccionCelda].s = {
                font: { name: "Arial", sz: 10 },
                alignment: { vertical: "center" },
                border: { 
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } }
                }
            };

            if (fila === 0) {
                hoja[direccionCelda].s.font.bold = true;
                hoja[direccionCelda].s.font.color = { rgb: "FFFFFF" };
                hoja[direccionCelda].s.fill = { fgColor: { rgb: "A855F7" } };
                hoja[direccionCelda].s.alignment.horizontal = "center";
            } else {
                if (col !== 2 && col !== 3) {
                    hoja[direccionCelda].s.alignment.horizontal = "center";
                }
            }
        }
    }

    const anchosColumnas = [
        { wch: 12 }, { wch: 10 }, { wch: 40 }, { wch: 60 }, 
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, 
        { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 25 }
    ];
    hoja['!cols'] = anchosColumnas;

    hoja['!pageSetup'] = { 
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        paperSize: 1
    };

    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Reporte C-31");
    const gestionActiva = document.getElementById('gestionGlobal').value;
    XLSX.writeFile(libro, `Reporte_C31_Gestion_${gestionActiva}.xlsx`);
}

// =========================================================
// 5. HARDWARE Y ESCÁNER (USANDO EL GESTOR CENTRAL)
// =========================================================
const idsHardwareC31 = {
    btnComprobar: 'btn-comprobar-hardware', luz: 'status-luz', iconoBg: 'status-icono-bg',
    texto: 'status-texto', nombreEscaner: 'status-nombre-escaner', btnEscanear: 'btn-escanear-c31',
    lblEstado: 'lbl-estado-escaner', inputTemp: 'c31_archivo_temporal', inputFojas: 'c31_fojas',
    cajaEsperando: 'contenedor-esperando-pdf', cajaListo: 'contenedor-pdf-listo',
    nombrePdfListo: 'nombre-pdf-listo', inputRuta: 'ruta_archivo'
};

function verificarConexionHardware() { HardwareCentral.verificarConexion(idsHardwareC31); }
function escanearDocumentoEpson(event) { HardwareCentral.escanear(event, idsHardwareC31); }
function cancelarArchivo(event) { HardwareCentral.cancelar(event, idsHardwareC31, () => { eliminarPdfModificado = true; }); }
function previsualizarPdfTemporal() { HardwareCentral.previsualizar(idsHardwareC31); }
function archivoImportadoManualmente(input) { HardwareCentral.importarManual(input, idsHardwareC31); }