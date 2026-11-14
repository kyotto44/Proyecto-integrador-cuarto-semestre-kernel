
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { menuPorRol } from "../config/menu";

export default function Sidebar({ abierto, cerrar }) {
  const { usuario } = useAuth();
  const opciones = menuPorRol(usuario?.rol);

  return (
    <>
      {abierto && (
        <button
          type="button"
          className="kernel-overlay"
          onClick={cerrar}
          aria-label="Cerrar menú"
        />
      )}

      <aside
        className={`kernel-sidebar ${abierto ? "abierto" : ""}`}
        aria-label="Navegación principal"
      >
        <div className="kernel-sidebar-brand">
          <span className="kernel-brand-icon">K</span>
          <div>
            <strong>Kernel</strong>
            <small>Sistema de soporte</small>
          </div>
        </div>

        <div className="kernel-sidebar-label">
          MENÚ PRINCIPAL
        </div>

        <nav className="kernel-sidebar-nav">
          {opciones.map((opcion) => (
            <NavLink
              key={opcion.ruta}
              to={opcion.ruta}
              onClick={cerrar}
              className={({ isActive }) =>
                `kernel-nav-link ${isActive ? "activo" : ""}`
              }
            >
              <span className="kernel-nav-icon">
                {opcion.icono}
              </span>
              <span>{opcion.titulo}</span>
            </NavLink>
          ))}
        </nav>

        <div className="kernel-sidebar-footer">
          <span className="kernel-online-dot" />
          Sistema de soporte
          <small>Helpdesk Organizacional para empresas</small>
        </div>
      </aside>
    </>
  );
}
