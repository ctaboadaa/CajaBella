import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BottomNav } from './components/BottomNav';
import { Login } from './pages/Login';
import { RegistrarServicio } from './pages/RegistrarServicio';
import { Resumen } from './pages/Resumen';
import { Ajustes } from './pages/Ajustes';

function AppAutenticada() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex-1">
        <Routes>
          <Route path="/registrar" element={<RegistrarServicio />} />
          <Route path="/resumen" element={<Resumen />} />
          <Route path="/ajustes" element={<Ajustes />} />
          <Route path="*" element={<Navigate to="/registrar" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}

function Contenido() {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <div className="min-h-dvh bg-bg" />;
  }

  return usuario ? <AppAutenticada /> : <Login />;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <HashRouter>
          <Contenido />
        </HashRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
