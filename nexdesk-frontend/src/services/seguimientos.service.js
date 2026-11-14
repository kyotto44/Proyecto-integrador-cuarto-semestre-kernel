
import { API_URL } from "../config/api";

async function solicitar(token, ticketId, opciones = {}) {
  const id = Number(ticketId);

  if (!Number.isSafeInteger(id) || id < 1) {
    throw new Error("El ID del ticket no es válido.");
  }

  const respuesta = await fetch(
    `${API_URL}/api/tickets/${id}/seguimientos`,
    {
      method: opciones.method || "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(opciones.body
          ? { "Content-Type": "application/json" }
          : {}),
      },
      cache: "no-store",
      signal: opciones.signal,
      ...(opciones.body
        ? { body: JSON.stringify(opciones.body) }
        : {}),
    }
  );

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    const detalles = [
      ...(Array.isArray(datos?.errores) ? datos.errores : []),
      ...(Array.isArray(datos?.errors) ? datos.errors : []),
    ]
      .map((item) => item.msg || item.mensaje)
      .filter(Boolean)
      .join("; ");

    const error = new Error(
      detalles ||
        datos?.error ||
        datos?.mensaje ||
        `Error HTTP ${respuesta.status}`
    );

    error.status = respuesta.status;
    throw error;
  }

  return datos;
}

export function listarSeguimientos(token, ticketId, signal) {
  return solicitar(token, ticketId, { signal });
}

export function crearSeguimiento(token, ticketId, observacion) {
  const texto = observacion.trim();

  if (!texto || texto.length > 2000) {
    throw new Error(
      "La observación debe contener entre 1 y 2000 caracteres."
    );
  }

  return solicitar(token, ticketId, {
    method: "POST",
    body: { observacion: texto },
  });
}
