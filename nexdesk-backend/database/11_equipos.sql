-- ==========================================
-- Kernel - REGISTRO DE EQUIPOS
-- Cada cliente registra sus computadores y
-- cada ticket puede asociarse a uno de ellos.
-- ==========================================

-- 1. TABLA DE EQUIPOS
CREATE TABLE IF NOT EXISTS public.equipos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id BIGINT NOT NULL
    REFERENCES public.usuarios(id) ON DELETE RESTRICT,
  tipo VARCHAR(20) NOT NULL,
  marca VARCHAR(60) NOT NULL,
  modelo VARCHAR(80) NOT NULL,
  serial VARCHAR(80) NOT NULL UNIQUE,
  observaciones VARCHAR(250),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_equipo_tipo CHECK (
    tipo IN ('portatil','escritorio','todo_en_uno','servidor','otro')
  ),
  CONSTRAINT chk_equipo_textos CHECK (
    LENGTH(TRIM(marca)) > 0
    AND LENGTH(TRIM(modelo)) > 0
    AND LENGTH(TRIM(serial)) > 0
  )
);

CREATE INDEX IF NOT EXISTS idx_equipos_usuario
  ON public.equipos(usuario_id);

-- 2. RELACIÓN TICKET -> EQUIPO
-- Es opcional: los tickets que ya existen no tienen equipo.
ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS equipo_id BIGINT
    REFERENCES public.equipos(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_tickets_equipo
  ON public.tickets(equipo_id);

-- 3. SEGURIDAD (igual que las demás tablas)
ALTER TABLE public.equipos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.equipos FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.equipos TO nexdesk_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO nexdesk_app;

-- 4. EQUIPOS DE EJEMPLO PARA LOS CLIENTES DE PRUEBA
INSERT INTO public.equipos (usuario_id, tipo, marca, modelo, serial)
SELECT id, 'portatil', 'Lenovo', 'ThinkPad E14', 'LNV-E14-0001'
FROM public.usuarios WHERE email = 'ana@example.com'
ON CONFLICT (serial) DO NOTHING;

INSERT INTO public.equipos (usuario_id, tipo, marca, modelo, serial)
SELECT id, 'escritorio', 'HP', 'ProDesk 400 G7', 'HP-PD400-0002'
FROM public.usuarios WHERE email = 'maria@example.com'
ON CONFLICT (serial) DO NOTHING;

-- 5. VERIFICACIÓN
SELECT e.id, u.email, e.tipo, e.marca, e.modelo, e.serial
FROM public.equipos e
JOIN public.usuarios u ON u.id = e.usuario_id
ORDER BY e.id;