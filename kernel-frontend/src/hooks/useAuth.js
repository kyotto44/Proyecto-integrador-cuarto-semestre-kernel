import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.js";

export function useAuth() {
  const contexto = useContext(AuthContext);
  // Error claro si se usa fuera de AuthProvider, en vez de fallar más adelante
  // con "undefined".
  if (!contexto) throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  return contexto;
}
