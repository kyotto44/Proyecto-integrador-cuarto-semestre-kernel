// Bloquea los módulos mientras la cuenta tenga una contraseña temporal (creada
// o restablecida por un administrador). El código PASSWORD_CHANGE_REQUIRED le
// indica al frontend que debe llevar al usuario a cambiarla.
export function exigirPasswordActualizado(req, res, next) {
  if (!req.usuario) {
    return res.status(401).json({
      error: "Autenticación requerida"
    });
  }

  if (req.usuario.debeCambiarPassword) {
    return res.status(403).json({
      error: "Debe cambiar su contraseña",
      codigo: "PASSWORD_CHANGE_REQUIRED"
    });
  }

  next();
}