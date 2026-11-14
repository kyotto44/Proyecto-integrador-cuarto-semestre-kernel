
import { API_URL } from "../config/api";

async function solicitar(token, ruta = "", opciones = {}) {
  const respuesta = await fetch(
    `${API_URL}/api/categorias${ruta}`,
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

export function listarCategorias(token, signal) {
  return solicitar(token, "", { signal });
}

export function obtenerCategoria(token, id) {
  return solicitar(token, `/${id}`);
}

export function crearCategoria(token, datos) {
  return solicitar(token, "", {
    method: "POST",
    body: datos,
  });
}

export function actualizarCategoria(token, id, datos) {
  return solicitar(token, `/${id}`, {
    method: "PUT",
    body: datos,
  });
}

export function cambiarEstadoCategoria(token, id, activa) {
  const accion = activa ? "activar" : "desactivar";

  return solicitar(token, `/${id}/${accion}`, {
    method: "PATCH",
  });
}
