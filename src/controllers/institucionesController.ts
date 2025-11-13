import { Request, Response } from 'express';
import { query } from '../config/database';

export const obtenerInstituciones = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        i.*,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'tipo', rh.tipo,
                'grado', rh.grado,
                'escalafon', rh.escalafon,
                'orientacion', rh.orientacion,
                'profesion', rh.profesion,
                'apellido', rh.apellido,
                'nombre', rh.nombre,
                'matricula', rh.matricula,
                'dni', rh.dni,
                'especialidad', json_build_object(
                  'id', e.id,
                  'nombre', e.nombre,
                  'color', e.color
                )
              )
            )
            FROM recurso_humano rh
            LEFT JOIN especialidades e ON rh.especialidad_id = e.id
            WHERE rh.destino = i.destino
          ),
          '[]'
        ) as personal
      FROM instituciones i
      ORDER BY i.destino, i.nombre
    `);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rowCount
    });
  } catch (error) {
    console.error('Error al obtener instituciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener instituciones'
    });
  }
};

// Los otros métodos (crear, actualizar, eliminar) también necesitan manejo de errores
export const crearInstitucion = async (req: Request, res: Response) => {
  try {
    const { nombre, tipo, latitud, longitud, categoria, telefono, destino } = req.body;
    
    // Validar que el destino tenga 4 caracteres (cuatrigrama)
    if (destino && destino.length !== 4) {
      return res.status(400).json({
        success: false,
        message: 'El DESTINO debe ser un cuatrigrama de 4 caracteres'
      });
    }
    
    // Validar que el tipo sea válido
    const tiposValidos = ['hospital', 'enfermeria', 'destino_enn'];
    if (tipo && !tiposValidos.includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de institución no válido. Los tipos válidos son: hospital, enfermeria, destino_enn'
      });
    }
    
    // Validar que la categoría sea válida (si se proporciona)
    const categoriasValidas = ['I', 'II', 'III', 'N/A', ''];
    if (categoria && !categoriasValidas.includes(categoria)) {
      return res.status(400).json({
        success: false,
        message: 'Categoría no válida. Las categorías válidas son: I, II, III, N/A'
      });
    }
    
    const result = await query(
      'INSERT INTO instituciones (nombre, tipo, latitud, longitud, categoria, telefono, destino) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [nombre, tipo, latitud, longitud, categoria, telefono, destino]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error al crear institución:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una institución con ese DESTINO'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al crear institución'
    });
  }
};

export const actualizarInstitucion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, tipo, latitud, longitud, categoria, telefono, destino } = req.body;
    
    // Validar que el destino tenga 4 caracteres (cuatrigrama)
    if (destino && destino.length !== 4) {
      return res.status(400).json({
        success: false,
        message: 'El DESTINO debe ser un cuatrigrama de 4 caracteres'
      });
    }
    
    // Validar que el tipo sea válido
    const tiposValidos = ['hospital', 'enfermeria', 'destino_enn'];
    if (tipo && !tiposValidos.includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de institución no válido. Los tipos válidos son: hospital, enfermeria, destino_enn'
      });
    }
    
    // Validar que la categoría sea válida (si se proporciona)
    const categoriasValidas = ['I', 'II', 'III', 'N/A', ''];
    if (categoria && !categoriasValidas.includes(categoria)) {
      return res.status(400).json({
        success: false,
        message: 'Categoría no válida. Las categorías válidas son: I, II, III, N/A'
      });
    }
    
    const result = await query(
      'UPDATE instituciones SET nombre = $1, tipo = $2, latitud = $3, longitud = $4, categoria = $5, telefono = $6, destino = $7 WHERE id = $8 RETURNING *',
      [nombre, tipo, latitud, longitud, categoria, telefono, destino, id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Institución no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error al actualizar institución:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una institución con ese DESTINO'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al actualizar institución'
    });
  }
};

export const eliminarInstitucion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Intentando eliminar institución ID: ${id}`);
    
    // PRIMERO: Obtener el destino de la institución
    const institucionResult = await query(
      'SELECT destino FROM instituciones WHERE id = $1',
      [id]
    );
    
    if (institucionResult.rowCount === 0) {
      console.log(`❌ Institución ${id} no encontrada`);
      return res.status(404).json({
        success: false,
        message: 'Institución no encontrada'
      });
    }
    
    const destino = institucionResult.rows[0].destino;
    console.log(`📋 Destino de la institución: ${destino}`);
    
    // SEGUNDO: Verificar si hay personal asignado a este destino
    const personalResult = await query(
      'SELECT COUNT(*) as count FROM recurso_humano WHERE destino = $1',
      [destino]
    );
    
    const personalCount = parseInt(personalResult.rows[0].count);
    
    if (personalCount > 0) {
      console.log(`❌ No se puede eliminar. Hay ${personalCount} personal asignado al destino ${destino}`);
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar la institución. Tiene ${personalCount} personal asignado. Elimine primero el personal asociado.`
      });
    }
    
    // TERCERO: Intentar eliminar asignaciones (si la tabla existe)
    try {
      await query('DELETE FROM asignacion_personal WHERE institucion_id = $1', [id]);
      console.log('✅ Asignaciones eliminadas (si existían)');
    } catch (error: any) {
      // Si la tabla no existe, continuar normalmente
      if (error.code !== '42P01') { // 42P01 = tabla no existe
        console.log('ℹ️ Error al eliminar asignaciones:', error.message);
      }
    }
    
    // CUARTO: Eliminar la institución
    const result = await query('DELETE FROM instituciones WHERE id = $1', [id]);
    
    console.log(`✅ Institución ${id} eliminada correctamente`);
    res.json({
      success: true,
      message: 'Institución eliminada correctamente'
    });
    
  } catch (error: any) {
    console.error('❌ Error al eliminar institución:', error);
    
    // Manejar error de clave foránea
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar la institución porque tiene relaciones activas en otras tablas.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al eliminar institución: ' + error.message
    });
  }
};