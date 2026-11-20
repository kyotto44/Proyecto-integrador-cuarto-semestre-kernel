import Icono from "./Icono";
import { useEffect, useState } from "react";

export default function ToastBienvenida({ nombre, onCerrar }) {
  const [visible, setVisible] = useState(false);

  // Tres tiempos: aparece a los 50 ms (para que se vea la animación de entrada),
  // empieza a ocultarse a los 3,8 s y se retira a los 4,3 s, cuando ya terminó
  // de desvanecerse. Los temporizadores se limpian si el aviso se cierra antes.
  useEffect(() => {
    const inicio = setTimeout(() => setVisible(true), 50);
    const cierre = setTimeout(() => setVisible(false), 3800);
    const finalizar = setTimeout(() => onCerrar(), 4300);

    return () => {
      clearTimeout(inicio);
      clearTimeout(cierre);
      clearTimeout(finalizar);
    };
  }, [onCerrar]);

  return (
    <div
      className={`kernel-toast ${visible ? "visible" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="d-flex align-items-start gap-3">
        <div className="kernel-toast-icon">
          <Icono nombre="check" tamano={20} grosor={2.25} />
        </div>

        <div className="flex-grow-1">
          <div className="fw-bold fs-6">
            ¡Bienvenido/a, {nombre}!
          </div>
          <div className="text-secondary small mt-1">
            Has iniciado sesión correctamente en Kernel.
          </div>
        </div>

        <button
          type="button"
          className="btn-close"
          aria-label="Cerrar notificación"
          onClick={onCerrar}
        />
      </div>

      <div className="kernel-toast-progress" />
    </div>
  );
}
