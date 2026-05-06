const API_EMPASTADOS = 'http://192.168.1.12:3000/api/empastados';

let tipoEmpastadoActivo = 'c31_cip';
let vistaEmpastadosInicializada = false;

const estadoEdicionEmpastado = {
    id: null,
    tipo: null
};

const CONFIG_EMPASTADOS = {
    c31_cip: {
        nombre: 'C-31 CIP',
        tituloColumna: 'Registros de Ejecución de Gastos',
        subtitulo: 'Empastados de formularios C-31 CIP',
        usaPreventivo: true,
        placeholderTitulo: 'Ej: Registro Enero'
    },
    c31_sip: {
        nombre: 'C-31 SIP',
        tituloColumna: 'Registros de Ejecución de Gastos',
        subtitulo: 'Empastados de formularios C-31 SIP',
        usaPreventivo: true,
        placeholderTitulo: 'Ej: Registro Febrero'
    },
    c21_cip: {
        nombre: 'C-21 CIP',
        tituloColumna: 'Ejecución de Recursos',
        subtitulo: 'Empastados de formularios C-21 CIP',
        usaPreventivo: true,
        placeholderTitulo: 'Ej: Recurso Enero'
    },
    c21_sip: {
        nombre: 'C-21 SIP',
        tituloColumna: 'Ejecución de Recursos',
        subtitulo: 'Empastados de formularios C-21 SIP',
        usaPreventivo: true,
        placeholderTitulo: 'Ej: Recurso Febrero'
    },
    asientos_manuales: {
        nombre: 'Asientos Manuales',
        tituloColumna: 'Asientos Manuales',
        subtitulo: 'Empastados de asientos manuales',
        usaPreventivo: true,
        placeholderTitulo: 'Ej: Asiento Manual'
    },
    formulario_bancarizacion: {
        nombre: 'Formulario de Bancarización',
        tituloColumna: 'Formulario de Bancarización',
        subtitulo: 'Empastados de formularios de bancarización',
        usaPreventivo: false,
        placeholderTitulo: 'Ej: Formulario Bancarización'
    }
};

function obtenerConfigEmpastado(tipo) {
    return CONFIG_EMPASTADOS[tipo] || CONFIG_EMPASTADOS.c31_cip;
}

function obtenerIdRegistro(registro, tipo) {
    if (tipo === 'c31_cip') return registro.id_c31_cip;
    if (tipo === 'c31_sip') return registro.id_c31_sip;
    if (tipo === 'c21_cip') return registro.id_c21_cip;
    if (tipo === 'c21_sip') return registro.id_c21_sip;
    if (tipo === 'asientos_manuales') return registro.id_asiento_manual;
    if (tipo === 'formulario_bancarizacion') return registro.id_bancarizacion;
    return null;
}

function obtenerValor(id) {
    const elemento = document.getElementById(id);
    return elemento ? elemento.value.trim() : '';
}

function setValor(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.value = valor ?? '';
}

function limpiarFormulario(tipo) {
    setValor(`nuevo_titulo_${tipo}`, '');
    setValor(`nuevo_numero_${tipo}`, '');
    setValor(`nuevo_gestion_${tipo}`, '');
    setValor(`nuevo_ubicacion_${tipo}`, '');
    setValor(`nuevo_preventivo_${tipo}`, '');
}

function cargarDatosEnFormulario(tipo, registro) {
    setValor(`nuevo_titulo_${tipo}`, registro.titulo || '');
    setValor(`nuevo_numero_${tipo}`, registro.numero_empastado || '');
    setValor(`nuevo_gestion_${tipo}`, registro.gestion || '');
    setValor(`nuevo_ubicacion_${tipo}`, registro.ubicacion_fisica || '');
    setValor(`nuevo_preventivo_${tipo}`, registro.preventivo || '');
}

function actualizarBotonesFormulario() {
    const btnGuardar = document.getElementById('btnGuardarEmpastado');
    const btnCancelar = document.getElementById('btnCancelarEdicionEmpastado');
    const lblModo = document.getElementById('lblModoFormularioEmpastado');

    if (!btnGuardar || !btnCancelar || !lblModo) return;

    const estaEditando =
        estadoEdicionEmpastado.id !== null &&
        estadoEdicionEmpastado.tipo === tipoEmpastadoActivo;

    if (estaEditando) {
        btnGuardar.innerHTML = '<i class="fas fa-pen-to-square mr-1"></i> Actualizar';
        btnGuardar.classList.remove('bg-emerald-500', 'hover:bg-emerald-600', 'shadow-[0_0_10px_rgba(16,185,129,0.3)]');
        btnGuardar.classList.add('bg-blue-500', 'hover:bg-blue-600', 'shadow-[0_0_10px_rgba(59,130,246,0.3)]');

        btnCancelar.classList.remove('hidden');

        lblModo.innerHTML = `
            <span class="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                <i class="fas fa-pen"></i> Editando registro
            </span>
        `;
    } else {
        btnGuardar.innerHTML = '<i class="fas fa-save mr-1"></i> Guardar';
        btnGuardar.classList.remove('bg-blue-500', 'hover:bg-blue-600', 'shadow-[0_0_10px_rgba(59,130,246,0.3)]');
        btnGuardar.classList.add('bg-emerald-500', 'hover:bg-emerald-600', 'shadow-[0_0_10px_rgba(16,185,129,0.3)]');

        btnCancelar.classList.add('hidden');

        lblModo.innerHTML = `
            <span class="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                <i class="fas fa-plus"></i> Nuevo registro
            </span>
        `;
    }
}

function marcarFilaEditando() {
    document.querySelectorAll('[data-fila-empastado="true"]').forEach(fila => {
        fila.classList.remove(
            'bg-blue-500/10',
            'ring-1',
            'ring-blue-500/40'
        );

        const badge = fila.querySelector('.badge-editando-fila');
        if (badge) badge.remove();
    });

    if (
        estadoEdicionEmpastado.id === null ||
        estadoEdicionEmpastado.tipo !== tipoEmpastadoActivo
    ) {
        return;
    }

    const filaActiva = document.querySelector(
        `[data-fila-empastado="true"][data-id="${estadoEdicionEmpastado.id}"][data-tipo="${estadoEdicionEmpastado.tipo}"]`
    );

    if (!filaActiva) return;

    filaActiva.classList.add(
        'bg-blue-500/10',
        'ring-1',
        'ring-blue-500/40'
    );

    const primeraCelda = filaActiva.querySelector('td');
    if (primeraCelda && !primeraCelda.querySelector('.badge-editando-fila')) {
        primeraCelda.insertAdjacentHTML(
            'beforeend',
            `
            <div class="badge-editando-fila mt-2">
                <span class="inline-flex items-center gap-1 bg-blue-500/15 border border-blue-500/30 text-blue-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    <i class="fas fa-pen"></i> Editando
                </span>
            </div>
            `
        );
    }
}

function cancelarEdicionEmpastado() {
    estadoEdicionEmpastado.id = null;
    estadoEdicionEmpastado.tipo = null;
    limpiarFormulario(tipoEmpastadoActivo);
    actualizarBotonesFormulario();
    marcarFilaEditando();
}

function renderResumenEmpastado(tipo) {
    const config = obtenerConfigEmpastado(tipo);
    const caja = document.getElementById('resumenEmpastadoActual');
    if (!caja) return;

    caja.innerHTML = `
        <div class="bg-[#0F172A] border border-slate-800 rounded-2xl px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
                <h3 class="text-white font-black text-lg">${config.nombre}</h3>
                <p class="text-slate-400 text-sm">${config.subtitulo}</p>
            </div>
            <div class="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
                <i class="fas fa-filter"></i>
                Filtro activo: ${config.nombre}
            </div>
        </div>
    `;
}

function renderTablaEmpastados(tipo) {
    const config = obtenerConfigEmpastado(tipo);
    const contenedor = document.getElementById('contenedorTablaEmpastados');
    if (!contenedor) return;

    const encabezadoPreventivo = config.usaPreventivo
        ? `<th class="p-4 border-b border-slate-800">${tipo === 'asientos_manuales' ? 'Número / Rango' : 'Preventivo'}</th>`
        : '';

    const inputPreventivo = config.usaPreventivo
        ? `
            <td class="p-4">
                <input
                    type="text"
                    id="nuevo_preventivo_${tipo}"
                    placeholder="Ej: 1-10"
                    class="bg-[#0B1120] text-slate-300 px-3 py-2 rounded-lg border border-slate-700 w-full text-xs"
                >
            </td>
        `
        : '';

    contenedor.innerHTML = `
        <div class="bg-[#111827]/50 border border-slate-800 rounded-2xl overflow-hidden h-full">
            <div class="px-4 py-3 border-b border-slate-800 bg-[#111827] flex items-center justify-between">
                <div id="lblModoFormularioEmpastado"></div>
            </div>

            <div class="overflow-auto h-full scroll-custom">
                <table class="w-full text-left text-xs whitespace-nowrap min-w-full">
                    <thead class="bg-[#0B1120] text-[10px] uppercase font-bold text-slate-500 tracking-wider sticky top-0 z-10">
                        <tr>
                            <th class="p-4 border-b border-slate-800">${config.tituloColumna}</th>
                            <th class="p-4 border-b border-slate-800">Número de Empastado</th>
                            <th class="p-4 border-b border-slate-800">Gestión</th>
                            ${encabezadoPreventivo}
                            <th class="p-4 border-b border-slate-800">Ubicación Física</th>
                            <th class="p-4 border-b border-slate-800 text-center">Acciones</th>
                        </tr>
                    </thead>

                    <tbody id="tbodyEmpastadosDinamico" class="divide-y divide-slate-800/50 text-slate-300">
                        <tr class="bg-[#151C2C] border-b border-accent/20">
                            <td class="p-4">
                                <input
                                    type="text"
                                    id="nuevo_titulo_${tipo}"
                                    placeholder="${config.placeholderTitulo}"
                                    class="bg-[#0B1120] text-slate-300 px-3 py-2 rounded-lg border border-slate-700 w-full text-xs"
                                >
                            </td>

                            <td class="p-4">
                                <input
                                    type="text"
                                    id="nuevo_numero_${tipo}"
                                    placeholder="EMP-001"
                                    class="bg-[#0B1120] text-slate-300 px-3 py-2 rounded-lg border border-slate-700 w-full text-xs"
                                >
                            </td>

                            <td class="p-4">
                                <input
                                    type="number"
                                    id="nuevo_gestion_${tipo}"
                                    placeholder="2026"
                                    class="bg-[#0B1120] text-slate-300 px-3 py-2 rounded-lg border border-slate-700 w-full text-xs"
                                >
                            </td>

                            ${inputPreventivo}

                            <td class="p-4">
                                <input
                                    type="text"
                                    id="nuevo_ubicacion_${tipo}"
                                    placeholder="Ej: Estante A / Caja 1"
                                    class="bg-[#0B1120] text-slate-300 px-3 py-2 rounded-lg border border-slate-700 w-full text-xs"
                                >
                            </td>

                            <td class="p-4 text-center">
                                <div class="flex items-center justify-center gap-2">
                                    <button
                                        id="btnGuardarEmpastado"
                                        onclick="guardarEmpastado(tipoEmpastadoActivo)"
                                        class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                    >
                                        <i class="fas fa-save mr-1"></i> Guardar
                                    </button>

                                    <button
                                        id="btnCancelarEdicionEmpastado"
                                        onclick="cancelarEdicionEmpastado()"
                                        class="hidden bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    actualizarBotonesFormulario();
    marcarFilaEditando();
}

function construirFilaHtml(registro, tipo) {
    const config = obtenerConfigEmpastado(tipo);
    const idRegistro = obtenerIdRegistro(registro, tipo);

    const columnaPreventivo = config.usaPreventivo
        ? `<td class="p-4">${registro.preventivo || '-'}</td>`
        : '';

    const estaEditando =
        estadoEdicionEmpastado.id === idRegistro &&
        estadoEdicionEmpastado.tipo === tipo;

    return `
        <tr
            data-fila-empastado="true"
            data-id="${idRegistro}"
            data-tipo="${tipo}"
            class="hover:bg-slate-800/70 transition-colors ${estaEditando ? 'bg-blue-500/10 ring-1 ring-blue-500/40' : ''}"
        >
            <td class="p-4 font-bold text-white">
                ${registro.titulo || ''}
                ${
                    estaEditando
                        ? `
                        <div class="badge-editando-fila mt-2">
                            <span class="inline-flex items-center gap-1 bg-blue-500/15 border border-blue-500/30 text-blue-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                <i class="fas fa-pen"></i> Editando
                            </span>
                        </div>
                        `
                        : ''
                }
            </td>
            <td class="p-4 text-accent font-bold">${registro.numero_empastado || ''}</td>
            <td class="p-4">${registro.gestion ?? ''}</td>
            ${columnaPreventivo}
            <td class="p-4">
                <span class="bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">
                    ${registro.ubicacion_fisica || ''}
                </span>
            </td>
            <td class="p-4 text-center">
                <div class="flex items-center justify-center gap-2">
                    <button onclick="editarEmpastado(${idRegistro}, '${tipo}')" class="bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors">
                        Editar
                    </button>
                    <button onclick="eliminarEmpastado(${idRegistro}, '${tipo}')" class="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors">
                        Eliminar
                    </button>
                </div>
            </td>
        </tr>
    `;
}

async function cargarEmpastados(tipo) {
    const tbody = document.getElementById('tbodyEmpastadosDinamico');
    if (!tbody) return;

    try {
        const respuesta = await fetch(`${API_EMPASTADOS}/${tipo}`);
        const resultado = await respuesta.json();

        const filaFormulario = tbody.firstElementChild ? tbody.firstElementChild.outerHTML : '';
        tbody.innerHTML = filaFormulario;

        if (!resultado.ok) {
            console.error(resultado.mensaje || 'No se pudo listar.');
            actualizarBotonesFormulario();
            marcarFilaEditando();
            return;
        }

        resultado.data.forEach(registro => {
            tbody.insertAdjacentHTML('beforeend', construirFilaHtml(registro, tipo));
        });

        actualizarBotonesFormulario();
        marcarFilaEditando();

    } catch (error) {
        console.error('Error al cargar empastados:', error);
    }
}

async function guardarEmpastado(tipo) {
    const titulo = obtenerValor(`nuevo_titulo_${tipo}`);
    const numero = obtenerValor(`nuevo_numero_${tipo}`);
    const gestion = obtenerValor(`nuevo_gestion_${tipo}`);
    const ubicacion = obtenerValor(`nuevo_ubicacion_${tipo}`);
    const preventivo = obtenerValor(`nuevo_preventivo_${tipo}`);

    if (!titulo || !numero || !gestion || !ubicacion) {
        alert('Por favor, llena todos los campos obligatorios.');
        return;
    }

    const datos = {
        titulo,
        numero_empastado: numero,
        gestion: Number(gestion),
        preventivo,
        ubicacion_fisica: ubicacion
    };

    const esEdicion =
        estadoEdicionEmpastado.id !== null &&
        estadoEdicionEmpastado.tipo === tipo;

    const url = esEdicion
        ? `${API_EMPASTADOS}/${tipo}/${estadoEdicionEmpastado.id}`
        : `${API_EMPASTADOS}/${tipo}`;

    const metodo = esEdicion ? 'PUT' : 'POST';

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        if (!resultado.ok) {
            alert(resultado.mensaje || `No se pudo ${esEdicion ? 'actualizar' : 'guardar'}.`);
            return;
        }

        alert(esEdicion ? 'Registro actualizado correctamente.' : 'Registro guardado correctamente.');

        cancelarEdicionEmpastado();
        cargarEmpastados(tipo);

    } catch (error) {
        console.error(`Error al ${esEdicion ? 'actualizar' : 'guardar'}:`, error);
        alert('No se pudo conectar con el servidor.');
    }
}

async function editarEmpastado(id, tipo) {
    try {
        const respuesta = await fetch(`${API_EMPASTADOS}/${tipo}/${id}`);
        const resultado = await respuesta.json();

        if (!resultado.ok) {
            alert(resultado.mensaje || 'No se pudo obtener el registro.');
            return;
        }

        const actual = resultado.data;

        if (tipo !== tipoEmpastadoActivo) {
            const select = document.getElementById('filtroTipoEmpastado');
            if (select) {
                select.value = tipo;
            }

            tipoEmpastadoActivo = tipo;
            renderResumenEmpastado(tipoEmpastadoActivo);
            renderTablaEmpastados(tipoEmpastadoActivo);
            await cargarEmpastados(tipoEmpastadoActivo);
        }

        estadoEdicionEmpastado.id = id;
        estadoEdicionEmpastado.tipo = tipo;

        cargarDatosEnFormulario(tipo, actual);
        actualizarBotonesFormulario();
        marcarFilaEditando();

        const primerInput = document.getElementById(`nuevo_titulo_${tipo}`);
        if (primerInput) {
            primerInput.focus();
            primerInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

    } catch (error) {
        console.error('Error al editar:', error);
        alert('No se pudo conectar con el servidor.');
    }
}

async function eliminarEmpastado(id, tipo) {
    const confirmar = confirm('¿Estás seguro de eliminar este registro?');
    if (!confirmar) return;

    try {
        const respuesta = await fetch(`${API_EMPASTADOS}/${tipo}/${id}`, {
            method: 'DELETE'
        });

        const resultado = await respuesta.json();

        if (!resultado.ok) {
            alert(resultado.mensaje || 'No se pudo eliminar.');
            return;
        }

        if (estadoEdicionEmpastado.id === id && estadoEdicionEmpastado.tipo === tipo) {
            cancelarEdicionEmpastado();
        }

        alert('Registro eliminado correctamente.');
        cargarEmpastados(tipo);

    } catch (error) {
        console.error('Error al eliminar:', error);
        alert('No se pudo conectar con el servidor.');
    }
}

function cambiarFiltroEmpastado() {
    const select = document.getElementById('filtroTipoEmpastado');
    if (!select) return;

    tipoEmpastadoActivo = select.value;
    estadoEdicionEmpastado.id = null;
    estadoEdicionEmpastado.tipo = null;

    renderResumenEmpastado(tipoEmpastadoActivo);
    renderTablaEmpastados(tipoEmpastadoActivo);
    cargarEmpastados(tipoEmpastadoActivo);
}

function inicializarVistaEmpastados() {
    const select = document.getElementById('filtroTipoEmpastado');
    const contenedor = document.getElementById('contenedorTablaEmpastados');

    if (!select || !contenedor) return false;
    if (vistaEmpastadosInicializada) return true;

    tipoEmpastadoActivo = select.value || 'c31_cip';

    renderResumenEmpastado(tipoEmpastadoActivo);
    renderTablaEmpastados(tipoEmpastadoActivo);
    cargarEmpastados(tipoEmpastadoActivo);

    vistaEmpastadosInicializada = true;
    return true;
}

const intervaloEmpastados = setInterval(() => {
    if (inicializarVistaEmpastados()) {
        clearInterval(intervaloEmpastados);
    }
}, 300);