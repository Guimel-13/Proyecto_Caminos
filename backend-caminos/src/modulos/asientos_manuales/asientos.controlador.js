// Este archivo se encarga de recibir las solicitudes del Frontend, procesarlas y usar el Modelo para interactuar con la base de datos

const AsientosModelo = require('./asientos.modelo');
const fs = require('fs');
const path = require('path');


// =========================================================================
// FUNCIONES PARA CONTROLAR LAS RUTAS DE ASIENTOS MANUALES
// =========================================================================

// 1. FUNCION PARA LISTAR TODOS LOS REGISTROS DE ASIENTOS
const listarRegistros = async (req, res) => {
    try {
        const { gestion } = req.query;
        const registros = await AsientosModelo.obtenerTodosLosRegistros(gestion);
        res.json(registros);
    } catch (error) {
        console.error("Error al obtener Asientos Manuales:", error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


// 2. FUNCION PARA CREAR UN NUEVO REGISTRO DE ASIENTOS (CON LÓGICA DE ESCÁNER)
const crearRegistro = async (req, res) => {
    try {
        const datos = req.body;

        // 1. Guardamos primero en PostgreSQL para obtener el ID oficial
        const nuevoRegistro = await AsientosModelo.guardarNuevoRegistro(datos);

        // 2. Si existe archivo temporal, movemos el PDF a su carpeta final
        if (datos.archivo_temporal) {
            const tempPath = path.join(__dirname, '../../../../temp_scans', datos.archivo_temporal);
            console.log("🕵️ Buscando PDF temporal en:", tempPath);

            if (fs.existsSync(tempPath)) {
                console.log("✅ PDF encontrado. Preparando movimiento...");

                const carpetaFinal = path.join(__dirname, '../../../public/archivos', `${datos.gestion}_ASIENTOS_PDF`);

                if (!fs.existsSync(carpetaFinal)) {
                    fs.mkdirSync(carpetaFinal, { recursive: true });
                    console.log(`📁 Carpeta creada: ${datos.gestion}_ASIENTOS_PDF`);
                }

                const nombreFinal = `ASIENTO_${nuevoRegistro.id}.pdf`;
                const rutaFinal = path.join(carpetaFinal, nombreFinal);

                fs.renameSync(tempPath, rutaFinal);
                console.log(`🚀 Archivo guardado como: ${nombreFinal}`);

                const rutaWeb = `archivos/${datos.gestion}_ASIENTOS_PDF/${nombreFinal}`;

                const registroActualizado = await AsientosModelo.modificarRegistro(nuevoRegistro.id, {
                    ...datos,
                    ruta_archivo: rutaWeb
                });

                nuevoRegistro.ruta_archivo = registroActualizado.ruta_archivo;
                console.log(`💾 Base de datos actualizada con ruta: ${rutaWeb}`);
            } else {
                console.warn("⚠️ No se encontró el archivo temporal:", tempPath);
            }
        }

        res.json({ exito: true, registro: nuevoRegistro });

    } catch (error) {
        console.error("Error al guardar Asiento Manual:", error.message);
        res.status(500).json({ error: 'Error interno al guardar' });
    }
};


// 3. FUNCION PARA EDITAR UN REGISTRO EXISTENTE DE ASIENTOS
const editarRegistro = async (req, res) => {
    try {
        const { id } = req.params;
        const datos = req.body;

        const registroAntiguo = await AsientosModelo.obtenerRegistroPorId(id);
        if (!registroAntiguo) {
            return res.status(404).json({ exito: false, mensaje: 'Registro no encontrado' });
        }

        let rutaFinalWeb = registroAntiguo.ruta_archivo;

        // Si llegó un nuevo archivo temporal
        if (datos.archivo_temporal) {
            const tempPath = path.join(__dirname, '../../../../temp_scans', datos.archivo_temporal);

            if (fs.existsSync(tempPath)) {
                const carpetaFinal = path.join(__dirname, '../../../public/archivos', `${datos.gestion}_ASIENTOS_PDF}`);
            }
        }

        // Corregimos bien la carpeta final
        if (datos.archivo_temporal) {
            const tempPath = path.join(__dirname, '../../../../temp_scans', datos.archivo_temporal);

            if (fs.existsSync(tempPath)) {
                const carpetaFinal = path.join(__dirname, '../../../public/archivos', `${datos.gestion}_ASIENTOS_PDF`);
                if (!fs.existsSync(carpetaFinal)) fs.mkdirSync(carpetaFinal, { recursive: true });

                const nombreFinal = `ASIENTO_${id}.pdf`;
                const rutaFisicaNueva = path.join(carpetaFinal, nombreFinal);

                if (registroAntiguo.ruta_archivo && registroAntiguo.ruta_archivo !== 'null') {
                    const rutaFisicaVieja = path.join(__dirname, '../../../public', registroAntiguo.ruta_archivo);
                    if (fs.existsSync(rutaFisicaVieja) && rutaFisicaVieja !== rutaFisicaNueva) {
                        fs.unlinkSync(rutaFisicaVieja);
                    }
                }

                fs.renameSync(tempPath, rutaFisicaNueva);
                rutaFinalWeb = `archivos/${datos.gestion}_ASIENTOS_PDF/${nombreFinal}`;
            }
        }
        // Si el usuario quitó el PDF sin subir otro nuevo
        else if (datos.eliminar_pdf) {
            if (registroAntiguo.ruta_archivo && registroAntiguo.ruta_archivo !== 'null') {
                const rutaFisicaVieja = path.join(__dirname, '../../../public', registroAntiguo.ruta_archivo);
                if (fs.existsSync(rutaFisicaVieja)) fs.unlinkSync(rutaFisicaVieja);
            }
            rutaFinalWeb = null;
        }

        datos.ruta_archivo = rutaFinalWeb;
        const registroActualizado = await AsientosModelo.modificarRegistro(id, datos);

        res.json({ exito: true, registro: registroActualizado });

    } catch (error) {
        console.error("Error al editar Asiento Manual:", error.message);
        res.status(500).json({ error: 'Error interno al editar' });
    }
};


// 4. FUNCION PARA BORRAR UN REGISTRO DE ASIENTOS Y SU PDF FÍSICO
const borrarRegistro = async (req, res) => {
    try {
        const { id } = req.params;
        const registroEliminado = await AsientosModelo.eliminarRegistro(id);

        if (registroEliminado) {
            if (registroEliminado.ruta_archivo && registroEliminado.ruta_archivo !== 'null') {
                const rutaFisica = path.join(__dirname, '../../../public', registroEliminado.ruta_archivo);

                if (fs.existsSync(rutaFisica)) {
                    fs.unlinkSync(rutaFisica);
                    console.log(`🗑️ Archivo físico eliminado: ${rutaFisica}`);
                } else {
                    console.warn(`⚠️ El registro se borró de la BD, pero el PDF físico no estaba en: ${rutaFisica}`);
                }
            }

            res.json({ exito: true, mensaje: 'Registro y PDF eliminados correctamente' });
        } else {
            res.status(404).json({ exito: false, mensaje: 'Registro no encontrado' });
        }
    } catch (error) {
        console.error("Error al eliminar Asiento Manual:", error.message);
        res.status(500).json({ error: 'Error interno al eliminar' });
    }
};

module.exports = { listarRegistros, crearRegistro, editarRegistro, borrarRegistro };