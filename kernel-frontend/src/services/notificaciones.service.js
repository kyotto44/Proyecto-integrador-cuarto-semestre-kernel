
import { API_URL } from "../config/api";

async function solicitar(token, ruta, opciones = {}) {
  const respuesta = await fetch(
    `${API_URL}/api/notificaciones${ruta}`,
    {
      method: opciones.method || "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: opciones.signal,
    }
  );

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    throw new Error(
      datos?.error || `Error HTTP ${respuesta.status}`
    );
  }

  return datos;
}

export function listarNotificaciones(token, signal) {
  return solicitar(token, "/", { signal });
}

export function contarPendientes(token, signal) {
  return solicitar(token, "/pendientes", { signal });
}

export function marcarNotificacionLeida(token, id) {
  return solicitar(token, `/${id}/leida`, {
    method: "PATCH",
  });
}
