const pool = require('../../configuracion_bd/base_datos');

const TABLAS_EMPASTADOS = {
    c31_cip: {
        tabla: 'empastados_c31_cip',
        columnaId: 'id_c31_cip',
        usaPreventivo: true
    },
    c31_sip: {
        tabla: 'empastados_c31_sip',
        columnaId: 'id_c31_sip',
        usaPreventivo: true
    },
    c21_cip: {
        tabla: 'empastados_c21_cip',
        columnaId: 'id_c21_cip',
        usaPreventivo: true
    },
    c21_sip: {
        tabla: 'empastados_c21_sip',
        columnaId: 'id_c21_sip',
        usaPreventivo: true
    },
    asientos_manuales: {
        tabla: 'empastados_asientos_manuales',
        columnaId: 'id_asiento_manual',
        usaPreventivo: true
    },
    formulario_bancarizacion: {
        tabla: 'empastados_bancarizacion',
        columnaId: 'id_bancarizacion',
        usaPreventivo: false
    }
};

function obtenerConfiguracionTabla(tipo) {
    const config = TABLAS_EMPASTADOS[tipo];
    if (!config) {
        throw new Error(`Tipo de empastado no válido: ${tipo}`);
    }
    return config;
}

async function crearEmpastado(tipo, datos) {
    const { tabla, usaPreventivo } = obtenerConfiguracionTabla(tipo);

    let consulta = '';
    let valores = [];

    if (usaPreventivo) {
        consulta = `
            INSERT INTO ${tabla} (
                titulo,
                numero_empastado,
                gestion,
                preventivo,
                ubicacion_fisica
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        valores = [
            datos.titulo,
            datos.numero_empastado,
            datos.gestion,
            datos.preventivo || null,
            datos.ubicacion_fisica
        ];
    } else {
        consulta = `
            INSERT INTO ${tabla} (
                titulo,
                numero_empastado,
                gestion,
                ubicacion_fisica
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        valores = [
            datos.titulo,
            datos.numero_empastado,
            datos.gestion,
            datos.ubicacion_fisica
        ];
    }

    const resultado = await pool.query(consulta, valores);
    return resultado.rows[0];
}

async function listarEmpastados(tipo) {
    const { tabla, columnaId } = obtenerConfiguracionTabla(tipo);

    const resultado = await pool.query(`
        SELECT *
        FROM ${tabla}
        ORDER BY gestion ASC, fecha_creacion ASC, ${columnaId} ASC
    `);

    return resultado.rows;
}

async function obtenerEmpastadoPorId(tipo, id) {
    const { tabla, columnaId } = obtenerConfiguracionTabla(tipo);

    const resultado = await pool.query(`
        SELECT *
        FROM ${tabla}
        WHERE ${columnaId} = $1
        LIMIT 1
    `, [id]);

    return resultado.rows[0];
}

async function actualizarEmpastado(tipo, id, datos) {
    const { tabla, columnaId, usaPreventivo } = obtenerConfiguracionTabla(tipo);

    let consulta = '';
    let valores = [];

    if (usaPreventivo) {
        consulta = `
            UPDATE ${tabla}
            SET titulo = $1,
                numero_empastado = $2,
                gestion = $3,
                preventivo = $4,
                ubicacion_fisica = $5
            WHERE ${columnaId} = $6
            RETURNING *;
        `;
        valores = [
            datos.titulo,
            datos.numero_empastado,
            datos.gestion,
            datos.preventivo || null,
            datos.ubicacion_fisica,
            id
        ];
    } else {
        consulta = `
            UPDATE ${tabla}
            SET titulo = $1,
                numero_empastado = $2,
                gestion = $3,
                ubicacion_fisica = $4
            WHERE ${columnaId} = $5
            RETURNING *;
        `;
        valores = [
            datos.titulo,
            datos.numero_empastado,
            datos.gestion,
            datos.ubicacion_fisica,
            id
        ];
    }

    const resultado = await pool.query(consulta, valores);
    return resultado.rows[0];
}

async function eliminarEmpastado(tipo, id) {
    const { tabla, columnaId } = obtenerConfiguracionTabla(tipo);

    const resultado = await pool.query(`
        DELETE FROM ${tabla}
        WHERE ${columnaId} = $1
        RETURNING *
    `, [id]);

    return resultado.rows[0];
}

module.exports = {
    crearEmpastado,
    listarEmpastados,
    obtenerEmpastadoPorId,
    actualizarEmpastado,
    eliminarEmpastado
};