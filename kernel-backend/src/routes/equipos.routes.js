import { Router } from "express";

import * as controller from "../controllers/equipos.controller.js";

import {
  validarIdEquipo,
  validarFiltroEquipos,
  validarDatosEquipo,
} from "../validators/equipos.validator.js";

import { validar } from "../middlewares/validar.js";
import { autorizar } from "../middlewares/autorizar.js";

// ==========================================
// Kernel - RUTAS DE EQUIPOS
// El JWT y la contraseña actualizada ya se
// verifican en app.js (protegerModulo).
// ==========================================

const router = Router();

// 1. LISTAR
router.get(
  "/",
  autorizar("superadmin", "admin", "usuario"),
  validarFiltroEquipos,
  validar,
  controller.listar
);

// 2. HISTORIAL DE REPARACIONES
router.get(
  "/:id/historial",
  autorizar("superadmin", "admin", "tecnico", "usuario"),
  validarIdEquipo,
  validar,
  controller.historial
);

// 3. CONSULTAR UNO
router.get(
  "/:id",
  autorizar("superadmin", "admin", "tecnico", "usuario"),
  validarIdEquipo,
  validar,
  controller.obtener
);

// 4. CREAR
router.post(
  "/",
  autorizar("superadmin", "admin", "usuario"),
  validarDatosEquipo,
  validar,
  controller.crear
);

// 5. EDITAR
router.put(
  "/:id",
  autorizar("superadmin", "admin", "usuario"),
  validarIdEquipo,
  validarDatosEquipo,
  validar,
  controller.actualizar
);

// 6. ACTIVAR / DESACTIVAR
router.patch(
  "/:id/:accion",
  autorizar("superadmin", "admin"),
  validarIdEquipo,
  validar,
  (req, res, next) => {
    if (!["activar", "desactivar"].includes(req.params.accion)) {
      return res.status(400).json({ error: "Acción inválida" });
    }
    next();
  },
  controller.cambiarEstado
);

export default router;