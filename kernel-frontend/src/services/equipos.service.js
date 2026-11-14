import { API_URL } from "../config/api";

// ==========================================
// Kernel - SERVICIO DE EQUIPOS (frontend)
// Habla con /api/equipos del backend.
// ==========================================

// Tipos que acepta el backend, con su nombre para mostrar
export const TIPOS_EQUIPO = [
  ["portatil", "Portátil"],
  ["escritorio", "Escritorio"],
  ["todo_en_uno", "Todo en uno"],
  ["servidor", "Servidor"],
  ["otro", "Otro"],
];

async function solicitar(token, ruta = "", opciones = {}) {
  const respuesta = await fetch(`${API_URL}/api/equipos${ruta}`, {
    method: opciones.method || "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(opciones.body ? { "Content-Type": "application/json" } : {}),
    },
    cache: "no-store",
    signal: opciones.signal,
    ...(opciones.body ? { body: JSON.stringify(opciones.body) } : {}),
  });

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    // Junta los mensajes de validación del backend, si vienen
    const detalles = (Array.isArray(datos?.detalles) ? datos.detalles : [])
      .map((item) => item.msg)
      .filter(Boolean)
      .join("; ");

    const error = new Error(
      detalles || datos?.error || `Error HTTP ${respuesta.status}`
    );
    error.status = respuesta.status;
    throw error;
  }

  return datos;
}

export function listarEquipos(token, signal) {
  return solicitar(token, "", { signal });
}

export function historialEquipo(token, id, signal) {
  return solicitar(token, `/${id}/historial`, { signal });
}

export function crearEquipo(token, datos) {
  return solicitar(token, "", { method: "POST", body: datos });
}

export function actualizarEquipo(token, id, datos) {
  return solicitar(token, `/${id}`, { method: "PUT", body: datos });
}

export function cambiarEstadoEquipo(token, id, activo) {
  const accion = activo ? "activar" : "desactivar";
  return solicitar(token, `/${id}/${accion}`, { method: "PATCH" });
}
