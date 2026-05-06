const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const fetch = require('node-fetch');
const FormData = require('form-data');

const app = express();
app.use(cors());
app.use(express.json());

// =========================================================
// CARGAR CONFIGURACIÓN FIJA
// =========================================================
const configPath = path.join(__dirname, 'config.json');

if (!fs.existsSync(configPath)) {
    console.error('❌ No se encontró config.json en scanner-client');
    process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const PUERTO_LOCAL = config.puerto_local || 4010;
const SERVIDOR_CENTRAL = config.servidor_central;
const NAPS2_PATH = config.naps2_path;
const PERFIL_NAPS2 = config.perfil_naps2; // <- Usamos directamente el perfil del archivo
const TEMP_DIR = path.join(__dirname, config.temp_dir || 'temp_scans_local');
const SCANNER_KEYWORDS = Array.isArray(config.scanner_keywords) ? config.scanner_keywords : ['EPSON'];

// =========================================================
// 1. Verificar escáner local
// =========================================================
app.get('/estado', (req, res) => {
    const comandoWindows = `wmic path Win32_PnPEntity get Caption`;

    exec(comandoWindows, (error, stdout) => {
        if (error || !stdout) {
            return res.json({ exito: false, conectado: false, mensaje: 'No se pudo verificar el escáner local' });
        }

        const texto = stdout.toUpperCase();
        // Verificamos si alguna palabra clave está en la lista de dispositivos de Windows
        const conectado = SCANNER_KEYWORDS.some(k => texto.includes(String(k).toUpperCase()));

        if (!conectado) {
            return res.json({ exito: false, conectado: false, mensaje: 'Escáner local no detectado por USB' });
        }

        return res.json({
            exito: true,
            conectado: true,
            nombre_dispositivo: "Escáner Local (USB)",
            perfil_naps2: PERFIL_NAPS2,
            mensaje: 'Escáner local listo'
        });
    });
});

// =========================================================
// 2. Escanear localmente y subir al servidor central
// =========================================================
app.post('/escanear', async (req, res) => {
    try {
        if (!fs.existsSync(NAPS2_PATH)) {
            return res.status(500).json({ exito: false, mensaje: `No se encontró NAPS2 en: ${NAPS2_PATH}` });
        }

        if (!PERFIL_NAPS2) {
            return res.status(500).json({ exito: false, mensaje: 'Falta definir "perfil_naps2" en config.json' });
        }

        if (!fs.existsSync(TEMP_DIR)) {
            fs.mkdirSync(TEMP_DIR, { recursive: true });
        }

        const nombreTemp = `scan_${Date.now()}.pdf`;
        const rutaCompleta = path.join(TEMP_DIR, nombreTemp);

        // Disparamos con el perfil exacto definido en config.json
        const comandoEscaner = `"${NAPS2_PATH}" -p "${PERFIL_NAPS2}" -o "${rutaCompleta}" -f`;

        exec(comandoEscaner, async (error, stdout, stderr) => {
            console.log("Salida de NAPS2:", stdout || stderr);

            if (error) {
                return res.status(500).json({
                    exito: false,
                    mensaje: `Error NAPS2: ${stderr || stdout || error.message}`
                });
            }

            if (!fs.existsSync(rutaCompleta)) {
                return res.status(500).json({ exito: false, mensaje: 'El PDF local no fue generado' });
            }

            // Subir al servidor central
            try {
                const form = new FormData();
                form.append('archivo', fs.createReadStream(rutaCompleta));

                const subida = await fetch(`${SERVIDOR_CENTRAL}/api/hardware/subir-pdf`, {
                    method: 'POST',
                    body: form,
                    headers: form.getHeaders()
                });

                const resultado = await subida.json();

                if (!resultado.exito) {
                    return res.status(500).json({ exito: false, mensaje: `Rechazado por el servidor: ${resultado.mensaje}` });
                }

                // Borramos el PDF de la laptop para no llenar su disco
                fs.unlinkSync(rutaCompleta);

                return res.json({
                    exito: true,
                    archivo_temporal: resultado.archivo_temporal,
                    mensaje: 'Escaneo local exitoso y subido a la PC Delux'
                });

            } catch (subidaError) {
                console.error('❌ Error de red:', subidaError);
                return res.status(500).json({ exito: false, mensaje: `Fallo de red hacia el servidor: ${subidaError.message}` });
            }
        });

    } catch (error) {
        res.status(500).json({ exito: false, mensaje: `Error interno: ${error.message}` });
    }
});



app.listen(PUERTO_LOCAL, () => {
    console.log(`✅ Cliente escáner local activo en http://localhost:${PUERTO_LOCAL}`);
    console.log(`✅ Usando perfil fijo de NAPS2: [${PERFIL_NAPS2}]`);
});