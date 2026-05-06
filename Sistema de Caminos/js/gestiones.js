/* =========================================================
   MÓDULO FRONTEND - SISTEMA DE GESTIONES (POSTGRESQL)
   ========================================================= */

let gestionesRegistradas = []; 
window.gestionAbierta = false;

// 1. OBTENER GESTIONES DESDE EL BACKEND
async function cargarGestionesDesdeBD() {
    try {
        const respuesta = await fetch('http://192.168.1.12:3000/api/gestiones');
        const datos = await respuesta.json();
        
        gestionesRegistradas = datos.map(g => g.anio); 
        actualizarSelectGestiones();
    } catch(error) {
        console.error("Error al cargar gestiones:", error);
    }
}

// 2. ACTUALIZAR LA INTERFAZ Y EL SELECTOR
function actualizarSelectGestiones() {
    const select = document.getElementById('gestionGlobal');
    const divVacio = document.getElementById('dashboard-vacio');
    const divDatos = document.getElementById('dashboard-con-datos');
    
    if (gestionesRegistradas.length === 0) {
        if(divVacio) divVacio.classList.remove('hidden');
        if(divDatos) divDatos.classList.add('hidden');
        if(select) select.innerHTML = `<option value="" class="bg-darkcard text-slate-500">Sin gestiones</option><option value="nuevo" class="bg-accent text-white font-bold">+ Nueva Gestión...</option>`;
        window.gestionAbierta = false;
        return;
    } else {
        if(divVacio) divVacio.classList.add('hidden');
        if(divDatos) divDatos.classList.remove('hidden');
    }

    if(!select) return;

    let html = '';
    gestionesRegistradas.sort((a,b) => b - a).forEach(g => {
        html += `<option value="${g}" class="bg-darkcard text-white">${g}</option>`;
    });
    html += `<option value="nuevo" class="bg-accent text-white font-bold">+ Nueva Gestión...</option>`;
    
    const valorGuardado = (select.value && select.value !== 'nuevo') ? select.value : gestionesRegistradas[0];
    select.innerHTML = html;
    select.value = valorGuardado;
    
    pintarTarjetasGestiones();
    pintarDashboardGestiones();
}

// 3. CONTROLADOR DEL MENÚ DESPLEGABLE 
function cambiarGestion() {
    const select = document.getElementById('gestionGlobal');
    if(select.value === 'nuevo') {
        abrirModalNuevaGestion();
    } else {
        abrirCarpetaGestion(select.value); 
    }
}

// =========================================================
// FUNCIONES DEL MODAL DE NUEVA GESTIÓN
// =========================================================

function abrirModalNuevaGestion() {
    const modal = document.getElementById('modalNuevaGestion');
    const tarjeta = document.getElementById('modalNuevaGestionContent');
    const input = document.getElementById('inputAnioGestion');
    
    input.value = new Date().getFullYear();
    document.getElementById('errorGestion').classList.add('hidden');

    modal.classList.remove('hidden');
    setTimeout(() => {
        tarjeta.classList.remove('scale-95', 'opacity-0');
        tarjeta.classList.add('scale-100', 'opacity-100');
        input.focus();
    }, 10);
}

function cerrarModalNuevaGestion() {
    const modal = document.getElementById('modalNuevaGestion');
    const tarjeta = document.getElementById('modalNuevaGestionContent');
    
    tarjeta.classList.remove('scale-100', 'opacity-100');
    tarjeta.classList.add('scale-95', 'opacity-0');
    
    const select = document.getElementById('gestionGlobal');
    if(select && select.value === 'nuevo') {
        select.value = gestionesRegistradas.length > 0 ? gestionesRegistradas[0] : '';
    }

    setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

// 4. GUARDAR EN POSTGRESQL
async function guardarNuevaGestionBD() {
    const anioTexto = document.getElementById('inputAnioGestion').value;
    const errorTexto = document.getElementById('errorGestion');
    
    if(!anioTexto || anioTexto.length !== 4 || isNaN(anioTexto)) {
        errorTexto.innerText = "Por favor, ingrese un año válido de 4 dígitos (Ej: 2026).";
        errorTexto.classList.remove('hidden');
        return;
    }

    try {
        const respuesta = await fetch('http://192.168.1.12:3000/api/gestiones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ anio: parseInt(anioTexto) })
        });
        
        const resultado = await respuesta.json();

        if(resultado.exito) {
            cerrarModalNuevaGestion();
            await cargarGestionesDesdeBD(); 
            abrirCarpetaGestion(anioTexto); 
            alert(`¡Excelente! La Gestión ${anioTexto} ha sido creada y abierta.`);
        } else {
            errorTexto.innerText = resultado.mensaje;
            errorTexto.classList.remove('hidden');
        }
    } catch (error) {
        errorTexto.innerText = "Error de conexión con el servidor.";
        errorTexto.classList.remove('hidden');
    }
}

// =========================================================
// FUNCIONES PARA DIBUJAR LAS CARPETAS 
// =========================================================

function pintarTarjetasGestiones() {
    const contenedor = document.getElementById('lista-gestiones-cards');
    if(!contenedor) return;

    const gestionActiva = document.getElementById('gestionGlobal').value;
    let html = '';

    gestionesRegistradas.sort((a,b) => b - a).forEach(g => {
        const esActiva = (g.toString() === gestionActiva) && window.gestionAbierta;
        html += `
        <div class="bg-[#0B1120] border ${esActiva ? 'border-accent shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'border-slate-700/50'} rounded-xl p-6 relative group transition-all hover:border-slate-500">
            ${esActiva ? '<span class="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Abierta</span>' : ''}
            <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 rounded-full ${esActiva ? 'bg-accent/20 text-accent' : 'bg-slate-800 text-slate-400'} flex items-center justify-center text-xl">
                    <i class="fas ${esActiva ? 'fa-folder-open' : 'fa-folder'}"></i>
                </div>
                <div>
                    <h3 class="text-2xl font-bold text-white">${g}</h3>
                    <p class="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Base de datos</p>
                </div>
            </div>
            <div class="flex gap-2 mt-6">
                <button onclick="abrirCarpetaGestion('${g}')" class="flex-1 ${esActiva ? 'bg-accent text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'} text-xs font-bold py-2.5 rounded transition-colors">
                    ${esActiva ? 'Gestión Actual' : 'Abrir Gestión'}
                </button>
            </div>
        </div>`;
    });
    contenedor.innerHTML = html;
}

function pintarDashboardGestiones() {
    const contRecientes = document.getElementById('gestiones-recientes-container');
    const contExistentes = document.getElementById('gestiones-existentes-container');
    if(!contRecientes || !contExistentes) return;

    const gestionActiva = document.getElementById('gestionGlobal').value;
    let htmlExistentes = '';
    let htmlRecientes = '';

    let gestionesOrdenadas = [...gestionesRegistradas].sort((a,b) => b - a);
    let reciente = gestionesOrdenadas[0];

    gestionesOrdenadas.forEach(g => {
        const esActiva = (g.toString() === gestionActiva) && window.gestionAbierta;
        const cardHTML = `
        <div onclick="abrirCarpetaGestion('${g}')" class="bg-[#151C2C] border ${esActiva ? 'border-accent shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'border-slate-700/50'} rounded-xl p-5 relative group transition-all hover:border-slate-500 cursor-pointer shadow-lg hover:-translate-y-1 flex flex-col h-full">
            ${esActiva ? '<span class="absolute top-4 right-4 text-emerald-400 text-[9px] font-bold px-2 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 uppercase tracking-wider">Abierta</span>' : ''}
            <div class="flex items-start gap-4 mb-4">
                <div class="w-10 h-10 rounded-lg ${esActiva ? 'bg-accent/20 text-accent' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300'} flex items-center justify-center text-lg transition-colors border border-slate-700/50 flex-shrink-0">
                    <i class="fas ${esActiva ? 'fa-folder-open' : 'fa-folder'}"></i>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-white leading-tight">Gestión ${g}</h3>
                    <p class="text-[10px] text-slate-400 mt-0.5">Archivo Central</p>
                </div>
            </div>
            <button class="w-full ${esActiva ? 'bg-accent text-white' : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700 group-hover:text-white'} text-xs font-bold py-2.5 rounded-lg transition-colors border border-transparent flex items-center justify-center gap-2 mt-auto">
                ${esActiva ? '<i class="fas fa-check-circle"></i> Gestión Actual' : '<i class="fas fa-external-link-alt"></i> Abrir Gestión'}
            </button>
        </div>`;

        htmlExistentes += cardHTML;
        if (g === reciente) {
            htmlRecientes += cardHTML; 
        }
    });

    contExistentes.innerHTML = htmlExistentes;
    contRecientes.innerHTML = htmlRecientes;
}

function abrirCarpetaGestion(anio) {
    window.gestionAbierta = true; 
    const select = document.getElementById('gestionGlobal');
    if(select) select.value = anio;
    
    const tituloDash = document.getElementById('lbl-gestion-dash');
    if(tituloDash) tituloDash.innerText = anio;
    
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
    });

    const panelStats = document.getElementById('panel-estadisticas');
    if(panelStats) {
        panelStats.classList.remove('hidden');
        setTimeout(() => panelStats.classList.remove('opacity-0'), 50);
    }

    pintarTarjetasGestiones();
    pintarDashboardGestiones();
    
    
    // Le preguntamos a app.js en qué pantalla está el usuario para recargarla.
    const cajas = [
        { id: 'caja-tabla_c31_cip', funcion: () => { if(typeof cargarTablaC31Cip === 'function') cargarTablaC31Cip(); } },
        { id: 'caja-tabla_c31_sip', funcion: () => { if(typeof cargarTablaC31Sip === 'function') cargarTablaC31Sip(); } },
        { id: 'caja-tabla_c21_cip', funcion: () => { if(typeof cargarTablaC21Cip === 'function') cargarTablaC21Cip(); } },
        { id: 'caja-tabla_c21_sip', funcion: () => { if(typeof cargarTablaC21Sip === 'function') cargarTablaC21Sip(); } },
        { id: 'caja-tabla_asientos_manuales', funcion: () => { if(typeof cargarTablaAsientos === 'function') cargarTablaAsientos(); } },
        { id: 'caja-prestamos', funcion: () => { if(typeof cargarTablaPrestamos === 'function') cargarTablaPrestamos(); } }
    ];

    cajas.forEach(caja => {
        const elemento = document.getElementById(caja.id);
        
        if(elemento) {
            caja.funcion();
        }
    });
}