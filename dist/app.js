"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
// Routes
const instituciones_1 = __importDefault(require("./routes/instituciones"));
const tipos_1 = __importDefault(require("./routes/tipos"));
const recursoHumano_1 = __importDefault(require("./routes/recursoHumano"));
const database_1 = require("./config/database");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: '*', // Permite todos los orígenes en desarrollo
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express_1.default.json());
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});
// Routes
app.use('/api/instituciones', instituciones_1.default);
app.use('/api/tipos', tipos_1.default);
app.use('/api/recursos-humanos', recursoHumano_1.default);
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
app.use((error, req, res, next) => {
    console.error('Error no manejado:', error);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
});
app.listen(PORT, () => {
    console.log(` Servidor corriendo en puerto ${PORT}`);
    console.log(` Health check disponible en el puerto ${PORT}`);
});
(0, database_1.testConnection)().then(success => {
    if (success) {
        console.log('🚀 Conectado a PostgreSQL en Render correctamente');
    }
    else {
        console.log('⚠️  Error conectando a la base de datos en Render');
    }
});
exports.default = app;
