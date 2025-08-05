import React from 'react';
import { useCurrentMenu, useAllMenus } from '../hooks/useBiAleseMenus';
import PowerBIVisualization from './PowerBIVisualization';

/**
 * Componente para mostrar menú dinámico como BiAleseCorp
 * Replicando la lógica de menu.php de BiAleseCorp
 */
export const DynamicMenuView: React.FC = () => {
  const { currentMenu, isLoading: menuLoading, error: menuError } = useCurrentMenu();

  // Determinar si es una visualización de Power BI
  const isPowerBIVisualization = () => {
    if (!currentMenu) return false;
    
    // Verificar si es un menú de reportes o Power BI
    const powerBIMenus = ['reportes', 'dashboard', 'analytics', 'metrics', 'kpi'];
    const isPowerBI = powerBIMenus.some(menu => 
      currentMenu.vista?.toLowerCase().includes(menu) ||
      currentMenu.menu?.toLowerCase().includes(menu) ||
      currentMenu.url?.toLowerCase().includes(menu)
    );
    
    return isPowerBI;
  };

  // SOLUCIÓN 4: Modo de visualización adaptativo
  const getViewMode = () => {
    const hasCustomSize = currentMenu?.ancho && currentMenu?.alto;
    const anchoNum = currentMenu?.ancho ? parseInt(currentMenu.ancho) : 0;
    const altoNum = currentMenu?.alto ? parseInt(currentMenu.alto) : 0;
    const isLargeSize = hasCustomSize && (anchoNum > 1200 || altoNum > 800);
    
    if (hasCustomSize && !isLargeSize) {
      return 'fixed'; // Usar dimensiones exactas de BD
    } else if (hasCustomSize && isLargeSize) {
      return 'responsive-large'; // Responsive pero respetando proporciones
    } else {
      return 'fullscreen'; // Pantalla completa
    }
  };

  // Función para obtener las dimensiones según el modo
  const getDisplayStyle = () => {
    if (!currentMenu) return { width: '100%', height: 'calc(100vh - 140px)', mode: 'fullscreen' };
    
    const viewMode = getViewMode();
    
    switch (viewMode) {
      case 'fixed':
        // ANCHO SIEMPRE 100% RESPONSIVE - ALTO de la BD pero calculado proporcionalmente
        const anchoOriginal = parseInt(currentMenu.ancho!);
        const altoOriginal = parseInt(currentMenu.alto!);
        const aspectRatio = altoOriginal / anchoOriginal;
        
        return {
          width: '100%', // SIEMPRE 100% responsive
          height: `calc(100vw * ${aspectRatio})`, // Alto proporcional basado en el aspect ratio de la BD
          maxHeight: 'calc(100vh - 140px)', // Limitar altura máxima
          mode: 'fixed' as const
        };
      
      case 'responsive-large':
        // Para reportes grandes, mantener proporciones pero responsive
        const anchoNum = parseInt(currentMenu.ancho!);
        const altoNum = parseInt(currentMenu.alto!);
        const aspectRatio2 = altoNum / anchoNum;
        return {
          width: '100%', // SIEMPRE 100% responsive
          height: `min(calc(100vh - 140px), calc(100vw * ${aspectRatio2}))`,
          mode: 'responsive-large' as const
        };
      
      default: // 'fullscreen'
        return {
          width: '100%',
          height: 'calc(100vh - 140px)',
          mode: 'fullscreen' as const
        };
    }
  };

  if (menuLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando menú...</p>
        </div>
      </div>
    );
  }

  if (menuError || !currentMenu) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Menú no encontrado</h2>
          <p className="text-gray-600 mb-4">{menuError || 'El menú solicitado no existe'}</p>
          <button 
            onClick={() => window.history.back()} 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Si es una visualización de Power BI, usar el componente específico
  if (isPowerBIVisualization()) {
    return (
      <PowerBIVisualization 
        menuData={currentMenu}
        onCustomize={(settings) => {
          console.log('Configuración de Power BI actualizada:', settings);
          // Aquí puedes guardar la configuración en localStorage o enviarla al servidor
          localStorage.setItem('powerbi-settings', JSON.stringify(settings));
        }}
      />
    );
  }

  // Para otros tipos de menús, usar la visualización estándar
  const displayStyle = getDisplayStyle();

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex flex-col">
      {/* Header fijo - sin scroll */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentMenu.menu}</h1>
              <p className="text-gray-600">Vista: {currentMenu.vista}</p>
            </div>
            <div className="text-sm text-gray-500">
              {displayStyle.mode} - {currentMenu.ancho}x{currentMenu.alto}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal - con scroll */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-4">
          {/* Contenedor del contenido con dimensiones específicas */}
          <div 
            className="bg-white rounded-lg shadow-lg overflow-hidden"
            style={{
              width: displayStyle.width,
              height: displayStyle.height,
              maxWidth: '100%',
              margin: '0 auto'
            }}
          >
            {/* Contenido del menú */}
            <div className="p-6">
              <div className="text-center">
                <div className="text-6xl text-blue-500 mb-4">📊</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {currentMenu.menu}
                </h2>
                <p className="text-gray-600 mb-4">
                  Vista: <strong>{currentMenu.vista}</strong>
                </p>
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Dimensiones:</strong> {currentMenu.ancho} x {currentMenu.alto}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>URL:</strong> {currentMenu.url}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Modo:</strong> {displayStyle.mode}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente para mostrar navegación de menús como BiAleseCorp
 */
export const MenuNavigation: React.FC = () => {
  const { allMenus, isLoading, error } = useAllMenus();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !allMenus.length) {
    return (
      <div className="text-center text-gray-500 py-4">
        <span>❌ Error cargando menús</span>
      </div>
    );
  }

  return (
    <nav className="space-y-2">
      {allMenus.map((menu) => (
        <div key={menu.idmenu} className="menu-item">
          {/* Menú principal */}
          <a
            href={`/${menu.url}`}
            className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-100 group"
          >
            {menu.icono && <span className="mr-3">{menu.icono}</span>}
            <span className="flex-1">{menu.menu}</span>
            {menu.children.length > 0 && <span className="text-gray-400">▶</span>}
          </a>

          {/* Submenús */}
          {menu.children.length > 0 && (
            <div className="ml-6 mt-1 space-y-1">
              {menu.children.map((submenu) => (
                <a
                  key={submenu.idmenu}
                  href={`/${submenu.url}`}
                  className="flex items-center p-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 group"
                >
                  {submenu.icono && <span className="mr-2 text-xs">{submenu.icono}</span>}
                  <span>{submenu.menu}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Debug info (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
          <strong>🔧 Debug:</strong> {allMenus.length} menús cargados
        </div>
      )}
    </nav>
  );
};
