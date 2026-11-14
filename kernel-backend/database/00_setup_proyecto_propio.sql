-- ==========================================
-- Kernel - MONTAJE COMPLETO EN UN PROYECTO SUPABASE NUEVO
-- Ejecutar una sola vez en SQL Editor.
-- Incluye: esquema (lab 22), semillas (lab 22),
-- seguridad lab 25 y usuarios de Supabase Auth vinculados por UUID.
-- Contraseña inicial de cada usuario semilla: <nombre en minúsculas>123456
-- (ej. sofia123456). Todos quedan con debe_cambiar_password = TRUE.
-- ==========================================

BEGIN;

-- 1. ROLES
CREATE TABLE public.roles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL UNIQUE,
  descripcion VARCHAR(200),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT chk_rol_nombre CHECK (nombre IN ('superadmin','admin','tecnico','usuario'))
);

-- 2. USUARIOS
CREATE TABLE public.usuarios (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE RESTRICT,
  rol_id BIGINT NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
  tipo_documento VARCHAR(10) NOT NULL,
  numero_documento VARCHAR(30) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_documento UNIQUE (tipo_documento, numero_documento),
  CONSTRAINT chk_tipo_documento CHECK (tipo_documento IN ('CC','TI','CE','PA','PPT','OTRO')),
  CONSTRAINT chk_documento CHECK (
    numero_documento = UPPER(TRIM(numero_documento))
    AND numero_documento ~ '^[A-Z0-9-]{4,30}$'
  ),
  CONSTRAINT chk_nombre CHECK (LENGTH(TRIM(nombre)) > 0),
  CONSTRAINT chk_apellido CHECK (LENGTH(TRIM(apellido)) > 0),
  CONSTRAINT chk_email CHECK (
    email = LOWER(TRIM(email))
    AND email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  )
);

-- 3. TECNICOS
CREATE TABLE public.tecnicos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id BIGINT NOT NULL UNIQUE REFERENCES public.usuarios(id) ON DELETE RESTRICT,
  especialidad VARCHAR(100) NOT NULL,
  disponible BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT chk_especialidad CHECK (LENGTH(TRIM(especialidad)) > 0)
);

-- 4. CATEGORIAS
CREATE TABLE public.categorias (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(250),
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT chk_categoria CHECK (LENGTH(TRIM(nombre)) > 0)
);

-- 5. TICKETS
CREATE TABLE public.tickets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT NOT NULL,
  prioridad VARCHAR(10) NOT NULL DEFAULT 'media',
  estado VARCHAR(20) NOT NULL DEFAULT 'abierto',
  usuario_id BIGINT NOT NULL REFERENCES public.usuarios(id) ON DELETE RESTRICT,
  tecnico_id BIGINT REFERENCES public.tecnicos(id) ON DELETE RESTRICT,
  categoria_id BIGINT NOT NULL REFERENCES public.categorias(id) ON DELETE RESTRICT,
  solucion TEXT,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_cierre TIMESTAMPTZ,
  CONSTRAINT chk_prioridad CHECK (prioridad IN ('baja','media','alta')),
  CONSTRAINT chk_estado CHECK (estado IN ('abierto','asignado','en_proceso','resuelto','cerrado','reabierto')),
  CONSTRAINT chk_titulo CHECK (LENGTH(TRIM(titulo)) > 0),
  CONSTRAINT chk_descripcion CHECK (LENGTH(TRIM(descripcion)) > 0),
  CONSTRAINT chk_solucion CHECK (
    estado NOT IN ('resuelto','cerrado')
    OR (solucion IS NOT NULL AND LENGTH(TRIM(solucion)) > 0)
  )
);

-- 6. SEGUIMIENTOS
CREATE TABLE public.seguimientos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id BIGINT NOT NULL REFERENCES public.tickets(id) ON DELETE RESTRICT,
  autor_usuario_id BIGINT NOT NULL REFERENCES public.usuarios(id) ON DELETE RESTRICT,
  observacion TEXT NOT NULL,
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_observacion CHECK (LENGTH(TRIM(observacion)) > 0)
);

-- INDICES
CREATE INDEX idx_usuarios_rol ON public.usuarios(rol_id);
CREATE INDEX idx_tickets_usuario ON public.tickets(usuario_id);
CREATE INDEX idx_tickets_tecnico ON public.tickets(tecnico_id);
CREATE INDEX idx_tickets_categoria ON public.tickets(categoria_id);
CREATE INDEX idx_tickets_estado ON public.tickets(estado);
CREATE INDEX idx_seguimientos_ticket ON public.seguimientos(ticket_id);

-- TRIGGERS
CREATE FUNCTION public.validar_perfil_tecnico()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE
  nombre_rol TEXT;
BEGIN
  SELECT r.nombre INTO nombre_rol
  FROM public.usuarios u
  JOIN public.roles r ON r.id = u.rol_id
  WHERE u.id = NEW.usuario_id
  FOR UPDATE OF u;
  IF nombre_rol IS DISTINCT FROM 'tecnico' THEN
    RAISE EXCEPTION 'El usuario debe tener rol tecnico';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_perfil_tecnico
BEFORE INSERT OR UPDATE OF usuario_id ON public.tecnicos
FOR EACH ROW EXECUTE FUNCTION public.validar_perfil_tecnico();

CREATE FUNCTION public.proteger_rol_tecnico()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE
  nombre_nuevo TEXT;
BEGIN
  IF NEW.rol_id IS DISTINCT FROM OLD.rol_id THEN
    SELECT nombre INTO nombre_nuevo FROM public.roles WHERE id = NEW.rol_id;
    IF nombre_nuevo IS DISTINCT FROM 'tecnico'
       AND EXISTS (SELECT 1 FROM public.tecnicos WHERE usuario_id = OLD.id) THEN
      RAISE EXCEPTION 'Elimine primero el perfil tecnico';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_proteger_rol_tecnico
BEFORE UPDATE OF rol_id ON public.usuarios
FOR EACH ROW EXECUTE FUNCTION public.proteger_rol_tecnico();

CREATE FUNCTION public.proteger_nombre_rol()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF NEW.nombre IS DISTINCT FROM OLD.nombre THEN
    RAISE EXCEPTION 'No se permite renombrar roles del sistema';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_proteger_nombre_rol
BEFORE UPDATE OF nombre ON public.roles
FOR EACH ROW EXECUTE FUNCTION public.proteger_nombre_rol();

CREATE FUNCTION public.actualizar_fecha_ticket()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_actualizar_fecha_ticket
BEFORE UPDATE ON public.tickets
FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_ticket();

-- SEGURIDAD INICIAL
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tecnicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seguimientos ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE
  public.roles, public.usuarios, public.tecnicos,
  public.categorias, public.tickets, public.seguimientos
FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

-- SEMILLAS
INSERT INTO public.roles(nombre, descripcion) VALUES
('superadmin','Administracion global'),
('admin','Administracion de soporte'),
('tecnico','Atencion de tickets'),
('usuario','Solicitante de soporte');

INSERT INTO public.usuarios (tipo_documento, numero_documento, nombre, apellido, email, rol_id)
SELECT v.tipo_documento, v.numero_documento, v.nombre, v.apellido, v.email, r.id
FROM (VALUES
  ('CC','TEST-1001','Sofia','Mendez','sofia@example.com','superadmin'),
  ('CC','TEST-1002','Pedro','Ruiz','pedro@example.com','admin'),
  ('CC','TEST-1003','Laura','Gomez','laura@example.com','tecnico'),
  ('CC','TEST-1004','Carlos','Diaz','carlos@example.com','tecnico'),
  ('CC','TEST-1005','Ana','Torres','ana@example.com','usuario'),
  ('CC','TEST-1006','Maria','Lopez','maria@example.com','usuario')
) AS v(tipo_documento, numero_documento, nombre, apellido, email, rol)
JOIN public.roles r ON r.nombre = v.rol;

INSERT INTO public.tecnicos (usuario_id, especialidad, disponible)
SELECT id, 'Redes', TRUE FROM public.usuarios WHERE email = 'laura@example.com';
INSERT INTO public.tecnicos (usuario_id, especialidad, disponible)
SELECT id, 'Software', TRUE FROM public.usuarios WHERE email = 'carlos@example.com';

INSERT INTO public.categorias(nombre, descripcion) VALUES
('Software','Aplicaciones y sistemas'),
('Hardware','Equipos y dispositivos'),
('Redes','Conectividad'),
('Accesos','Ingreso y permisos');

INSERT INTO public.tickets (titulo, descripcion, prioridad, usuario_id, categoria_id)
SELECT 'Equipo sin conexion', 'El computador no tiene acceso a Internet', 'alta', u.id, c.id
FROM public.usuarios u CROSS JOIN public.categorias c
WHERE u.email = 'ana@example.com' AND c.nombre = 'Redes';

INSERT INTO public.tickets (titulo, descripcion, prioridad, estado, usuario_id, tecnico_id, categoria_id)
SELECT 'No puedo ingresar al sistema', 'La plataforma rechaza el acceso', 'alta', 'asignado', s.id, t.id, c.id
FROM public.usuarios s
CROSS JOIN public.tecnicos t
JOIN public.usuarios tec ON tec.id = t.usuario_id
CROSS JOIN public.categorias c
WHERE s.email = 'maria@example.com' AND tec.email = 'laura@example.com' AND c.nombre = 'Accesos';

INSERT INTO public.seguimientos (ticket_id, autor_usuario_id, observacion)
SELECT tk.id, u.id, 'Solicitud recibida para diagnostico'
FROM public.tickets tk CROSS JOIN public.usuarios u
WHERE tk.titulo = 'No puedo ingresar al sistema' AND u.email = 'laura@example.com';

-- LAB 25: CONTROL DE PRIMER ACCESO
ALTER TABLE public.usuarios
ADD COLUMN IF NOT EXISTS debe_cambiar_password BOOLEAN NOT NULL DEFAULT TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS ux_usuarios_auth_user_id
ON public.usuarios(auth_user_id)
WHERE auth_user_id IS NOT NULL;

-- USUARIOS EN SUPABASE AUTH (correo autoconfirmado) + VINCULACION UUID
WITH datos(email, pw) AS (
  SELECT u.email, lower(u.nombre) || '123456'
  FROM public.usuarios u
  WHERE u.auth_user_id IS NULL
), nuevos AS (
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new,
    email_change_token_current, phone_change, phone_change_token, reauthentication_token
  )
  SELECT '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
         d.email, extensions.crypt(d.pw, extensions.gen_salt('bf')), now(),
         '{"provider":"email","providers":["email"]}'::jsonb, '{"email_verified":true}'::jsonb, now(), now(),
         '', '', '', '', '', '', '', ''
  FROM datos d
  RETURNING id, email
), ident AS (
  INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  SELECT n.id::text, n.id,
         jsonb_build_object('sub', n.id::text, 'email', n.email, 'email_verified', true, 'phone_verified', false),
         'email', now(), now(), now()
  FROM nuevos n
  RETURNING user_id
)
UPDATE public.usuarios u
SET auth_user_id = n.id
FROM nuevos n
WHERE u.email = n.email AND u.auth_user_id IS NULL;

COMMIT;

-- VERIFICACION
SELECT u.id, u.nombre, u.email, u.auth_user_id, u.activo, u.debe_cambiar_password, r.nombre AS rol
FROM public.usuarios u
JOIN public.roles r ON r.id = u.rol_id
ORDER BY u.id;
