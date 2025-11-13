import { Router } from 'express';
import {
  obtenerInstituciones,
  crearInstitucion,
  actualizarInstitucion,
  eliminarInstitucion
} from '../controllers/institucionesController';

const router = Router();

router.get('/', obtenerInstituciones);
router.post('/', crearInstitucion);
router.put('/:id', actualizarInstitucion);
router.delete('/:id', eliminarInstitucion);

export default router;
