"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.finalizarAsignacion = exports.crearAsignacion = exports.obtenerAsignaciones = void 0;
const database_1 = require("../config/database");
const obtenerAsignaciones = async (req, res) => {
    try {
        const { institucion_id, activo } = req.query;
        let sql = `
      SELECT 
        ap.*,
        rh.tipo as personal_tipo,
        rh.jerarquia,
        rh.apellido,
        rh.nombre,
        rh.documento,
        rh.profesion,
        i.nombre as institucion_nombre,
        tp.nombre as tipo_personal_nombre,
        tp.color as tipo_personal_color,
        e.nombre as especialidad_nombre,
        e.color as especialidad_color
      FROM asignacion_personal ap
      JOIN recurso_humano rh ON ap.recurso_humano_id = rh.id
      JOIN instituciones i ON ap.institucion_id = i.id
      JOIN tipos_personal tp ON ap.tipo_personal_id = tp.id
      LEFT JOIN especialidades e ON ap.especialidad_id = e.id
      WHERE 1=1
    `;
        const params = [];
        let paramCount = 0;
        if (institucion_id) {
            paramCount++;
            sql += ` AND ap.institucion_id = $${paramCount}`;
            params.push(institucion_id);
        }
        if (activo !== undefined) {
            paramCount++;
            sql += ` AND ap.activo = $${paramCount}`;
            params.push(activo === 'true');
        }
        sql += ' ORDER BY i.nombre, rh.apellido, rh.nombre';
        const result = await (0, database_1.query)(sql, params);
        res.json({
            success: true,
            data: result.rows,
            total: result.rowCount
        });
    }
    catch (error) {
        console.error('Error al obtener asignaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};
exports.obtenerAsignaciones = obtenerAsignaciones;
const crearAsignacion = async (req, res) => {
    try {
        const { institucion_id, recurso_humano_id, tipo_personal_id, especialidad_id, fecha_asignacion } = req.body;
        // Desactivar asignaciones previas del mismo personal
        await (0, database_1.query)('UPDATE asignacion_personal SET activo = false, fecha_fin = CURRENT_DATE WHERE recurso_humano_id = $1 AND activo = true', [recurso_humano_id]);
        const result = await (0, database_1.query)(`INSERT INTO asignacion_personal 
       (institucion_id, recurso_humano_id, tipo_personal_id, especialidad_id, fecha_asignacion) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`, [institucion_id, recurso_humano_id, tipo_personal_id, especialidad_id, fecha_asignacion || new Date().toISOString().split('T')[0]]);
        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    }
    catch (error) {
        console.error('Error al crear asignación:', error);
        if (error.code === '23505') {
            return res.status(400).json({
                success: false,
                message: 'El personal ya tiene una asignación activa en esta institución'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error al crear asignación'
        });
    }
};
exports.crearAsignacion = crearAsignacion;
const finalizarAsignacion = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, database_1.query)('UPDATE asignacion_personal SET activo = false, fecha_fin = CURRENT_DATE WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Asignación no encontrada'
            });
        }
        res.json({
            success: true,
            data: result.rows[0],
            message: 'Asignación finalizada correctamente'
        });
    }
    catch (error) {
        console.error('Error al finalizar asignación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al finalizar asignación'
        });
    }
};
exports.finalizarAsignacion = finalizarAsignacion;
