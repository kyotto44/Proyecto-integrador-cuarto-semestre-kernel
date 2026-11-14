import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../hooks/useAuth";
import ModalEquipo from "../components/ModalEquipo";
import ModalHistorialEquipo from "../components/ModalHistorialEquipo";

import {
  listarEquipos,
  crearEquipo,
  actualizarEquipo,
  cambiarEstadoEquipo,
  TIPOS_EQUIPO,
} from "../services/equipos.service";
import { listarUsuarios } from "../services/usuarios.service";

// "portatil" -> "Portátil"
function nombreTipo(tipo) {
  return TIPOS_EQUIPO.find(([valor]) => valor === tipo)?.[1] || tipo;
}

export default function Equipos() {
  const { token, usuario } = useAuth();
  const esAdmin = ["superadmin", "admin"].includes(usuario?.rol);

  const [equipos, setEquipos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [equipoEditar, setEquipoEditar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState("");
  const [procesandoId, setProcesandoId] = useState(null);
  const [equipoHistorial, setEquipoHistorial] = useState(null);
  const [recarga, setRecarga] = useState(0);

  const actualizar = useCallback(() => {
    setCargando(true);
    setRecarga((anterior) => anterior + 1);
  }, []);

  // ============================================
  // 1. CONSULTAR EQUIPOS (y clientes si es admin)
  // ============================================

  useEffect(() => {
    if (!token) return;
    const controlador = new AbortController();

    async function cargar() {
      try {
        const [datosEquipos, datosUsuarios] = await Promise.all([
          listarEquipos(token, controlador.signal),
          esAdmin ? listarUsuarios(token, controlador.signal) : Promise.resolve([]),
        ]);

        if (controlador.signal.aborted) return;

        setEquipos(datosEquipos);
        setClientes(
          datosUsuarios.filter((u) => u.rol === "usuario" && u.activo)
        );
        setError("");
      } catch (err) {
        if (!controlador.signal.aborted) {
          setError(err.message || "No se pudieron consultar los equipos.");
        }
      } finally {
        if (!controlador.signal.aborted) setCargando(false);
      }
    }

    cargar();
    return () => controlador.abort();
  }, [token, recarga, esAdmin]);

  // Ocultar el mensaje de éxito a los 4 segundos
  useEffect(() => {
    if (!mensaje) return;
    const temporizador = setTimeout(() => setMensaje(""), 4000);
    return () => clearTimeout(temporizador);
  }, [mensaje]);

  // ============================================
  // 2. BUSCAR
  // ============================================

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return equipos.filter((equipo) =>
      [equipo.marca, equipo.modelo, equipo.serial, equipo.propietario]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(texto)
    );
  }, [equipos, busqueda]);

  const activos = equipos.filter((equipo) => equipo.activo).length;

  // ============================================
  // 3. REGISTRAR O EDITAR
  // ============================================

  function abrirModal(equipo = null) {
    setEquipoEditar(equipo);
    setErrorModal("");
    setMensaje("");
    setModalAbierto(true);
  }

  async function guardar(datos) {
    if (guardando) return;
    setGuardando(true);
    setErrorModal("");

    try {
      if (equipoEditar) {
        await actualizarEquipo(token, equipoEditar.id, datos);
        setMensaje("Equipo actualizado correctamente.");
      } else {
        await crearEquipo(token, datos);
        setMensaje("Equipo registrado correctamente.");
      }
      setModalAbierto(false);
      setEquipoEditar(null);
      actualizar();
    } catch (err) {
      setErrorModal(err.message || "No fue posible guardar el equipo.");
    } finally {
      setGuardando(false);
    }
  }

  // ============================================
  // 4. ACTIVAR O DESACTIVAR (solo admin)
  // ============================================

  async function alternarEstado(equipo) {
    if (procesandoId !== null) return;
    const nuevoEstado = !equipo.activo;

    const confirmado = window.confirm(
      `¿Deseas ${nuevoEstado ? "activar" : "desactivar"} el equipo ` +
        `${equipo.marca} ${equipo.modelo} (${equipo.serial})?`
    );
    if (!confirmado) return;

    setProcesandoId(equipo.id);
    setError("");

    try {
      await cambiarEstadoEquipo(token, equipo.id, nuevoEstado);
      setMensaje(nuevoEstado ? "Equipo activado." : "Equipo desactivado.");
      actualizar();
    } catch (err) {
      setError(err.message || "No se pudo cambiar el estado.");
    } finally {
      setProcesandoId(null);
    }
  }

  // ============================================
  // 5. INTERFAZ
  // ============================================

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <div className="small text-secondary mb-1">Inicio / Equipos</div>
          <h1 className="h3 fw-bold mb-1">
            {esAdmin ? "Equipos de los clientes" : "Mis equipos"}
          </h1>
          <p className="text-secondary mb-0">
            Computadores registrados para mantenimiento y su historial de reparaciones.
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={actualizar}
            disabled={cargando}
          >
            Actualizar listado
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => abrirModal()}
            disabled={cargando}
          >
            + Registrar equipo
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="alert alert-success alert-dismissible fade show" role="status">
          {mensaje}
          <button
            type="button"
            className="btn-close"
            aria-label="Cerrar mensaje"
            onClick={() => setMensaje("")}
          />
        </div>
      )}

      {/* INDICADORES */}
      <div className="row g-3 mb-4">
        {[
          ["Equipos registrados", equipos.length],
          ["Equipos activos", activos],
          ["Equipos inactivos", equipos.length - activos],
        ].map(([titulo, valor]) => (
          <div className="col-12 col-md-4" key={titulo}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="small text-secondary">{titulo}</div>
                <div className="h3 fw-bold mb-0 mt-2">{valor}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* LISTADO */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="buscar-equipo" className="form-label">
              Buscar equipo
            </label>
            <input
              id="buscar-equipo"
              className="form-control"
              placeholder={esAdmin ? "Marca, modelo, serial o cliente" : "Marca, modelo o serial"}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Equipo</th>
                  <th>Tipo</th>
                  <th>Serial</th>
                  {esAdmin && <th>Cliente</th>}
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {cargando && (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      Consultando equipos...
                    </td>
                  </tr>
                )}

                {!cargando &&
                  filtrados.map((equipo) => (
                    <tr key={equipo.id}>
                      <td>
                        <div className="fw-semibold">
                          {equipo.marca} {equipo.modelo}
                        </div>
                        {equipo.observaciones && (
                          <div className="small text-secondary">
                            {equipo.observaciones}
                          </div>
                        )}
                      </td>
                      <td>{nombreTipo(equipo.tipo)}</td>
                      <td className="font-monospace small">{equipo.serial}</td>
                      {esAdmin && <td>{equipo.propietario}</td>}
                      <td>
                        <span
                          className={`badge ${
                            equipo.activo ? "text-bg-success" : "text-bg-secondary"
                          }`}
                        >
                          {equipo.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2 flex-wrap">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setEquipoHistorial(equipo)}
                          >
                            Historial
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => abrirModal(equipo)}
                          >
                            Editar
                          </button>

                          {esAdmin && (
                            <button
                              type="button"
                              className={`btn btn-sm ${
                                equipo.activo ? "btn-outline-warning" : "btn-outline-success"
                              }`}
                              onClick={() => alternarEstado(equipo)}
                              disabled={procesandoId !== null}
                            >
                              {procesandoId === equipo.id
                                ? "Procesando..."
                                : equipo.activo
                                  ? "Desactivar"
                                  : "Activar"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                {!cargando && filtrados.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-secondary py-4">
                      {equipos.length === 0
                        ? "Todavía no hay equipos registrados."
                        : "No se encontraron equipos."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="small text-secondary">
            Mostrando {filtrados.length} de {equipos.length} equipos.
          </div>
        </div>
      </div>

      {modalAbierto && (
        <ModalEquipo
          key={equipoEditar?.id || "nuevo"}
          equipo={equipoEditar}
          clientes={esAdmin ? clientes : []}
          guardando={guardando}
          error={errorModal}
          onGuardar={guardar}
          onCerrar={() => {
            if (!guardando) {
              setModalAbierto(false);
              setEquipoEditar(null);
            }
          }}
        />
      )}

      {equipoHistorial && (
        <ModalHistorialEquipo
          equipo={equipoHistorial}
          onCerrar={() => setEquipoHistorial(null)}
        />
      )}
    </div>
  );
}
