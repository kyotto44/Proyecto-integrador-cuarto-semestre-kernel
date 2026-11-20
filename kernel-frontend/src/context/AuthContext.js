import { createContext } from "react";

// El contexto está en un archivo aparte del Provider porque la recarga en
// caliente de Vite (Fast Refresh) solo funciona si un .jsx exporta componentes.
export const AuthContext = createContext(null);