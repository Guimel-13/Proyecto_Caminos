/* =========================================================
   MÓDULO GLOBAL - GESTOR DE HARDWARE Y PDF (DRY)
   ========================================================= */

const URL_LOCAL = 'http://localhost:4010';
const URL_SERVIDOR = 'http://192.168.1.12:3000';

async function probarEscanerLocal() {
    try {
        const respuesta = await fetch(`${URL_LOCAL}/estado`);
        const resultado = await respuesta.json();

        if (resultado.exito && resultado.conectado) {
            return {
                modo: 'local',
                estado: resultado
            };
        }
    } catch (error) {
        // No hacemos nada, se intentará servidor
    }

    return null;
}

async function probarEscanerServidor() {
    try {
        const respuesta = await fetch(`${URL_SERVIDOR}/api/hardware/estado`);
        const resultado = await respuesta.json();

        if (resultado.exito && resultado.conectado) {
            return {
                modo: 'servidor',
                estado: resultado
            };
        }
    } catch (error) {
        // no hacemos nada
    }

    return null;
}

async function detectarEscanerDisponible() {
    // PRIORIDAD 1: ScannerClient local
    const local = await probarEscanerLocal();
    if (local) return local;

    // PRIORIDAD 2: escáner del servidor
    const servidor = await probarEscanerServidor();
    if (servidor) return servidor;

    return null;
}

const HardwareCentral = {
    // 1. COMPROBAR CONEXIÓN AL ESCÁNER (LOCAL O SERVIDOR)
    async verificarConexion(ids) {
        const btn = document.getElementById(ids.btnComprobar);
        const luz = document.getElementById(ids.luz);
        const iconoBg = document.getElementById(ids.iconoBg);
        const texto = document.getElementById(ids.texto);
        const nombreEscaner = document.getElementById(ids.nombreEscaner);

        if (!btn) return;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detectando...';
        btn.disabled = true;

        try {
            const disponible = await detectarEscanerDisponible();
            

            if (!disponible) {
                throw new Error("No hay escáner disponible");
            }

            const resultado = disponible.estado;
            const etiqueta = disponible.modo === 'local' ? 'LOCAL' : 'SERVIDOR';

            if (nombreEscaner) {
                nombreEscaner.innerText = `${resultado.nombre_dispositivo} | ${etiqueta}`;
            }

            if (luz) {
                luz.className = "absolute top-0 right-0 w-16 h-16 bg-emerald-500/20 rounded-bl-full blur-xl transition-colors duration-500";
            }

            if (iconoBg) {
                iconoBg.className = "w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/30 transition-colors duration-500 mb-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
            }

            if (texto) {
                texto.className = "text-sm font-bold text-emerald-400 mt-1";
                texto.innerText = `¡Conectado por ${etiqueta}!`;
            }

            btn.innerHTML = '<i class="fas fa-check"></i> Detectado';
            btn.classList.add('bg-emerald-600/20', 'text-emerald-400', 'border-emerald-500/30');

        } catch (error) {
            if (nombreEscaner) nombreEscaner.innerText = "Ningún dispositivo";
            if (texto) {
                texto.className = "text-sm font-bold text-red-400 mt-1";
                texto.innerText = "Desconectado";
            }
            btn.innerHTML = '<i class="fas fa-times"></i> Reintentar';
        } finally {
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-sync-alt"></i> Comprobar Conexión';
                btn.classList.remove('bg-emerald-600/20', 'text-emerald-400', 'border-emerald-500/30');
                btn.disabled = false;
            }, 3000);
        }
    },

    // 2. ACTIVAR EL ESCÁNER (LOCAL O SERVIDOR)
    async escanear(event, ids) {
        if (event) event.preventDefault();

        const btn = document.getElementById(ids.btnEscanear);
        const lblEstado = document.getElementById(ids.lblEstado);
        const inputTemp = document.getElementById(ids.inputTemp);
        const inputFojas = document.getElementById(ids.inputFojas);
        const cajaEsperando = document.getElementById(ids.cajaEsperando);
        const cajaListo = document.getElementById(ids.cajaListo);
        const nombrePdfListo = document.getElementById(ids.nombrePdfListo);

        if (!btn) return;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Escaneando...';
        btn.disabled = true;

        try {
            const disponible = await detectarEscanerDisponible();

            if (!disponible) {
                throw new Error("No hay escáner disponible");
            }

            console.log("Modo de escaneo usado:", disponible.modo);

            let respuesta;
            let resultado;

            // 1. Intentar LOCAL primero si existe
            if (disponible.modo === 'local') {
                try {
                    respuesta = await fetch(`${URL_LOCAL}/escanear`, {
                        method: 'POST'
                    });
                    resultado = await respuesta.json();

                    // Si local falla, intentar servidor automáticamente
                    if (!resultado.exito) {
                        console.warn("Escáner local falló, intentando servidor...");
                        const respuestaServidor = await fetch(`${URL_SERVIDOR}/api/hardware/escanear`);
                        const resultadoServidor = await respuestaServidor.json();

                        if (!resultadoServidor.exito) {
                            alert('❌ Error del escáner local: ' + resultado.mensaje);
                            return;
                        }

                        resultado = resultadoServidor;
                    }
                } catch (errorLocal) {
                    console.warn("No se pudo usar el escáner local, intentando servidor...", errorLocal);

                    const respuestaServidor = await fetch(`${URL_SERVIDOR}/api/hardware/escanear`);
                    const resultadoServidor = await respuestaServidor.json();

                    if (!resultadoServidor.exito) {
                        alert('❌ Error al escanear local y servidor: ' + resultadoServidor.mensaje);
                        return;
                    }

                    resultado = resultadoServidor;
                }
            } else {
                // 2. Si no hay local, ir directo al servidor
                respuesta = await fetch(`${URL_SERVIDOR}/api/hardware/escanear`);
                resultado = await respuesta.json();

                if (!resultado.exito) {
                    alert('❌ Error del escáner del servidor: ' + resultado.mensaje);
                    return;
                }
            }

            if (inputTemp) inputTemp.value = resultado.archivo_temporal;

            if (resultado.fojas && inputFojas) {
                inputFojas.value = resultado.fojas;
                inputFojas.classList.add('bg-emerald-500/20', 'border-emerald-500', 'text-emerald-400');
                setTimeout(() => {
                    inputFojas.classList.remove('bg-emerald-500/20', 'border-emerald-500', 'text-emerald-400');
                }, 2000);
            }

            if (cajaEsperando) cajaEsperando.classList.add('hidden');
            if (cajaListo) cajaListo.classList.remove('hidden');
            if (nombrePdfListo) {
                const origen = disponible.modo === 'local' ? 'LOCAL' : 'SERVIDOR';
                nombrePdfListo.innerText = `Escaneado_${origen}.pdf`;
            }
            if (lblEstado) lblEstado.classList.remove('hidden');

            btn.classList.add('bg-emerald-600', 'text-white');

        } catch (error) {
            console.error("Error de hardware:", error);
            alert('❌ No se encontró ScannerClient local ni escáner activo del servidor.');
        } finally {
            btn.innerHTML = '<i class="fas fa-satellite-dish"></i> Re-escanear';
            btn.disabled = false;
        }
    },

    // 3. CANCELAR Y ELIMINAR EL DOCUMENTO VISUALMENTE
    cancelar(event, ids, callbackEliminar) {
        if (event) event.stopPropagation();

        if (document.getElementById(ids.inputTemp)) document.getElementById(ids.inputTemp).value = '';
        if (document.getElementById(ids.inputRuta)) document.getElementById(ids.inputRuta).value = '';
        if (document.getElementById(ids.inputFojas)) document.getElementById(ids.inputFojas).value = '';

        if (typeof callbackEliminar === 'function') callbackEliminar();

        const cajaListo = document.getElementById(ids.cajaListo);
        if (cajaListo) {
            cajaListo.classList.add('hidden');
            cajaListo.removeAttribute('data-ruta-actual');
        }

        const cajaEsperando = document.getElementById(ids.cajaEsperando);
        if (cajaEsperando) cajaEsperando.classList.remove('hidden');

        const lblEstado = document.getElementById(ids.lblEstado);
        if (lblEstado) lblEstado.classList.add('hidden');

        const btnEscanear = document.getElementById(ids.btnEscanear);
        if (btnEscanear) btnEscanear.classList.remove('bg-emerald-600', 'text-white');
    },

    // 4. PREVISUALIZAR PDF
    previsualizar(ids) {
        const archivoTemp = document.getElementById(ids.inputTemp) ? document.getElementById(ids.inputTemp).value : null;
        const inputManual = document.getElementById(ids.inputRuta);
        const cajaListo = document.getElementById(ids.cajaListo);
        const rutaActual = cajaListo ? cajaListo.getAttribute('data-ruta-actual') : null;

        if (archivoTemp) cargarDoc('Previsualización Escáner', `temp_scans/${archivoTemp}`);
        else if (inputManual && inputManual.files && inputManual.files[0]) cargarDoc('Previsualización', URL.createObjectURL(inputManual.files[0]));
        else if (rutaActual) cargarDoc('Documento Guardado', rutaActual);
    },

    // 5. IMPORTAR MANUALMENTE DESDE LA PC Y SUBIR AL SERVIDOR CENTRAL
    async importarManual(inputElement, ids) {
        if (!inputElement.files || !inputElement.files[0]) return;

        const archivo = inputElement.files[0];

        if (archivo.type !== "application/pdf") {
            alert("⚠️ Por favor, sube únicamente archivos en formato PDF.");
            inputElement.value = '';
            return;
        }

        const formData = new FormData();
        formData.append('archivo', archivo);

        try {
            const respuesta = await fetch(`${URL_SERVIDOR}/api/hardware/subir-pdf`, {
                method: 'POST',
                body: formData
            });

            const resultado = await respuesta.json();

            if (!resultado.exito) {
                alert("❌ Error al subir archivo: " + resultado.mensaje);
                return;
            }

            const inputTemp = document.getElementById(ids.inputTemp);
            if (inputTemp) {
                inputTemp.value = resultado.archivo_temporal;
            }

            const cajaEsperando = document.getElementById(ids.cajaEsperando);
            const cajaListo = document.getElementById(ids.cajaListo);
            const nombrePdfListo = document.getElementById(ids.nombrePdfListo);

            if (cajaEsperando) cajaEsperando.classList.add('hidden');
            if (cajaListo) cajaListo.classList.remove('hidden');
            if (nombrePdfListo) nombrePdfListo.innerText = archivo.name;

        } catch (error) {
            console.error(error);
            alert("❌ Error al subir PDF al servidor");
        }
    }
};