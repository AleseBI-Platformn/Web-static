import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext_new';
import Navbar from '../components/Navbar';
import { MenuItem } from '../services/aleseCorpApi_php_only';
import { BarChart3, Users, DollarSign, TrendingUp, ArrowLeft, RefreshCw } from 'lucide-react';

// Estilos CSS para animaciones futuristas optimizadas
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeInUp {
    from { 
      opacity: 0; 
      transform: translateY(20px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes slideInRight {
    from { 
      opacity: 0; 
      transform: translateX(-20px); 
    }
    to { 
      opacity: 1; 
      transform: translateX(0); 
    }
  }
  
  @keyframes slideInLeft {
    from { 
      opacity: 0; 
      transform: translateX(20px); 
    }
    to { 
      opacity: 1; 
      transform: translateX(0); 
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  
  .animate-fadeInUp {
    animation: fadeInUp 0.4s ease-out;
  }
  
  .animate-slideInRight {
    animation: slideInRight 0.3s ease-out;
  }
  
  .animate-slideInLeft {
    animation: slideInLeft 0.3s ease-out;
  }
`;

// Insertar estilos en el documento
if (typeof document !== 'undefined' && !document.querySelector('#dashboard-animations')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'dashboard-animations';
  styleSheet.type = 'text/css';
  styleSheet.innerHTML = animationStyles;
  document.head.appendChild(styleSheet);
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<MenuItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefreshData = () => {
    setIsRefreshing(true);
    // Actualización más rápida
    setTimeout(() => {
      setIsRefreshing(false);
      // Recargar el iframe
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.src = iframe.src;
      }
    }, 800); // Reducido de 1500ms a 800ms
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar onMenuClick={handleMenuClick} />
      
      <main className="flex-1 overflow-hidden">
        {currentView ? (
          // Vista de iframe para reportes - CON ANIMACIONES Y DISEÑO FUTURISTA
          <div className="bg-gradient-to-br from-gray-50 to-white min-h-screen animate-fadeIn">
            {/* Header del reporte - DISEÑO FUTURISTA */}
            <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-4 py-4 sm:px-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleBackToDashboard}
                    className="group inline-flex items-center px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 border border-gray-300/50 shadow-sm text-xs font-medium rounded-lg text-gray-700 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 mr-1.5 group-hover:-translate-x-1 transition-transform duration-200" />
                    Volver al Dashboard
                  </button>
                  <div className="animate-slideInRight">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      {currentView.menu}
                    </h1>
                    <p className="text-xs text-gray-500 font-medium">ID: {currentView.idmenu}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 animate-slideInLeft">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200">
                      En línea
                    </span>
                  </div>
                  <button
                    onClick={handleRefreshData}
                    disabled={isRefreshing}
                    className="group inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 shadow-md text-xs font-medium rounded-lg text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 mr-1.5 transition-transform duration-200 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                    {isRefreshing ? 'Actualizando...' : 'Actualizar datos'}
                  </button>
                </div>
              </div>
            </div>

            {/* Iframe del reporte - AJUSTADO PARA PANTALLA COMPLETA */}
            <div className="relative animate-fadeInUp" style={{ height: 'calc(100vh - 160px)' }}>
              {currentView.vista ? (
                <iframe
                  src={currentView.vista}
                  title={currentView.menu}
                  className="w-full h-full border-0 rounded-lg shadow-2xl"
                  style={{ 
                    height: '100%',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                  }}
                  frameBorder="0"
                  allowFullScreen
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                  <div className="text-center animate-bounce">
                    <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Vista no disponible
                    </h3>
                    <p className="text-gray-500">
                      Este menú no tiene una vista configurada.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Dashboard principal
          <div className="max-w-7xl mx-auto h-full overflow-y-auto">
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
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
