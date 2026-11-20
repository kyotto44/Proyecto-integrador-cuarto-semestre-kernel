import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
// El JS de Bootstrap hace funcionar los menús desplegables (data-bs-toggle).
import "bootstrap/dist/js/bootstrap.bundle.min.js";
// index.css va después de Bootstrap para que nuestros estilos (paleta verde,
// tarjetas, login) tengan prioridad sobre los suyos.
import "./index.css";

import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);