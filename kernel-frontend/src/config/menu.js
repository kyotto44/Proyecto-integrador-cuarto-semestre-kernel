
export const MENU = [
  {
    titulo: "Panel de control",
    ruta: "/dashboard",
    icono: "panel",
    roles: ["superadmin", "admin", "tecnico", "usuario"],
  },
  {
    titulo: "Usuarios",
    ruta: "/usuarios",
    icono: "usuarios",
    roles: ["superadmin", "admin"],
  },
  {
    titulo: "Técnicos",
    ruta: "/tecnicos",
    icono: "tecnicos",
    roles: ["superadmin", "admin"],
  },
  {
    titulo: "Categorías",
    ruta: "/categorias",
    icono: "categorias",
    roles: ["superadmin", "admin"],
  },
  {
    titulo: "Equipos",
    ruta: "/equipos",
    icono: "equipos",
    roles: ["superadmin", "admin", "usuario"],
  },
  {
    titulo: "Tickets",
    ruta: "/tickets",
    icono: "tickets",
    roles: ["superadmin", "admin", "tecnico", "usuario"],
  },
  {
    titulo: "Seguimientos",
    ruta: "/seguimientos",
    icono: "seguimientos",
    roles: ["superadmin", "admin", "tecnico", "usuario"],
  },
];

export function menuPorRol(rol) {
  return MENU.filter((opcion) => opcion.roles.includes(rol));
}
