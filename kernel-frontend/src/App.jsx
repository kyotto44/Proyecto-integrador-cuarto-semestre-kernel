
import { AuthProvider } from "./context/AuthContext.jsx";
import AppRouter from "./routes/AppRouter";

// AuthProvider envuelve todas las rutas para que cualquier pantalla sepa quién
// inició sesión y con qué rol.
export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
