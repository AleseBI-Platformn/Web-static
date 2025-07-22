import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Menu } from '@/types/auth';
import { BarChart3, Users, DollarSign, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const handleMenuClick = (menu: Menu) => {
    console.log('Menu clicked:', menu);
    // Here you can handle menu navigation or actions
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={handleMenuClick} />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="px-4 py-6 sm:px-0">
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
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Analytics Cards */}
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
        <div className="px-4 py-6 sm:px-0">
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
                <p className="mt-2 text-xs text-gray-400">
                  Conectado a la base de datos real: xqkefqsh_alesecorp_ventas
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
