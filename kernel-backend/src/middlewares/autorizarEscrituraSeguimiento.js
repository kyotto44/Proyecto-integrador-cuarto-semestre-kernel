
// Va después de autorizarTicket: ese middleware ya comprobó que el usuario puede
// VER el ticket; aquí se decide si además puede ESCRIBIR observaciones.
// Pueden hacerlo los administradores, el dueño del ticket y el técnico asignado.
export function autorizarEscrituraSeguimiento(
  req,
  res,
  next
) {
  const ticket = req.ticketAutorizado;

  // Si no hay ticket validado, la ruta quedó mal armada (falta autorizarTicket
  // antes); es un error del servidor, no del usuario.
  if (!ticket) {
    return res.status(500).json({
      error: "No se ha validado el acceso al ticket.",
    });
  }

  const rol = req.usuario?.rol;
  // Los IDs llegan de PostgreSQL como texto (BIGINT); se pasan a número para
  // compararlos sin errores.
  const usuarioId = Number(req.usuario?.id);

  const administrativo =
    rol === "superadmin" || rol === "admin";

  const propietario =
    rol === "usuario" &&
    Number(ticket.usuario_id) === usuarioId;

  const tecnicoAsignado =
    rol === "tecnico" &&
    ticket.tecnico_usuario_id != null &&
    Number(ticket.tecnico_usuario_id) === usuarioId;

  if (
    !administrativo &&
    !propietario &&
    !tecnicoAsignado
  ) {
    return res.status(403).json({
      error:
        "No tiene permisos para registrar " +
        "observaciones en este ticket.",
    });
  }

  next();
}
