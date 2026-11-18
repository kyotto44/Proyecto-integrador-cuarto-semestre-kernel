import { useEffect, useState } from "react";

import { useAuth } from "../hooks/useAuth";
import { historialEquipo } from "../services/equipos.service";

// Mismos nombres y colores de estado que la pantalla de Tickets
const ESTADOS = {
  abierto: ["Abierto", "text-bg-info"],
  asignado: ["Asignado", "text-bg-violeta"],
  en_proceso: ["En proceso", "text-bg-warning"],
  resuelto: ["Resuelto", "text-bg-success"],
  cerrado: ["Cerrado", "text-bg-secondary"],
  reabierto: ["Reabierto", "text-bg-danger"],
};

function fecha(valor) {
  return valor ? new Date(valor).toLocaleDateString("es-CO") : "—";
}

// Muestra todas las reparaciones (tickets) de un equipo.
export default function ModalHistorialEquipo({ equipo, onCerrar }) {
  const { token } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controlador = new AbortController();

    historialEquipo(token, equipo.id, controlador.signal)
      .then((datos) => setTickets(datos.tickets))
      .catch((err) => {
        if (!controlador.signal.aborted) {
          setError(err.message || "No se pudo consultar el historial.");
        }
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCargando(false);
      });

    return () => controlador.abort();
  }, [token, equipo.id]);

  return (
    <>
      <div
        className="modal d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-historial-equipo"
        style={{ zIndex: 1060 }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
          <div className="modal-content border-0 rounded-4 shadow">
            <div className="modal-header">
              <div>
                <h2 id="titulo-historial-equipo" className="modal-title h5 fw-bold">
                  Historial de reparaciones
                </h2>
                <p className="small text-secondary mb-0">
                  {equipo.marca} {equipo.modelo} · {equipo.serial}
                </p>
              </div>

              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar"
                onClick={onCerrar}
              />
            </div>

            <div className="modal-body p-4">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {cargando && (
                <div className="text-center py-4">Consultando historial...</div>
              )}

              {!cargando && !error && tickets.length === 0 && (
                <div className="text-center text-secondary py-4">
                  Este equipo todavía no tiene tickets.
                </div>
              )}

              {!cargando && tickets.length > 0 && (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Ticket</th>
                        <th>Categoría</th>
                        <th>Técnico</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => {
                        const [nombre, clase] =
                          ESTADOS[ticket.estado] || [ticket.estado, "text-bg-secondary"];

                        return (
                          <tr key={ticket.id}>
                            <td>
                              <div className="fw-semibold">
                                #{ticket.id} {ticket.titulo}
                              </div>
                              {ticket.solucion && (
                                <div className="small text-secondary">
                                  Solución: {ticket.solucion}
                                </div>
                              )}
                            </td>
                            <td>{ticket.categoria}</td>
                            <td>{ticket.tecnico || "Sin asignar"}</td>
                            <td>
                              <span className={`badge ${clase}`}>{nombre}</span>
                            </td>
                            <td className="small">{fecha(ticket.fecha_creacion)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onCerrar}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop show" style={{ zIndex: 1055 }} />
    </>
  );
}
