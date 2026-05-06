const empastadoModelo = require('./empastado_modelo');

function limpiarTexto(valor) {
    if (valor === undefined || valor === null) return '';
    return String(valor).trim();
}

function normalizarDatos(body) {
    return {
        titulo: limpiarTexto(body.titulo),
        numero_empastado: limpiarTexto(body.numero_empastado),
        gestion: Number(body.gestion),
        preventivo: limpiarTexto(body.preventivo),
        ubicacion_fisica: limpiarTexto(body.ubicacion_fisica)
    };
}

function validarDatos(datos) {
    if (!datos.titulo) return 'El campo título es obligatorio.';
    if (!datos.numero_empastado) return 'El número de empastado es obligatorio.';
    if (!Number.isInteger(datos.gestion) || datos.gestion <= 0) return 'La gestión debe ser un número válido.';
    if (!datos.ubicacion_fisica) return 'La ubicación física es obligatoria.';
    return null;
}

async function guardarEmpastado(req, res) {
    try {
        const { tipo } = req.params;
        const datos = normalizarDatos(req.body);

        const errorValidacion = validarDatos(datos);
        if (errorValidacion) {
            return res.status(400).json({
                ok: false,
                mensaje: errorValidacion
            });
        }

        const nuevo = await empastadoModelo.crearEmpastado(tipo, datos);

        return res.status(201).json({
            ok: true,
            mensaje: 'Empastado guardado correctamente.',
            data: nuevo
        });
    } catch (error) {
        console.error('Error al guardar empastado:', error);

        if (error.code === '23505') {
            return res.status(409).json({
                ok: false,
                mensaje: 'Ya existe un registro con ese número de empastado.'
            });
        }

        return res.status(500).json({
            ok: false,
            mensaje: error.message || 'Error interno del servidor al guardar.'
        });
    }
}

async function listarEmpastados(req, res) {
    try {
        const { tipo } = req.params;
        const lista = await empastadoModelo.listarEmpastados(tipo);

        return res.status(200).json({
            ok: true,
            data: lista
        });
    } catch (error) {
        console.error('Error al listar empastados:', error);

        return res.status(500).json({
            ok: false,
            mensaje: error.message || 'Error interno del servidor al listar.'
        });
    }
}

async function obtenerEmpastado(req, res) {
    try {
        const { tipo, id } = req.params;
        const registro = await empastadoModelo.obtenerEmpastadoPorId(tipo, id);

        if (!registro) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Registro no encontrado.'
            });
        }

        return res.status(200).json({
            ok: true,
            data: registro
        });
    } catch (error) {
        console.error('Error al obtener empastado:', error);

        return res.status(500).json({
            ok: false,
            mensaje: error.message || 'Error interno del servidor al obtener.'
        });
    }
}

async function actualizarEmpastado(req, res) {
    try {
        const { tipo, id } = req.params;
        const datos = normalizarDatos(req.body);

        const errorValidacion = validarDatos(datos);
        if (errorValidacion) {
            return res.status(400).json({
                ok: false,
                mensaje: errorValidacion
            });
        }

        const actualizado = await empastadoModelo.actualizarEmpastado(tipo, id, datos);

        if (!actualizado) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Registro no encontrado para actualizar.'
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Empastado actualizado correctamente.',
            data: actualizado
        });
    } catch (error) {
        console.error('Error al actualizar empastado:', error);

        if (error.code === '23505') {
            return res.status(409).json({
                ok: false,
                mensaje: 'Ya existe un registro con ese número de empastado.'
            });
        }

        return res.status(500).json({
            ok: false,
            mensaje: error.message || 'Error interno del servidor al actualizar.'
        });
    }
}

async function eliminarEmpastado(req, res) {
    try {
        const { tipo, id } = req.params;
        const eliminado = await empastadoModelo.eliminarEmpastado(tipo, id);

        if (!eliminado) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Registro no encontrado para eliminar.'
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Empastado eliminado correctamente.',
            data: eliminado
        });
    } catch (error) {
        console.error('Error al eliminar empastado:', error);

        return res.status(500).json({
            ok: false,
            mensaje: error.message || 'Error interno del servidor al eliminar.'
        });
    }
}

module.exports = {
    guardarEmpastado,
    listarEmpastados,
    obtenerEmpastado,
    actualizarEmpastado,
    eliminarEmpastado
};