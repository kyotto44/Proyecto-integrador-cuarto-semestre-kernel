import { API_URL } from "../config/api";

// Endpoint público (sin token) que usa el login para mostrar si la API
// responde. Render apaga la API gratuita cuando nadie la usa.
export async function consultarEstadoBackend() {
  const respuesta = await fetch(`${API_URL}/api/estado`);

  if (!respuesta.ok) {
    throw new Error(`Error HTTP ${respuesta.status}`);
  }

  return respuesta.json();
}