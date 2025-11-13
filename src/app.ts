import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Routes
import institucionesRoutes from './routes/instituciones';
import tiposRoutes from './routes/tipos';
import recursoHumanoRoutes from './routes/recursoHumano';

import { testConnection } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*', // Permite todos los orígenes en desarrollo
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/instituciones', institucionesRoutes);
app.use('/api/tipos', tiposRoutes);
app.use('/api/recursos-humanos', recursoHumanoRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor de Salud Argentina funcionando',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error no manejado:', error);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

app.listen(PORT, () => {
  console.log(` Servidor corriendo en puerto ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(` Instituciones: http://localhost:${PORT}/api/instituciones`);
});

testConnection().then(success => {
  if (success) {
    console.log('🚀 Conectado a PostgreSQL en Render correctamente');
  } else {
    console.log('⚠️  Error conectando a la base de datos en Render');
  }
});

export default app;
