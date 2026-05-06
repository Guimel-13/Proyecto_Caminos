// Este archivo se encarga de recibir las solicitudes del Frontend, procesarlas y usar el Modelo para interactuar con la base de datos

const C31Modelo = require('./c31_cip.modelo');
const fs = require('fs');
const path = require('path');


// =========================================================================
// FUNCIONES PARA CONTROLAR LAS RUTAS DE C31 CIP
// =========================================================================

// 1. FUNCION PARA LISTAR TODOS LOS REGISTROS DE C31 CIP
const listarRegistros = async (req, res) => {
    try {
        // Sacamos la variable "gestion" de la URL (ej: /api/c31-cip?gestion=2026)
        const { gestion } = req.query; 
        
        // Se lo pasamos a nuestro modelo
        const registros = await C31Modelo.obtenerTodosLosRegistros(gestion);
        res.json(registros);
    } catch (error) {
        console.error("Error al obtener C31 CIP:", error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


// 2. FUNCION PARA CREAR UN NUEVO REGISTRO DE C31 CIP (CON LÓGICA DE ESCÁNER)
const crearRegistro = async (req, res) => {
    try {
        const datos = req.body;
        
        // 1. Guardamos los datos en PostgreSQL primero para que nos devuelva el "ID" oficial
        const nuevoRegistro = await C31Modelo.guardarNuevoRegistro(datos);

        // 2. Verificamos: ¿El usuario presionó el botón "Escanear" y generó un archivo temporal?
        if (datos.archivo_temporal) {
            
            // 📍 AJUSTE DE GPS 1: Retrocedemos 5 carpetas
            const tempPath = path.join(__dirname, '../../../../../temp_scans', datos.archivo_temporal);
            console.log("🕵️ Buscando PDF temporal en:", tempPath);
            
            // Verificamos que el archivo físico realmente exista en esa ruta
            if (fs.existsSync(tempPath)) {
                console.log("✅ ¡PDF encontrado! Preparando la mudanza...");
                
                // 📍 AJUSTE DE GPS 2: Entramos a public/archivos
                const carpetaFinal = path.join(__dirname, '../../../../public/archivos', `${datos.gestion}_C31_CIP_PDF`);
                
                if (!fs.existsSync(carpetaFinal)) {
                    fs.mkdirSync(carpetaFinal, { recursive: true });
                    console.log(`📁 Carpeta nueva creada: ${datos.gestion}_C31_CIP_PDF`);
                }

                // Armamos el nombre final del archivo
                const nombreFinal = `C31_CIP_${nuevoRegistro.id}.pdf`;
                const rutaFinal = path.join(carpetaFinal, nombreFinal);

                // Movemos el archivo a su carpeta final
                fs.renameSync(tempPath, rutaFinal);
                console.log(`🚀 Archivo guardado exitosamente como: ${nombreFinal}`);

                // =====================================================================
                // 🚨 LA MAGIA PARA LA BASE DE DATOS:
                // =====================================================================
                // 1. Armamos la ruta bonita que el navegador web puede entender
                const rutaWeb = `archivos/${datos.gestion}_C31_CIP_PDF/${nombreFinal}`;
                
                // 2. Descomentamos la función y enviamos los datos actualizados a PostgreSQL
                const registroActualizado = await C31Modelo.modificarRegistro(nuevoRegistro.id, { 
                    ...datos, 
                    ruta_archivo: rutaWeb 
                });
                
                // 3. Le asignamos esta nueva ruta a la respuesta que va al Frontend
                nuevoRegistro.ruta_archivo = registroActualizado.ruta_archivo;
                console.log(`💾 Base de datos actualizada con la ruta: ${rutaWeb}`);
                // =====================================================================

            } else {
                console.warn("⚠️ ALERTA: No se encontró el archivo temporal. Node.js lo buscó pero no estaba.");
            }
        }

        // Le respondemos al Frontend que todo fue un éxito
        res.json({ exito: true, registro: nuevoRegistro });
        
    } catch (error) {
        console.error("Error al guardar C31:", error.message);
        res.status(500).json({ error: 'Error interno al guardar' });
    }
};


// 3. FUNCION PARA EDITAR UN REGISTRO EXISTENTE DE C31 CIP
const editarRegistro = async (req, res) => {
    try {
        const { id } = req.params;
        const datos = req.body;
        
        // 1. Conseguir el registro viejo para saber dónde estaba el PDF anterior
        const registroAntiguo = await C31Modelo.obtenerRegistroPorId(id);
        if (!registroAntiguo) {
            return res.status(404).json({ exito: false, mensaje: 'Registro no encontrado' });
        }

        let rutaFinalWeb = registroAntiguo.ruta_archivo; 

        // 2. Si el usuario subió/escaneó un PDF nuevo
        if (datos.archivo_temporal) {
            const tempPath = path.join(__dirname, '../../../../../temp_scans', datos.archivo_temporal);
            
            if (fs.existsSync(tempPath)) {
                const carpetaFinal = path.join(__dirname, '../../../../public/archivos', `${datos.gestion}_C31_CIP_PDF`);
                if (!fs.existsSync(carpetaFinal)) fs.mkdirSync(carpetaFinal, { recursive: true });

                // 🪄 VOLVEMOS AL NOMBRE LIMPIO Y PERFECTO
                const nombreFinal = `C31_CIP_${id}.pdf`;
                const rutaFisicaNueva = path.join(carpetaFinal, nombreFinal);

                // Borramos el archivo físico viejo ANTES de mover el nuevo 
                // (OJO: Solo lo borramos si el nombre era diferente, ej: si era el archivo largo anterior)
                if (registroAntiguo.ruta_archivo && registroAntiguo.ruta_archivo !== 'null') {
                    const rutaFisicaVieja = path.join(__dirname, '../../../../public', registroAntiguo.ruta_archivo);
                    if (fs.existsSync(rutaFisicaVieja) && rutaFisicaVieja !== rutaFisicaNueva) {
                        fs.unlinkSync(rutaFisicaVieja);
                    }
                }

                // Movemos el archivo nuevo (Sobrescribe automáticamente si ya existía uno con nombre limpio)
                fs.renameSync(tempPath, rutaFisicaNueva);
                rutaFinalWeb = `archivos/${datos.gestion}_C31_CIP_PDF/${nombreFinal}`;
            }
        } 
        // 3. Si el usuario le dio a la "X" roja para borrar el PDF sin subir uno nuevo
        else if (datos.eliminar_pdf) {
            if (registroAntiguo.ruta_archivo && registroAntiguo.ruta_archivo !== 'null') {
                const rutaFisicaVieja = path.join(__dirname, '../../../../public', registroAntiguo.ruta_archivo);
                if (fs.existsSync(rutaFisicaVieja)) fs.unlinkSync(rutaFisicaVieja);
            }
            rutaFinalWeb = null; 
        }

        // 4. Actualizamos la base de datos
        datos.ruta_archivo = rutaFinalWeb;
        const registroActualizado = await C31Modelo.modificarRegistro(id, datos);
        
        res.json({ exito: true, registro: registroActualizado });
        
    } catch (error) {
        console.error("Error al editar C31:", error.message);
        res.status(500).json({ error: 'Error interno al editar' });
    }
};

// 4. FUNCION PARA BORRAR UN REGISTRO DE C31 CIP Y SU PDF FÍSICO
const borrarRegistro = async (req, res) => {
    try {
        const { id } = req.params; // Sacamos el número de ID de la URL
        
        // 1. Primero, le pedimos al Modelo que borre el registro de la base de datos de PostgreSQL.
        // Como en tu Modelo usaste "RETURNING *", esta variable atrapará los datos del registro justo antes de morir.
        const registroEliminado = await C31Modelo.eliminarRegistro(id);
        
        if (registroEliminado) {
            
            // 2. Verificamos si este difunto registro tenía guardada una ruta de archivo PDF.
            if (registroEliminado.ruta_archivo && registroEliminado.ruta_archivo !== 'null') {
                
                // 3. Armamos la ruta física completa (GPS) de dónde debería estar ese PDF en tu disco duro.
                // Retrocedemos 4 carpetas (../../../../) para llegar a la raíz de backend-caminos, 
                // entramos a "public" y le pegamos la ruta bonita de la base de datos.
                const rutaFisica = path.join(__dirname, '../../../../public', registroEliminado.ruta_archivo);
                
                // 4. Usamos el radar para verificar si el archivo realmente está en el disco duro.
                if (fs.existsSync(rutaFisica)) {
                    
                    // 5. 💥 LA BOMBA: Eliminamos el archivo físico permanentemente.
                    fs.unlinkSync(rutaFisica); 
                    console.log(`🗑️ Archivo físico destruido con éxito: ${rutaFisica}`);
                    
                } else {
                    console.warn(`⚠️ El registro se borró de la BD, pero el PDF físico ya no estaba en: ${rutaFisica}`);
                }
            }

            // 6. Le confirmamos a tu página web que todo salió a la perfección.
            res.json({ exito: true, mensaje: 'Registro y PDF eliminados correctamente' });
            
        } else {
            res.status(404).json({ exito: false, mensaje: 'Registro no encontrado' });
        }
    } catch (error) {
        console.error("Error al eliminar C31:", error.message);
        res.status(500).json({ error: 'Error interno al eliminar' });
    }
};

// Este módulo exporta las funciones para que las rutas puedan usarlas
module.exports = { listarRegistros, crearRegistro, editarRegistro, borrarRegistro };