"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tiposController_1 = require("../controllers/tiposController");
const router = (0, express_1.Router)();
router.get('/personal', tiposController_1.obtenerTiposPersonal);
router.get('/especialidades', tiposController_1.obtenerEspecialidades);
exports.default = router;
