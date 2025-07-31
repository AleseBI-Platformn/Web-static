import React from 'react';
import { DynamicMenuView, MenuNavigation } from '../components/BiAleseMenus';
import { useCurrentMenu } from '../hooks/useBiAleseMenus';

/**
 * Página que demuestra el sistema de menús como BiAleseCorp
 */
const BiAleseMenuDemo: React.FC = () => {
  const { currentMenu } = useCurrentMenu();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 Sistema de Menús BiAleseCorp
          </h1>
          <p className="text-gray-600 text-lg">
            Sistema implementado con la <strong>misma lógica exacta</strong> que BiAleseCorp
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar con navegación */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                📋 Navegación
              </h2>
              <MenuNavigation />
            </div>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            <DynamicMenuView />
            
            {/* Información del menú actual */}
            {currentMenu && (
              <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  📊 Información del Menú
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID</label>
                    <p className="mt-1 text-sm text-gray-900">{currentMenu.idmenu}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <p className="mt-1 text-sm text-gray-900">{currentMenu.menu}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL</label>
                    <p className="mt-1 text-sm text-gray-900">{currentMenu.url || 'No definida'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        currentMenu.estado === '1' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {currentMenu.estado === '1' ? 'Activo' : 'Inactivo'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vista PowerBI</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {currentMenu.vista ? '✅ Configurada' : '❌ No configurada'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dimensiones BD</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {currentMenu.ancho && currentMenu.alto 
                        ? `${currentMenu.ancho} x ${currentMenu.alto}` 
                        : 'No configuradas'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instrucciones de uso */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            🚀 Cómo funciona (igual que BiAleseCorp)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">🔍 Endpoints disponibles:</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li><code>/api/all_menus.php</code> - Todos los menús con submenús</li>
                <li><code>/api/menu_by_url.php?url=ventas</code> - Menú por URL</li>
                <li><code>/api/submenus.php?parent_id=1</code> - Submenús</li>
                <li><code>/api/menus_dual.php</code> - Menús por permisos</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">⚡ Funcionalidades:</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>✅ Navegación por URL como BiAleseCorp</li>
                <li>✅ Menús jerárquicos (padre → hijos)</li>
                <li>✅ iframes dinámicos de PowerBI</li>
                <li>✅ Breadcrumbs automáticos</li>
                <li>✅ Misma estructura de base de datos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiAleseMenuDemo;
