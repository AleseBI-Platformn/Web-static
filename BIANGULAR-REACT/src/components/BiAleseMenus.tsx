import React from 'react';
import { useCurrentMenu, useAllMenus } from '../hooks/useBiAleseMenus';

/**
 * Componente para mostrar menú dinámico como BiAleseCorp
 * Replicando la lógica de menu.php de BiAleseCorp
 */
export const DynamicMenuView: React.FC = () => {
  const { currentMenu, isLoading: menuLoading, error: menuError } = useCurrentMenu();

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

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex flex-col">
      {/* Header fijo - sin scroll */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          {/* Título de la página (como $pagina['menu']) */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {currentMenu.icono && <span className="mr-2">{currentMenu.icono}</span>}
            {currentMenu.menu}
          </h2>
          
          {/* Breadcrumb como BiAleseCorp */}
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                  🏠 Home
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2.5 text-gray-400">/</span>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">{currentMenu.menu}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Contenido del iframe - ocupa el resto de la pantalla */}
      <div className="flex-1 overflow-hidden">
        {currentMenu.vista ? (
          /* iframe que ocupa toda la pantalla disponible - SIN scroll externo */
          (() => {
            const style = getDisplayStyle();
            return (
              <iframe
                title={currentMenu.menu}
                src={currentMenu.vista || ''}
                frameBorder="0"
                allowFullScreen={true}
                className="w-full h-full border-0"
                style={{
                  width: '100%',
                  height: style.height as string
                }}
              />
            );
          })()
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center">
              <div className="text-6xl text-gray-300 mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Vista no configurada</h3>
              <p className="text-gray-500">
                Este menú no tiene una vista configurada aún.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Debug info (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && currentMenu && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs max-w-sm">
          <h4 className="font-bold mb-2">🔧 Debug - Menú Actual:</h4>
          <div className="space-y-1">
            <div><strong>ID:</strong> {currentMenu.idmenu}</div>
            <div><strong>URL:</strong> {currentMenu.url}</div>
            <div><strong>Vista:</strong> {currentMenu.vista ? '✅' : '❌'}</div>
            <div><strong>Parent:</strong> {currentMenu.parent || 'null'}</div>
            <div><strong>Dimensiones BD:</strong> {currentMenu.ancho} x {currentMenu.alto}</div>
            <div><strong>Modo:</strong> {getDisplayStyle().mode}</div>
            <div><strong>Dimensiones aplicadas:</strong> {getDisplayStyle().width} x {getDisplayStyle().height}</div>
          </div>
        </div>
      )}
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
