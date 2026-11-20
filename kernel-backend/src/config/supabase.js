
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    'Faltan SUPABASE_URL o SUPABASE_ANON_KEY'
  );
}

// Cliente con la llave pública (anon): sirve para iniciar sesión y validar
// tokens, pero no puede saltarse los permisos de la base de datos.
// No guarda ni renueva sesiones porque el servidor no las necesita: cada
// petición trae su propio token.
export const supabaseAuth = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});
