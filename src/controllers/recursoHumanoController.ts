import { Request, Response } from 'express';
import { query } from '../config/database';

export const obtenerRecursosHumanos = async (req: Request, res: Response) => {
  try {
    const { tipo, destino } = req.query;
    
    let sql = `
      SELECT 
        rh.*,
        e.nombre as especialidad_nombre,
        e.color as especialidad_color,
        i.nombre as institucion_nombre
      FROM recurso_humano rh
      LEFT JOIN especialidades e ON rh.especialidad_id = e.id
      LEFT JOIN instituciones i ON rh.destino = i.nombre
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCount = 0;

    if (tipo) {
      paramCount++;
      sql += ` AND rh.tipo = $${paramCount}`;
      params.push(tipo);
    }

    if (destino) {
      paramCount++;
      sql += ` AND rh.destino = $${paramCount}`;
      params.push(destino);
    }

    // CAMBIO: Ordenar primero por orden_importacion, luego por apellido
    sql += ' ORDER BY rh.orden_importacion ASC NULLS LAST, rh.apellido, rh.nombre';

    const result = await query(sql, params);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rowCount
    });
  } catch (error) {
    console.error('Error al obtener recursos humanos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const crearRecursoHumano = async (req: Request, res: Response) => {
  try {
    const {
      tipo,
      grado,
      escalafon,
      orientacion,
      profesion,
      apellido,
      nombre,
      destino,
      matricula,
      dni,
      especialidad_id,
      orden_importacion // ← AGREGAR ESTE CAMPO
    } = req.body;

    // Manejar especialidad_id de forma segura
    let especialidadId: number | null = null;
    
    if (especialidad_id && especialidad_id !== '') {
      const idNum = parseInt(especialidad_id);
      if (!isNaN(idNum)) {
        especialidadId = idNum;
      }
    }

    // Manejar orden_importacion de forma segura
    let ordenImportacion: number | null = null;
    
    if (orden_importacion !== undefined && orden_importacion !== null && orden_importacion !== '') {
      const ordenNum = parseInt(orden_importacion);
      if (!isNaN(ordenNum)) {
        ordenImportacion = ordenNum;
      }
    }

    const result = await query(
      `INSERT INTO recurso_humano 
       (tipo, grado, escalafon, orientacion, profesion, apellido, nombre, destino, matricula, dni, especialidad_id, orden_importacion) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
      [tipo, grado, escalafon, orientacion, profesion, apellido, nombre, destino, matricula, dni, especialidadId, ordenImportacion]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error al crear recurso humano:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un personal con ese DNI'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear recurso humano'
    });
  }
};

export const actualizarRecursoHumano = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      tipo,
      grado,
      escalafon,
      orientacion,
      profesion,
      apellido,
      nombre,
      destino,
      matricula,
      dni,
      especialidad_id,
      orden_importacion // ← AGREGAR ESTE CAMPO
    } = req.body;

    // Manejar especialidad_id de forma segura
    let especialidadId: number | null = null;
    
    if (especialidad_id && especialidad_id !== '') {
      const idNum = parseInt(especialidad_id);
      if (!isNaN(idNum)) {
        especialidadId = idNum;
      }
    }

    // Manejar orden_importacion de forma segura
    let ordenImportacion: number | null = null;
    
    if (orden_importacion !== undefined && orden_importacion !== null && orden_importacion !== '') {
      const ordenNum = parseInt(orden_importacion);
      if (!isNaN(ordenNum)) {
        ordenImportacion = ordenNum;
      }
    }

    const result = await query(
      `UPDATE recurso_humano 
       SET tipo = $1, grado = $2, escalafon = $3, orientacion = $4, profesion = $5, 
           apellido = $6, nombre = $7, destino = $8, matricula = $9, dni = $10, 
           especialidad_id = $11, orden_importacion = $12
       WHERE id = $13 
       RETURNING *`,
      [tipo, grado, escalafon, orientacion, profesion, apellido, nombre, destino, matricula, dni, especialidadId, ordenImportacion, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recurso humano no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error al actualizar recurso humano:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un personal con ese DNI'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar recurso humano'
    });
  }
};

export const eliminarRecursoHumano = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar si existe el recurso humano primero
    const recursoExistente = await query(
      'SELECT id FROM recurso_humano WHERE id = $1',
      [id]
    );

    if (recursoExistente.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recurso humano no encontrado'
      });
    }

    // Verificar si tiene asignaciones activas (con manejo seguro si la tabla no existe)
    try {
      const asignaciones = await query(
        'SELECT id FROM asignacion_personal WHERE recurso_humano_id = $1 AND activo = true',
        [id]
      );

      if (asignaciones.rowCount && asignaciones.rowCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar, el personal tiene asignaciones activas'
        });
      }
    } catch (error: any) {
      // Si la tabla asignacion_personal no existe, continuar con la eliminación
      if (error.code === '42P01') { // código de error para "tabla no existe"
        console.log('Tabla asignacion_personal no encontrada, continuando con eliminación...');
      } else {
        throw error; // Relanzar otros errores
      }
    }

    // Eliminar el recurso humano
    const result = await query('DELETE FROM recurso_humano WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Recurso humano eliminado correctamente'
    });
  } catch (error: any) {
    console.error('Error al eliminar recurso humano:', error);
    
    // Manejar error de clave foránea
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar, el personal está siendo utilizado en otras tablas'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al eliminar recurso humano: ' + error.message
    });
  }
};