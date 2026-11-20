
import { body, param } from "express-validator";

// Valida el ID del ticket de la URL y el texto de la observación. El límite de
// 2000 caracteres evita guardar textos enormes en el historial.
export const validarSeguimiento = [
  param("id")
    .isInt({ min: 1 })
    .withMessage(
      "El ID del ticket debe ser un entero positivo"
    ),

  body("observacion")
    .isString()
    .withMessage("La observación debe ser texto")
    .trim()
    .notEmpty()
    .withMessage("La observación es obligatoria")
    .isLength({ max: 2000 })
    .withMessage("Máximo 2000 caracteres")
];
