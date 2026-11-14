
import { API_URL } from "../config/api";

export async function listarUsuarios(token, signal) {
  const respuesta = await fetch(`${API_URL}/api/usuarios`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
    signal,
  });

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    const error = new Error(
      datos?.mensaje ||
      datos?.error ||
      `No se pudo consultar usuarios (HTTP ${respuesta.status})`
    );

    error.status = respuesta.status;
    throw error;
  }

  return datos;
}


export async function crearUsuario(token, datosUsuario) {
  const respuesta = await fetch(`${API_URL}/api/usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
    body: JSON.stringify(datosUsuario),
  });

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    const detalles = Array.isArray(datos?.errores)
      ? datos.errores
          .map((item) => item.msg || item.mensaje)
          .filter(Boolean)
          .join("; ")
      : "";

    const error = new Error(
      detalles ||
        datos?.mensaje ||
        datos?.error ||
        `No se pudo crear el usuario (HTTP ${respuesta.status})`
    );

    error.status = respuesta.status;
    throw error;
  }

  return datos;
}


export async function actualizarUsuario(token, id, datosUsuario) {
  const respuesta = await fetch(
    `${API_URL}/api/usuarios/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      body: JSON.stringify(datosUsuario),
    }
  );

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    const detalles = Array.isArray(datos?.errores)
      ? datos.errores
          .map((item) => item.msg || item.mensaje)
          .filter(Boolean)
          .join("; ")
      : "";

    const error = new Error(
      detalles ||
      datos?.error ||
      datos?.mensaje ||
      `No fue posible actualizar el usuario (HTTP ${respuesta.status})`
    );

    error.status = respuesta.status;
    throw error;
  }

  return datos;
}

export async function cambiarEstadoUsuario(token, id, activo) {
  const respuesta = await fetch(
    `${API_URL}/api/usuarios/${id}/estado`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      body: JSON.stringify({ activo }),
    }
  );

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    const error = new Error(
      datos?.error ||
      datos?.mensaje ||
      `No fue posible cambiar el estado (HTTP ${respuesta.status})`
    );

    error.status = respuesta.status;
    throw error;
  }

  return datos;
}


export async function restablecerPasswordUsuario(token, id) {
  const respuesta = await fetch(
    `${API_URL}/api/usuarios/${id}/restablecer-password`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    const error = new Error(
      datos?.error ||
      datos?.mensaje ||
      `Error al restablecer contraseña (HTTP ${respuesta.status})`
    );

    error.status = respuesta.status;
    throw error;
  }

  return datos;
}
