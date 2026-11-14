import * as service from "../services/equipos.service.js";

// ==========================================
// Kernel - CONTROLADOR DE EQUIPOS
// ==========================================

// GET /api/equipos
export async function listar(req, res, next) {
  try {
    const equipos = await service.listarEquipos(
      req.usuario,
      req.query.usuario_id
    );
    res.status(200).json(equipos);
  } catch (error) {
    next(error);
  }
}

// GET /api/equipos/:id
export async function obtener(req, res, next) {
  try {
    const equipo = await service.obtenerEquipo(req.params.id, req.usuario);

    if (!equipo) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }

    res.status(200).json(equipo);
  } catch (error) {
    next(error);
  }
}

// GET /api/equipos/:id/historial
export async function historial(req, res, next) {
  try {
    const resultado = await service.historialEquipo(
      req.params.id,
      req.usuario
    );

    if (!resultado) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }

    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
}

// POST /api/equipos
export async function crear(req, res, next) {
  try {
    const equipo = await service.crearEquipo(req.body, req.usuario);
    res.status(201).json(equipo);
  } catch (error) {
    next(error);
  }
}

// PUT /api/equipos/:id
export async function actualizar(req, res, next) {
  try {
    const equipo = await service.actualizarEquipo(
      req.params.id,
      req.body,
      req.usuario
    );

    if (!equipo) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }

    res.status(200).json(equipo);
  } catch (error) {
    next(error);
  }
}

// PATCH /api/equipos/:id/activar
// PATCH /api/equipos/:id/desactivar
export async function cambiarEstado(req, res, next) {
  try {
    const activo = req.params.accion === "activar";

    const equipo = await service.cambiarEstadoEquipo(
      req.params.id,
      activo,
      req.usuario
    );

    if (!equipo) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }

    res.status(200).json(equipo);
  } catch (error) {
    next(error);
  }
}