import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuración para desarrollo local conectando a Render
export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  // SSL es REQUERIDO para Render PostgreSQL incluso en desarrollo
  ssl: {
    rejectUnauthorized: false
  },
  max: 5, // Reduce el máximo para desarrollo
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000, // Aumenta timeout
});

// Función query helper
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

// Probar conexión
pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL en Render');
});

pool.on('error', (err) => {
  console.error('❌ Error de conexión a PostgreSQL:', err.message);
});

// Función para probar conexión al iniciar
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Cliente de PostgreSQL conectado');
    const result = await client.query('SELECT NOW()');
    console.log('✅ Conexión a PostgreSQL exitosa:', result.rows[0].now);
    client.release();
    return true;
  } catch (error: any) {
    console.error('❌ Error detallado conectando a PostgreSQL:');
    console.error('  - Mensaje:', error.message);
    console.error('  - Código:', error.code);
    console.error('  - Detalle:', error.detail);
    return false;
  }
};