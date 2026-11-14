import { useState } from "react";
import { TIPOS_EQUIPO } from "../services/equipos.service";

// Formulario para registrar o editar un equipo.
// Si llegan "clientes" (solo el admin), pide escoger el dueño.
export default function ModalEquipo({
  equipo,
  clientes = [],
  guardando,
  error,
  onGuardar,
  onCerrar,
}) {
  const editando = Boolean(equipo);
  const pedirCliente = !editando && clientes.length > 0;

  const [formulario, setFormulario] = useState(() => ({
    tipo: equipo?.tipo || "portatil",
    marca: equipo?.marca || "",
    modelo: equipo?.modelo || "",
    serial: equipo?.serial || "",
    observaciones: equipo?.observaciones || "",
    usuario_id: "",
  }));

  function cambiar(evento) {
    const { name, value } = evento.target;
    setFormulario((anterior) => ({ ...anterior, [name]: value }));
  }

  function enviar(evento) {
    evento.preventDefault();
    if (guardando) return;

    onGuardar({
      tipo: formulario.tipo,
      marca: formulario.marca.trim(),
      modelo: formulario.modelo.trim(),
      serial: formulario.serial.trim(),
      observaciones: formulario.observaciones.trim() || null,
      ...(pedirCliente ? { usuario_id: Number(formulario.usuario_id) } : {}),
    });
  }

  const incompleto =
    !formulario.marca.trim() ||
    !formulario.modelo.trim() ||
    !formulario.serial.trim() ||
    (pedirCliente && !formulario.usuario_id);

  return (
    <>
      <div
        className="modal d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-equipo"
        style={{ zIndex: 1060 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-4 shadow">
            <div className="modal-header">
              <div>
                <h2 id="titulo-modal-equipo" className="modal-title h5 fw-bold">
                  {editando ? "Editar equipo" : "Registrar equipo"}
                </h2>
                <p className="small text-secondary mb-0">
                  Computador que recibe mantenimiento
                </p>
              </div>

              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar"
                onClick={onCerrar}
                disabled={guardando}
              />
            </div>

            <form onSubmit={enviar}>
              <div className="modal-body p-4">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {pedirCliente && (
                  <div className="mb-3">
                    <label htmlFor="equipo-cliente" className="form-label">
                      Cliente dueño del equipo *
                    </label>
                    <select
                      id="equipo-cliente"
                      name="usuario_id"
                      className="form-select"
                      value={formulario.usuario_id}
                      onChange={cambiar}
                      required
                      disabled={guardando}
                    >
                      <option value="">Selecciona un cliente</option>
                      {clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nombre} {cliente.apellido} ({cliente.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="equipo-tipo" className="form-label">
                      Tipo *
                    </label>
                    <select
                      id="equipo-tipo"
                      name="tipo"
                      className="form-select"
                      value={formulario.tipo}
                      onChange={cambiar}
                      disabled={guardando}
                    >
                      {TIPOS_EQUIPO.map(([valor, texto]) => (
                        <option key={valor} value={valor}>
                          {texto}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="equipo-marca" className="form-label">
                      Marca *
                    </label>
                    <input
                      id="equipo-marca"
                      name="marca"
                      className="form-control"
                      value={formulario.marca}
                      onChange={cambiar}
                      maxLength={60}
                      required
                      disabled={guardando}
                      placeholder="Ej. Lenovo"
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="equipo-modelo" className="form-label">
                      Modelo *
                    </label>
                    <input
                      id="equipo-modelo"
                      name="modelo"
                      className="form-control"
                      value={formulario.modelo}
                      onChange={cambiar}
                      maxLength={80}
                      required
                      disabled={guardando}
                      placeholder="Ej. ThinkPad E14"
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="equipo-serial" className="form-label">
                      Serial *
                    </label>
                    <input
                      id="equipo-serial"
                      name="serial"
                      className="form-control"
                      value={formulario.serial}
                      onChange={cambiar}
                      maxLength={80}
                      required
                      disabled={guardando}
                      placeholder="Está en la etiqueta del equipo"
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="equipo-observaciones" className="form-label">
                      Observaciones
                    </label>
                    <textarea
                      id="equipo-observaciones"
                      name="observaciones"
                      className="form-control"
                      rows={3}
                      value={formulario.observaciones}
                      onChange={cambiar}
                      maxLength={250}
                      disabled={guardando}
                      placeholder="Ej. Tiene la pantalla rayada"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onCerrar}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={guardando || incompleto}
                >
                  {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Registrar equipo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="modal-backdrop show" style={{ zIndex: 1055 }} />
    </>
  );
}
