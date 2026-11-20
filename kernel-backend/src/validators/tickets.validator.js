
import { body, param, query } from "express-validator";

// Estados válidos de un ticket. Deben coincidir con los que acepta la tabla
// tickets en la base de datos.
export const ESTADOS = [
  "abierto",
  "asignado",
  "en_proceso",
  "resuelto",
  "cerrado",
  "reabierto"
];

export const validarIdTicket = [
  param("id").isInt({ min: 1 })
];

export const validarFiltroTickets = [
  query("estado")
    .optional()
    .isIn(ESTADOS)
];

export const validarCrearTicket = [
  body("titulo")
    .isString()
    .trim()
    .notEmpty()
    .isLength({ max: 200 }),

  body("descripcion")
    .isString()
    .trim()
    .notEmpty(),

  body("prioridad")
    .isIn(["baja", "media", "alta"]),

  body("categoria_id")
    .isInt({ min: 1 }),

  // Opcional: el equipo al que pertenece la falla
  body("equipo_id")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("equipo_id debe ser un número entero positivo")
];



export const validarAsignacion = [
  body("tecnico_id")
    .isInt({ min: 1 })
];

// La solución es opcional aquí: el servicio la exige solo al pasar a
// "resuelto" o "cerrado".
export const validarCambioEstado = [
  body("estado")
    .isIn(ESTADOS),

  body("solucion")
    .optional({ nullable: true })
    .isString()
    .trim()
    .notEmpty()
    .isLength({ max: 5000 })
];
