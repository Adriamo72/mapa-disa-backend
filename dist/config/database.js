"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.query = exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.pool = new pg_1.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    // Configuraciones específicas para Render
    ssl: {
        rejectUnauthorized: false // Necesario para Render
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Aumentar timeout
});
// Función query helper
const query = (text, params) => {
    return exports.pool.query(text, params);
};
exports.query = query;
// Probar conexión
exports.pool.on('connect', () => {
    console.log('✅ Conectado a PostgreSQL en Render');
});
exports.pool.on('error', (err) => {
    console.error('❌ Error de conexión a PostgreSQL:', err.message);
});
// Función para probar conexión al iniciar
const testConnection = async () => {
    try {
        const client = await exports.pool.connect();
        const result = await client.query('SELECT NOW()');
        console.log('✅ Conexión a Render PostgreSQL exitosa:', result.rows[0].now);
        client.release();
        return true;
    }
    catch (error) {
        console.error('❌ Error conectando a Render PostgreSQL:', error.message);
        return false;
    }
};
exports.testConnection = testConnection;
