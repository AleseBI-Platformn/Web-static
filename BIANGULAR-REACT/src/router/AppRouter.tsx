import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext_new';
import { DynamicMenuView } from '../components/BiAleseMenus';
import LoginForm from '../components/LoginForm';
import Dashboard from '../pages/Dashboard';
import BiAleseMenuDemo from '../pages/BiAleseMenuDemo';
import { useAuth } from '../contexts/AuthContext_new';

/**
 * Componente protegido que requiere autenticación
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

/**
 * Componente de layout principal - Sin Header
 */
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Content directo sin header */}
      <main>{children}</main>
    </div>
  );
};

/**
 * Router principal de la aplicación
 */
const AppRouter: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Ruta de login */}
          <Route path="/login" element={<LoginForm />} />
          
          {/* Ruta raíz redirige a dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Rutas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Demo del sistema de menús */}
          <Route
            path="/demo"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <BiAleseMenuDemo />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Rutas dinámicas de menús (como BiAleseCorp) */}
          <Route
            path="/panel/:menuUrl"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DynamicMenuView />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Rutas dinámicas de submenús */}
          <Route
            path="/panel/:parentUrl/:submenuUrl"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DynamicMenuView />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Ruta catch-all para URLs no encontradas */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <div className="text-6xl text-gray-300 mb-4">🔍</div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">Página no encontrada</h2>
                      <p className="text-gray-600 mb-4">La URL solicitada no existe</p>
                      <a
                        href="/dashboard"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      >
                        Ir al Dashboard
                      </a>
                    </div>
                  </div>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default AppRouter;
