const C31SipModelo = require('./c31_sip.modelo');
const fs = require('fs');
const path = require('path');

const listarRegistros = async (req, res) => {
    try {
        const registros = await C31SipModelo.obtenerTodosLosRegistros(req.query.gestion);
        res.json(registros);
    } catch (error) { res.status(500).json({ error: 'Error interno' }); }
};

const crearRegistro = async (req, res) => {
    try {
        const datos = req.body;
        const nuevoRegistro = await C31SipModelo.guardarNuevoRegistro(datos);

        if (datos.archivo_temporal) {
            const tempPath = path.join(__dirname, '../../../../../temp_scans', datos.archivo_temporal);
            if (fs.existsSync(tempPath)) {
                // Separado en otra carpeta para no mezclar con CIP
                const carpetaFinal = path.join(__dirname, '../../../../public/archivos', `${datos.gestion}_C31_SIP_PDF`);
                if (!fs.existsSync(carpetaFinal)) fs.mkdirSync(carpetaFinal, { recursive: true });

                const nombreFinal = `C31_SIP_${nuevoRegistro.id}.pdf`;
                fs.renameSync(tempPath, path.join(carpetaFinal, nombreFinal));

                const rutaWeb = `archivos/${datos.gestion}_C31_SIP_PDF/${nombreFinal}`;
                await C31SipModelo.modificarRegistro(nuevoRegistro.id, { ...datos, ruta_archivo: rutaWeb });
                nuevoRegistro.ruta_archivo = rutaWeb;
            }
        }
        res.json({ exito: true, registro: nuevoRegistro });
    } catch (error) { res.status(500).json({ error: 'Error al guardar' }); }
};

const editarRegistro = async (req, res) => {
    try {
        const { id } = req.params;
        const datos = req.body;
        const registroAntiguo = await C31SipModelo.obtenerRegistroPorId(id);
        let rutaFinalWeb = registroAntiguo.ruta_archivo; 

        if (datos.archivo_temporal) {
            const tempPath = path.join(__dirname, '../../../../../temp_scans', datos.archivo_temporal);
            if (fs.existsSync(tempPath)) {
                const carpetaFinal = path.join(__dirname, '../../../../public/archivos', `${datos.gestion}_C31_SIP_PDF`);
                if (!fs.existsSync(carpetaFinal)) fs.mkdirSync(carpetaFinal, { recursive: true });

                const nombreFinal = `C31_SIP_${id}.pdf`;
                const rutaFisicaNueva = path.join(carpetaFinal, nombreFinal);

                if (registroAntiguo.ruta_archivo && registroAntiguo.ruta_archivo !== 'null') {
                    const rutaFisicaVieja = path.join(__dirname, '../../../../public', registroAntiguo.ruta_archivo);
                    if (fs.existsSync(rutaFisicaVieja) && rutaFisicaVieja !== rutaFisicaNueva) fs.unlinkSync(rutaFisicaVieja);
                }
                fs.renameSync(tempPath, rutaFisicaNueva);
                rutaFinalWeb = `archivos/${datos.gestion}_C31_SIP_PDF/${nombreFinal}`;
            }
        } else if (datos.eliminar_pdf) {
            if (registroAntiguo.ruta_archivo && registroAntiguo.ruta_archivo !== 'null') {
                const rutaFisicaVieja = path.join(__dirname, '../../../../public', registroAntiguo.ruta_archivo);
                if (fs.existsSync(rutaFisicaVieja)) fs.unlinkSync(rutaFisicaVieja);
            }
            rutaFinalWeb = null; 
        }

        datos.ruta_archivo = rutaFinalWeb;
        const registroActualizado = await C31SipModelo.modificarRegistro(id, datos);
        res.json({ exito: true, registro: registroActualizado });
    } catch (error) { res.status(500).json({ error: 'Error al editar' }); }
};

const borrarRegistro = async (req, res) => {
    try {
        const registroEliminado = await C31SipModelo.eliminarRegistro(req.params.id);
        if (registroEliminado) {
            if (registroEliminado.ruta_archivo && registroEliminado.ruta_archivo !== 'null') {
                const rutaFisica = path.join(__dirname, '../../../../public', registroEliminado.ruta_archivo);
                if (fs.existsSync(rutaFisica)) fs.unlinkSync(rutaFisica); 
            }
            res.json({ exito: true, mensaje: 'Eliminado' });
        } else { res.status(404).json({ exito: false, mensaje: 'No encontrado' }); }
    } catch (error) { res.status(500).json({ error: 'Error al eliminar' }); }
};

module.exports = { listarRegistros, crearRegistro, editarRegistro, borrarRegistro };