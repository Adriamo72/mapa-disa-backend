import { Router } from 'express';
import {
  obtenerTiposPersonal,
  obtenerEspecialidades
} from '../controllers/tiposController';

const router = Router();

router.get('/personal', obtenerTiposPersonal);
router.get('/especialidades', obtenerEspecialidades);

export default router;
