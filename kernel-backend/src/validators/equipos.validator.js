import { body, param, query } from "express-validator";

export const TIPOS_EQUIPO = [
  "portatil",
  "escritorio",
  "todo_en_uno",
  "servidor",
  "otro",
];

// ID en la URL: /api/equipos/:id
export const validarIdEquipo = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El ID debe ser un número entero positivo"),
];

// Filtro opcional: /api/equipos?usuario_id=5
export const validarFiltroEquipos = [
  query("usuario_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("usuario_id debe ser un número entero positivo"),
];

// Datos para crear o editar un equipo
export const validarDatosEquipo = [
  body("tipo")
    .isIn(TIPOS_EQUIPO)
    .withMessage(`El tipo debe ser uno de: ${TIPOS_EQUIPO.join(", ")}`),

  body("marca")
    .isString().withMessage("La marca debe ser texto")
    .trim()
    .notEmpty().withMessage("La marca es obligatoria")
    .isLength({ max: 60 }).withMessage("La marca no puede superar 60 caracteres"),

  body("modelo")
    .isString().withMessage("El modelo debe ser texto")
    .trim()
    .notEmpty().withMessage("El modelo es obligatorio")
    .isLength({ max: 80 }).withMessage("El modelo no puede superar 80 caracteres"),

  body("serial")
    .isString().withMessage("El serial debe ser texto")
    .trim()
    .notEmpty().withMessage("El serial es obligatorio")
    .isLength({ max: 80 }).withMessage("El serial no puede superar 80 caracteres")
    .customSanitizer((valor) => valor.toUpperCase()),

  body("observaciones")
    .optional({ nullable: true })
    .isString().withMessage("Las observaciones deben ser texto")
    .trim()
    .isLength({ max: 250 }).withMessage("Las observaciones no pueden superar 250 caracteres"),

  // Solo lo usa el admin para indicar el cliente dueño
  body("usuario_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("usuario_id debe ser un número entero positivo"),
];