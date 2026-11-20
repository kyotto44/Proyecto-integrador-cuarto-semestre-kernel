
import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext.js";

import {
  iniciarSesion,
  obtenerPerfil,
  cambiarPassword as solicitarCambio,
} from "../services/auth.service";

// El token va en sessionStorage: dura mientras la pestaña esté abierta y se
// borra al cerrarla, más seguro que localStorage en equipos compartidos.
const CLAVE_SESION = "kernel_access_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  // Al recargar la página se intenta recuperar la sesión: el token guardado se
  // valida pidiendo el perfil al backend y, si ya no sirve, se borra.
  useEffect(() => {
    // "activo" evita actualizar el estado si el componente se desmonta antes de
    // que responda el backend.
    let activo = true;

    async function restaurarSesion() {
      const tokenGuardado = sessionStorage.getItem(CLAVE_SESION);

      if (!tokenGuardado) {
        if (activo) setCargandoSesion(false);
        return;
      }

      try {
        const perfil = await obtenerPerfil(tokenGuardado);

        if (!perfil?.usuario) {
          throw new Error("No se pudo validar el perfil");
        }

        if (activo) {
          setToken(tokenGuardado);
          setUsuario(perfil.usuario);
        }
      } catch (error) {
        console.error("Error restaurando sesión:", error);

        if (activo) {
          sessionStorage.removeItem(CLAVE_SESION);
          setToken(null);
          setUsuario(null);
        }
      } finally {
        if (activo) setCargandoSesion(false);
      }
    }

    restaurarSesion();

    return () => {
      activo = false;
    };
  }, []);

  // Primero obtiene el token y luego el perfil; el token solo se guarda si los
  // dos pasos salen bien.
  async function login(email, password) {
    const respuesta = await iniciarSesion(email, password);

    const jwt = respuesta.access_token;

    if (!jwt) {
      throw new Error("El backend no devolvió access_token");
    }

    const perfil = await obtenerPerfil(jwt);

    if (!perfil?.usuario) {
      throw new Error("No se pudo recuperar el perfil");
    }

    sessionStorage.setItem(CLAVE_SESION, jwt);

    setToken(jwt);
    setUsuario(perfil.usuario);

    return perfil.usuario;
  }

  function logout() {
    sessionStorage.removeItem(CLAVE_SESION);
    setToken(null);
    setUsuario(null);
  }

  async function cambiarPassword(passwordActual, passwordNueva) {
    if (!token) {
      throw new Error("La sesión no está disponible");
    }

    const resultado = await solicitarCambio(
      token,
      passwordActual,
      passwordNueva
    );

    // No reutilizar el JWT después del cambio exitoso.
    logout();

    return resultado;
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        cargandoSesion,
        login,
        logout,
        cambiarPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
