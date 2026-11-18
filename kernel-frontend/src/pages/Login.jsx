
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import EstadoBackend from "../components/EstadoBackend";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  // 1. Navegación y autenticación
  const navigate = useNavigate();
  const { login } = useAuth();

  // 2. Estados del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // 3. Procesar inicio de sesión
  async function manejarLogin(evento) {
    evento.preventDefault();

    setError("");
    setCargando(true);

    // Evitar conservar una bienvenida anterior
    sessionStorage.removeItem(
      "kernel_mostrar_bienvenida"
    );

    try {
      // Autenticación mediante la API REST
      const perfil = await login(email, password);

      // Verificar cambio obligatorio de contraseña
      if (
        perfil.debeCambiarPassword ||
        perfil.debe_cambiar_password
      ) {
        navigate("/cambiar-password", {
          replace: true,
        });
      } else {
        // Activar notificación de bienvenida
        sessionStorage.setItem(
          "kernel_mostrar_bienvenida",
          "1"
        );

        // Acceder al dashboard
        navigate("/dashboard", {
          replace: true,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible iniciar sesión."
      );
    } finally {
      setCargando(false);
    }
  }

  // 4. Interfaz de inicio de sesión
  return (
    <div className="kernel-login">

      {/* Panel de marca (solo en pantallas grandes) */}
      <aside className="kernel-login-marca">
        <div className="kernel-login-logo" aria-hidden="true">
          K
        </div>

        <div>
          <p className="kernel-login-nombre">Kernel</p>
          <p className="kernel-login-lema">
            Sistema Integral de Gestión de Soporte Técnico
          </p>
        </div>
      </aside>

      {/* Formulario */}
      <main className="kernel-login-panel">
        <div className="kernel-login-caja">

          <div className="kernel-login-marca-movil">
            <div className="kernel-logo" aria-hidden="true">
              K
            </div>
            <span>Kernel</span>
          </div>

          <h1 className="kernel-login-titulo">
            Iniciar sesión
          </h1>

          <p className="text-secondary mb-4">
            Ingresa con tu correo y tu contraseña.
          </p>

          {/* Mensajes de error */}
          {error && (
            <div
              className="alert alert-danger"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={manejarLogin}>

            <div className="mb-3">
              <label
                htmlFor="email"
                className="form-label"
              >
                Correo electrónico
              </label>

              <input
                id="email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                autoComplete="username"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="form-label"
              >
                Contraseña
              </label>

              <input
                id="password"
                type="password"
                className="form-control"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2"
              disabled={cargando}
            >
              {cargando
                ? "Validando..."
                : "Iniciar sesión"}
            </button>

          </form>

          {/* Verificación del backend */}
          <EstadoBackend />

          <p className="text-secondary small mt-4 mb-0">
            Acceso autorizado a Kernel
          </p>

        </div>
      </main>
    </div>
  );
}
