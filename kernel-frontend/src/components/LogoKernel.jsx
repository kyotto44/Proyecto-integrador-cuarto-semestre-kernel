import { useId } from "react";

// Logo de Kernel: una K cuyos trazos nacen de un núcleo central.
// Toma el color del texto (currentColor), así sirve en fondo claro y oscuro.
export default function LogoKernel({ alto = 32, className = "", titulo }) {
  const corte = useId();

  return (
    <svg
      className={`kernel-logo-marca ${className}`.trim()}
      height={alto}
      width={Math.round(alto * 0.704)}
      viewBox="343 131 703 999"
      fill="currentColor"
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : "true"}
      focusable="false"
    >
      <defs>
        <mask id={corte}>
          <rect x="0" y="0" width="1254" height="1254" fill="#fff" />
          <circle cx="445" cy="642" r="140" fill="#000" />
        </mask>
      </defs>

      <g mask={`url(#${corte})`}>
        <rect x="343" y="131" width="192" height="999" rx="96" />
        <path
          d="M961 261.5 L581 641.5 L961 1021.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="169"
          strokeLinecap="round"
          strokeLinejoin="miter"
        />
      </g>

      <circle cx="445" cy="642" r="102" />
    </svg>
  );
}
