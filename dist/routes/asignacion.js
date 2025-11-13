"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asignacionController_1 = require("../controllers/asignacionController");
const router = (0, express_1.Router)();
router.get('/', asignacionController_1.obtenerAsignaciones);
router.post('/', asignacionController_1.crearAsignacion);
router.put('/:id/finalizar', asignacionController_1.finalizarAsignacion);
exports.default = router;
