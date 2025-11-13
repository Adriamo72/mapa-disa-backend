import { Router } from 'express';
import {
  obtenerRecursosHumanos,
  crearRecursoHumano,
  actualizarRecursoHumano,
  eliminarRecursoHumano
} from '../controllers/recursoHumanoController';

const router = Router();

router.get('/', obtenerRecursosHumanos);
router.post('/', crearRecursoHumano);
router.put('/:id', actualizarRecursoHumano);
router.delete('/:id', eliminarRecursoHumano);

export default router;