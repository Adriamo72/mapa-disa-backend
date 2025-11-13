"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actualizarPersonal = exports.asignarPersonal = exports.obtenerPersonal = void 0;
const database_1 = require("../config/database");
const obtenerPersonal = async (req, res) => {
    try {
        const { institucion_id } = req.query;
        let sql = `
      SELECT 
        p.*,
        tp.nombre as tipo_personal_nombre,
        tp.color as tipo_personal_color,
        e.nombre as especialidad_nombre,
        e.color as especialidad_color,
        i.nombre as institucion_nombre
      FROM personal p
      JOIN tipos_personal tp ON p.tipo_personal_id = tp.id
      LEFT JOIN especialidades e ON p.especialidad_id = e.id
      JOIN instituciones i ON p.institucion_id = i.id
    `;
        const params = [];
        if (institucion_id) {
            sql += ' WHERE p.institucion_id = $1';
            params.push(institucion_id);
        }
        sql += ' ORDER BY i.nombre, tp.nombre';
        const result = await (0, database_1.query)(sql, params);
        res.json({
            success: true,
            data: result.rows,
            total: result.rowCount
        });
    }
    catch (error) {
        console.error('Error al obtener personal:', error);
        res.json({
            success: true,
            data: [],
            message: 'Usando datos de demostración - BD no disponible'
        });
    }
};
exports.obtenerPersonal = obtenerPersonal;
// AGREGAR ESTAS FUNCIONES QUE FALTAN:
const asignarPersonal = async (req, res) => {
    try {
        const { institucion_id, tipo_personal_id, especialidad_id, cantidad } = req.body;
        const result = await (0, database_1.query)('INSERT INTO personal (institucion_id, tipo_personal_id, especialidad_id, cantidad) VALUES ($1, $2, $3, $4) RETURNING *', [institucion_id, tipo_personal_id, especialidad_id, cantidad]);
        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    }
    catch (error) {
        console.error('Error al asignar personal:', error);
        res.status(500).json({
            success: false,
            message: 'Error al asignar personal - BD no disponible'
        });
    }
};
exports.asignarPersonal = asignarPersonal;
const actualizarPersonal = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidad } = req.body;
        const result = await (0, database_1.query)('UPDATE personal SET cantidad = $1 WHERE id = $2 RETURNING *', [cantidad, id]);
        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Registro de personal no encontrado'
            });
        }
        res.json({
            success: true,
            data: result.rows[0]
        });
    }
    catch (error) {
        console.error('Error al actualizar personal:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar personal - BD no disponible'
        });
    }
};
exports.actualizarPersonal = actualizarPersonal;
