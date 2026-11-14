import { pool } from "../config/db.js";

// ==========================================
// Kernel - SERVICIO DE EQUIPOS
// ==========================================

// Columnas que devolvemos, con el nombre del dueño
const CAMPOS = `
  e.id, e.usuario_id, e.tipo, e.marca, e.modelo,
  e.serial, e.observaciones, e.activo, e.fecha_registro,
  u.nombre || ' ' || u.apellido AS propietario
`;

function errorHttp(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

function esAdministrativo(usuario) {
  return ["superadmin", "admin"].includes(usuario.rol);
}

// ==========================================
// 1. LISTAR
// Admin: todos (o los de un cliente). Cliente: solo los suyos.
// ==========================================
export async function listarEquipos(usuario, usuarioIdFiltro) {
  const propietario = esAdministrativo(usuario)
    ? usuarioIdFiltro ?? null
    : usuario.id;

  const { rows } = await pool.query(
    `SELECT ${CAMPOS}
     FROM public.equipos e
     JOIN public.usuarios u ON u.id = e.usuario_id
     WHERE ($1::bigint IS NULL OR e.usuario_id = $1)
     ORDER BY e.id DESC`,
    [propietario]
  );

  return rows;
}

// ==========================================
// 2. OBTENER UNO (con control de acceso)
// Lo ve: el admin, el dueño o un técnico con un ticket de ese equipo.
// Si no tiene permiso devuelve null (404), así no revela que existe.
// ==========================================
export async function obtenerEquipo(id, usuario) {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS}
     FROM public.equipos e
     JOIN public.usuarios u ON u.id = e.usuario_id
     WHERE e.id = $1
       AND (
         $2::boolean = TRUE
         OR e.usuario_id = $3
         OR EXISTS (
           SELECT 1
           FROM public.tickets t
           JOIN public.tecnicos te ON te.id = t.tecnico_id
           WHERE t.equipo_id = e.id
             AND te.usuario_id = $3
         )
       )`,
    [id, esAdministrativo(usuario), usuario.id]
  );

  return rows[0] ?? null;
}

// ==========================================
// 3. HISTORIAL DE REPARACIONES
// ==========================================
export async function historialEquipo(id, usuario) {
  const equipo = await obtenerEquipo(id, usuario);

  if (!equipo) {
    return null;
  }

  const { rows } = await pool.query(
    `SELECT
       t.id, t.titulo, t.estado, t.prioridad, t.solucion,
       t.fecha_creacion, t.fecha_cierre,
       c.nombre AS categoria,
       tu.nombre || ' ' || tu.apellido AS tecnico
     FROM public.tickets t
     JOIN public.categorias c ON c.id = t.categoria_id
     LEFT JOIN public.tecnicos te ON te.id = t.tecnico_id
     LEFT JOIN public.usuarios tu ON tu.id = te.usuario_id
     WHERE t.equipo_id = $1
     ORDER BY t.fecha_creacion DESC`,
    [id]
  );

  return { equipo, tickets: rows };
}

// ==========================================
// 4. CREAR
// El cliente lo registra a su nombre.
// El admin indica el cliente dueño con usuario_id.
// ==========================================
export async function crearEquipo(datos, usuario) {
  const propietarioId = esAdministrativo(usuario)
    ? datos.usuario_id
    : usuario.id;

  if (!propietarioId) {
    throw errorHttp(
      "Debes indicar el cliente dueño del equipo (usuario_id)",
      400
    );
  }

  // Solo se inserta si el dueño es un cliente activo
  const { rows } = await pool.query(
    `INSERT INTO public.equipos
       (usuario_id, tipo, marca, modelo, serial, observaciones)
     SELECT u.id, $2, $3, $4, $5, $6
     FROM public.usuarios u
     JOIN public.roles r ON r.id = u.rol_id
     WHERE u.id = $1
       AND u.activo = TRUE
       AND r.nombre = 'usuario'
     RETURNING id`,
    [
      propietarioId,
      datos.tipo,
      datos.marca,
      datos.modelo,
      datos.serial,
      datos.observaciones ?? null,
    ]
  );

  if (!rows.length) {
    throw errorHttp("El dueño del equipo debe ser un cliente activo", 409);
  }

  return obtenerEquipo(rows[0].id, usuario);
}

// ==========================================
// 5. ACTUALIZAR (el dueño no se cambia)
// ==========================================
export async function actualizarEquipo(id, datos, usuario) {
  const { rows } = await pool.query(
    `UPDATE public.equipos
     SET tipo = $1,
         marca = $2,
         modelo = $3,
         serial = $4,
         observaciones = $5
     WHERE id = $6
       AND ($7::boolean = TRUE OR usuario_id = $8)
     RETURNING id`,
    [
      datos.tipo,
      datos.marca,
      datos.modelo,
      datos.serial,
      datos.observaciones ?? null,
      id,
      esAdministrativo(usuario),
      usuario.id,
    ]
  );

  if (!rows.length) {
    return null;
  }

  return obtenerEquipo(id, usuario);
}

// ==========================================
// 6. ACTIVAR / DESACTIVAR (solo admin)
// ==========================================
export async function cambiarEstadoEquipo(id, activo, usuario) {
  const { rows } = await pool.query(
    `UPDATE public.equipos
     SET activo = $1
     WHERE id = $2
     RETURNING id`,
    [activo, id]
  );

  if (!rows.length) {
    return null;
  }

  return obtenerEquipo(id, usuario);
}