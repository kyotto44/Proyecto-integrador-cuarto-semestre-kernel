
import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import NavbarPrincipal from "../components/NavbarPrincipal";

export default function MainLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="kernel-app">
      <Sidebar
        abierto={menuAbierto}
        cerrar={() => setMenuAbierto(false)}
      />

      <div className="kernel-main">
        <NavbarPrincipal
          abrirMenu={() => setMenuAbierto(true)}
        />

        <main className="kernel-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
