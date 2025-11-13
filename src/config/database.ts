import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
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
    const result = await client.query('SELECT NOW()');
    console.log('✅ Conexión a Render PostgreSQL exitosa:', result.rows[0].now);
    client.release();
    return true;
  } catch (error: any) {
    console.error('❌ Error conectando a Render PostgreSQL:', error.message);
    return false;
  }
};