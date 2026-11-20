import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error("Faltan las variables administrativas de Supabase");
}

// Cliente administrativo con la llave service role, que tiene acceso total.
// Por eso vive solo en el backend y se usa únicamente para crear cuentas y
// cambiar contraseñas en Supabase Auth.
export const supabaseAdmin = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
