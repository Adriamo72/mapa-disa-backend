"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerEspecialidades = exports.obtenerTiposPersonal = void 0;
const database_1 = require("../config/database");
const obtenerTiposPersonal = async (req, res) => {
    try {
        const result = await (0, database_1.query)('SELECT * FROM tipos_personal ORDER BY id');
        res.json({
            success: true,
            data: result.rows
        });
    }
    catch (error) {
        console.error('Error al obtener tipos de personal:', error);
        // Datos de ejemplo para desarrollo
        res.json({
            success: true,
            data: [
                { id: 1, nombre: 'Médicos', color: '#3B82F6' },
                { id: 2, nombre: 'Enfermeros', color: '#10B981' },
                { id: 3, nombre: 'Administrativos', color: '#F59E0B' },
                { id: 4, nombre: 'Técnicos', color: '#8B5CF6' },
                { id: 5, nombre: 'Directivos', color: '#EF4444' }
            ],
            message: 'Usando datos de demostración - BD no disponible'
        });
    }
};
exports.obtenerTiposPersonal = obtenerTiposPersonal;
const obtenerEspecialidades = async (req, res) => {
    try {
        const result = await (0, database_1.query)('SELECT * FROM especialidades ORDER BY id');
        res.json({
            success: true,
            data: result.rows
        });
    }
    catch (error) {
        console.error('Error al obtener especialidades:', error);
        // Datos de ejemplo para desarrollo
        res.json({
            success: true,
            data: [
                { id: 1, nombre: 'Cardiología', color: '#EF4444' },
                { id: 2, nombre: 'Pediatría', color: '#8B5CF6' },
                { id: 3, nombre: 'Traumatología', color: '#06B6D4' },
                { id: 4, nombre: 'Clínica Médica', color: '#10B981' },
                { id: 5, nombre: 'Cirugía', color: '#F59E0B' },
                { id: 6, nombre: 'Ginecología', color: '#EC4899' }
            ],
            message: 'Usando datos de demostración - BD no disponible'
        });
    }
};
exports.obtenerEspecialidades = obtenerEspecialidades;
