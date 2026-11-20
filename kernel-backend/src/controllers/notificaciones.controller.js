
import * as servicio from "../services/notificaciones.service.js";

// Las notificaciones las crean triggers de la base de datos
// (08_funcion_avisos.sql y 09_avisos_seguimientos.sql). Este controlador solo
// las lee y las marca como leídas, siempre las del usuario autenticado.
export async function listar(req, res, next) {
  try {
    const datos = await servicio.listarNotificaciones(
      req.usuario.id
    );

    return res.status(200).json(datos);
  } catch (error) {
    next(error);
  }
}

export async function pendientes(req, res, next) {
  try {
    const total = await servicio.contarPendientes(
      req.usuario.id
    );

    return res.status(200).json({
      pendientes: total,
    });
  } catch (error) {
    next(error);
  }
}

export async function marcarLeida(req, res, next) {
  try {
    const resultado = await servicio.marcarLeida(
      req.usuario.id,
      Number(req.params.id)
    );

    // Si la notificación no es del usuario, el UPDATE no afecta filas y se
    // responde 404.
    if (!resultado) {
      return res.status(404).json({
        error: "Notificación no encontrada",
      });
    }

    return res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
}
