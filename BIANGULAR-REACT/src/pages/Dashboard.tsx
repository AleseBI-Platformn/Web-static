import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext_new';
import Navbar from '../components/Navbar';
import { MenuItem } from '../services/aleseCorpApi_php_only';
import { BarChart3, Users, DollarSign, TrendingUp, ArrowLeft, ExternalLink } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<MenuItem | null>(null);

  const handleMenuClick = (menu: MenuItem) => {
    console.log('Menu clicked:', menu);
    
    // Solo navegar si el menú tiene una vista (URL de PowerBI)
    if (menu.vista && menu.vista.trim() !== '') {
      setCurrentView(menu);
    } else {
      console.log('Menú padre sin vista - mantener dropdown abierto');
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={handleMenuClick} />
      
      <main className="max-w-7xl mx-auto">
        {currentView ? (
          // Vista de iframe para reportes
          <div className="bg-white shadow-lg">
            {/* Header del reporte */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleBackToDashboard}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al Dashboard
                  </button>
                  <div>
                    <h1 className="text-lg font-medium text-gray-900">{currentView.menu}</h1>
                    <p className="text-sm text-gray-500">ID: {currentView.idmenu}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    En línea
                  </span>
                  {currentView.vista && (
                    <a
                      href={currentView.vista}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir en nueva ventana
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Iframe del reporte */}
            <div className="relative">
              {currentView.vista ? (
                <iframe
                  src={currentView.vista}
                  title={currentView.menu}
                  className="w-full border-0"
                  style={{ 
                    height: currentView.alto ? `${currentView.alto}px` : '800px',
                    minHeight: '600px'
                  }}
                  frameBorder="0"
                  allowFullScreen
                />
              ) : (
                <div className="flex items-center justify-center h-96 bg-gray-50">
                  <div className="text-center">
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Vista no disponible
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Este menú no tiene una vista configurada.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Dashboard principal
          <>
            {/* Welcome Header */}
            <div className="px-4 py-6 sm:px-6 lg:px-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img 
                        src="/assets/img/alese-logo.png" 
                        alt="ALESE CORP" 
                        className="h-16 w-auto"
                      />
                    </div>
                    <div className="ml-5">
                      <h1 className="text-2xl font-bold text-gray-900">
                        Bienvenido, {user?.fullName || user?.UsuNom}
                      </h1>
                      <p className="text-sm text-gray-500">
                        Portal de Analytics - ALESE CORP
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Perfil: {user?.UsuPerfil}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="px-4 py-6 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Analytics
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            Dashboard Activo
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Usuarios Activos
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            Sistema Corporativo
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <DollarSign className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Reportes
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            En Tiempo Real
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Rendimiento
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            Optimizado
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="px-4 py-6 sm:px-6 lg:px-8">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Panel de Control
                  </h3>
                  <div className="text-center py-12">
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Analytics Dashboard
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Utiliza el menú de navegación para acceder a los diferentes módulos del sistema.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
