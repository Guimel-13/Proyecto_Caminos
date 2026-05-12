const express = require('express');
const cors = require('cors');
const readline = require('readline');
const path = require('path'); // <-- 1. IMPORTAMOS PATH AQUÍ
const rutasPrincipales = require('./src/rutas/index');
const fileUpload = require('express-fileupload');
const app = express();

app.use(fileUpload());
app.use(cors());
app.use(express.json());

// ====================================================================
// Función para limpiar la consola y mostrar un mensaje de bienvenida
// ====================================================================
app.use(express.static(path.join(__dirname, './public'))); 
app.use(express.static(path.join(__dirname, '../Sistema de Caminos'))); // Esta línea sirve para servir los archivos estáticos (HTML, CSS, JS) desde la carpeta "Sistema de Caminos". Asegúrate de que tus archivos HTML estén en esa carpeta.
app.use('/temp_scans', express.static(path.join(__dirname, '../temp_scans')));

// Rutas principales
app.use('/api', rutasPrincipales);

app.get('/', (req, res) => {
    res.redirect('/login.html');
});

const PORT = 3000;

// Está parte es solo para mostrar una barra de carga antes de iniciar el servidor, para hacerlo más visual y divertido
let progreso = 0;
const total = 40;

const intervalo = setInterval(() => {
    progreso++;

    const porcentaje = ((progreso / total) * 100).toFixed(2);
    const barra = "#".repeat(progreso) + " ".repeat(total - progreso);

    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`[${barra}] ${porcentaje}%`);

    if (progreso === total) {
        clearInterval(intervalo);

        // 🚀 Aquí recién arranca el servidor
        app.listen(PORT, () => {
            readline.cursorTo(process.stdout, 0);
            process.stdout.write(
                `[${"#".repeat(total)}] 100.00% - Servidor listo\n`
            );
            console.log(`En --->[ http://192.168.1.17:${PORT} ]`);
        });
    }
}, 50);