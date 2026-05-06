const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { PDFDocument } = require('pdf-lib');

// ========================================================================
// 1. RUTA REAL: Detectar el escáner conectado al servidor
// ========================================================================
router.get('/estado', (req, res) => {
    const comandoWindows = 'wmic path Win32_PnPEntity where "Caption like \'%EPSON%\'" get Caption';

    exec(comandoWindows, (error, stdout) => {
        if (error || !stdout.includes('EPSON')) {
            return res.json({
                exito: false,
                conectado: false,
                mensaje: 'Escáner apagado o cable desconectado.'
            });
        }

        const lineas = stdout.split('\n').filter(linea => linea.includes('EPSON'));
        const nombreReal = lineas.length > 0 ? lineas[0].trim() : "EPSON DS-730N";

        res.json({
            exito: true,
            conectado: true,
            nombre_dispositivo: nombreReal,
            mensaje: '¡Conectado y Listo para escanear!'
        });
    });
});

// ========================================================================
// 2. RUTA REAL: Escanear desde el servidor y contar fojas
// ========================================================================
router.get('/escanear', (req, res) => {
    try {
        const rutaPerfiles = path.join(process.env.APPDATA, 'NAPS2', 'profiles.xml');

        let nombrePerfil = "guimel";

        if (fs.existsSync(rutaPerfiles)) {
            const contenidoXml = fs.readFileSync(rutaPerfiles, 'utf8');
            const coincidencia = contenidoXml.match(/<DisplayName>(.*?)<\/DisplayName>/);

            if (coincidencia && coincidencia[1]) {
                nombrePerfil = coincidencia[1];
                console.log(`[Hardware] Perfil detectado automáticamente: "${nombrePerfil}"`);
            }
        } else {
            console.warn("[Hardware] No se encontró profiles.xml, usando perfil de respaldo: " + nombrePerfil);
        }

        const tempDir = path.join(__dirname, '../../../../temp_scans');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const nombreTemp = `scan_${Date.now()}.pdf`;
        const rutaCompleta = path.join(tempDir, nombreTemp);

        const comandoEscaner = `"C:\\Program Files\\NAPS2\\naps2.console.exe" -p "${nombrePerfil}" -o "${rutaCompleta}" --force`;

        exec(comandoEscaner, async (error, stdout, stderr) => {
            if (error) {
                console.error("❌ Fallo al ejecutar NAPS2:");
                console.error("Mensaje STDOUT:", stdout);
                console.error("Mensaje STDERR:", stderr);

                return res.status(500).json({
                    exito: false,
                    mensaje: 'NAPS2 chocó. Mira la consola negra de Node para ver el error exacto.'
                });
            }

            let cantidadFojas = "";
            try {
                if (fs.existsSync(rutaCompleta)) {
                    const pdfBytes = fs.readFileSync(rutaCompleta);
                    const pdfDoc = await PDFDocument.load(pdfBytes);
                    cantidadFojas = pdfDoc.getPageCount();
                    console.log(`📄 ¡PDF escaneado con éxito! Total de fojas detectadas: ${cantidadFojas}`);
                }
            } catch (errPdf) {
                console.error("No se pudo leer la cantidad de fojas:", errPdf);
            }

            res.json({
                exito: true,
                archivo_temporal: nombreTemp,
                fojas: cantidadFojas
            });
        });

    } catch (error) {
        console.error("Error general:", error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error en el servidor de hardware'
        });
    }
});

// ========================================================================
// 3. SUBIR PDF DESDE SCANNER-CLIENT O IMPORTACIÓN MANUAL
// ========================================================================
router.post('/subir-pdf', (req, res) => {
    try {
        const archivo = req.files?.archivo;

        if (!archivo) {
            return res.status(400).json({
                exito: false,
                mensaje: 'No se recibió ningún archivo'
            });
        }

        if (archivo.mimetype !== 'application/pdf') {
            return res.status(400).json({
                exito: false,
                mensaje: 'Solo se permiten archivos PDF'
            });
        }

        const tempDir = path.join(__dirname, '../../../../temp_scans');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const nombreTemp = `scan_${Date.now()}.pdf`;
        const rutaDestino = path.join(tempDir, nombreTemp);

        archivo.mv(rutaDestino, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    exito: false,
                    mensaje: 'Error al guardar el PDF en el servidor'
                });
            }

            return res.json({
                exito: true,
                archivo_temporal: nombreTemp,
                mensaje: 'PDF recibido correctamente'
            });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error en servidor al subir PDF'
        });
    }
});

module.exports = router;