"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const personalController_1 = require("../controllers/personalController");
const router = (0, express_1.Router)();
router.get('/', personalController_1.obtenerPersonal);
router.post('/', personalController_1.asignarPersonal);
router.put('/:id', personalController_1.actualizarPersonal);
exports.default = router;
