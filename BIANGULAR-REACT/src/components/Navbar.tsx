import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext_new';
import { useMenus } from '../hooks/useMenus_new';
import { MenuItem } from '../services/aleseCorpApi_php_only';
import { 
  ChevronDown, 
  User, 
  LogOut, 
  Menu as MenuIcon,
  X,
  Building,
  BarChart3,
  Settings,
  Users,
  FileText,
  Database,
  DollarSign,
  Package,
  TrendingUp,
  Home,
  ShoppingCart,
  AlertCircle
} from 'lucide-react';

// Agregar estilos para la animación
const dropdownStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Insertar estilos en el documento
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = dropdownStyles;
  document.head.appendChild(styleSheet);
}

// Icon mapping for menu items
const getMenuIcon = (iconName: string | null) => {
  if (!iconName) return <FileText className="w-4 h-4" />;
  
  const iconMap: { [key: string]: React.ReactNode } = {
    'home': <Home className="w-4 h-4" />,
    'eye': <Settings className="w-4 h-4" />, // GERENCIA
    'direction': <TrendingUp className="w-4 h-4" />, // VENTAS
    'world': <BarChart3 className="w-4 h-4" />, // DIGITAL
    'shopping-cart': <ShoppingCart className="w-4 h-4" />, // RETOMAS
    'folder': <Building className="w-4 h-4" />, // ADMINISTRACION
    'truck': <Package className="w-4 h-4" />, // POSTVENTA
    'ti-headphone-al': <Users className="w-4 h-4" />, // CALLCENTER
    'settings': <Settings className="w-4 h-4" />, // F&I
    'notepad': <FileText className="w-4 h-4" />, // KPI
    'users': <Users className="w-4 h-4" />,
    'file': <FileText className="w-4 h-4" />,
    'database': <Database className="w-4 h-4" />,
    'dollar': <DollarSign className="w-4 h-4" />,
    'package': <Package className="w-4 h-4" />,
    'chart': <BarChart3 className="w-4 h-4" />,
    'trending': <TrendingUp className="w-4 h-4" />,
    'building': <Building className="w-4 h-4" />,
    'chart-bar': <BarChart3 className="w-4 h-4" />,
  };
  
  return iconMap[iconName] || <FileText className="w-4 h-4" />;
};

interface NavbarProps {
  onMenuClick?: (menu: MenuItem) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { menus, isLoading, error } = useMenus();
  const [openDropdowns, setOpenDropdowns] = useState<Set<number>>(new Set());
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close menus when clicking outside or resizing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.navbar-dropdown') && !target.closest('.navbar-button')) {
        setOpenDropdowns(new Set());
        setUserDropdownOpen(false);
      }
    };

    const handleResize = () => {
      // Close mobile menu on larger screens (md and up = 768px)
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
      // Close all dropdowns when resizing
      setOpenDropdowns(new Set());
      setUserDropdownOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleDropdown = (menuId: number) => {
    setOpenDropdowns(prev => {
      const isCurrentlyOpen = prev.has(menuId);
      if (isCurrentlyOpen) {
        // Si está abierto, cerrarlo completamente
        return new Set();
      } else {
        // Si está cerrado, abrir solo este y cerrar otros
        return new Set([menuId]);
      }
    });
  };

  const handleMenuClick = (menu: MenuItem) => {
    // Cerrar todos los dropdowns cuando se hace clic en un submenu
    setOpenDropdowns(new Set());
    
    // Cerrar menú móvil si está abierto
    setMobileMenuOpen(false);
    
    // Solo llamar onMenuClick para navegación interna - NO abrir ventanas
    if (onMenuClick) {
      onMenuClick(menu);
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
  };

  const renderMenuItem = (menu: MenuItem, level: number = 0) => {
    const hasChildren = menu.children && menu.children.length > 0;
    const isOpen = openDropdowns.has(menu.idmenu);
    const paddingLeft = level * 16;

    return (
      <div key={menu.idmenu} className="relative">
        <button
          onClick={() => hasChildren ? toggleDropdown(menu.idmenu) : handleMenuClick(menu)}
          className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
          style={{ paddingLeft: `${16 + paddingLeft}px` }}
        >
          <div className="flex items-center space-x-2">
            {getMenuIcon(menu.icono)}
            <span>{menu.menu}</span>
          </div>
          {hasChildren && (
            <ChevronDown 
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            />
          )}
        </button>
        
        {hasChildren && isOpen && (
          <div className="bg-gray-50 border-l-2 border-blue-200">
            {menu.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="animate-pulse text-blue-600">🔄 Cargando menús...</div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (error) {
    return (
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span>Error cargando menús: {error}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center flex-shrink-0">
            <div className="flex items-center">
              <img 
                src="/assets/img/alese-logo.png" 
                alt="ALESE CORP" 
                className="h-8 w-auto sm:h-10"
              />
              <div className="ml-2 sm:ml-3">
                <h1 className="text-lg sm:text-xl font-bold text-gray-800">Analytics</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Portal Empresarial</p>
              </div>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center flex-1 justify-center mx-4" style={{ overflow: 'visible' }}>
            <div className="flex items-center space-x-1 xl:space-x-2 overflow-x-auto scrollbar-hide max-w-full" style={{ overflow: 'visible' }}>
              {menus.length === 0 ? (
                <div className="text-gray-500 text-sm">No hay menús disponibles</div>
              ) : (
                menus.map((menu) => {
                  const hasChildren = menu.children && menu.children.length > 0;
                  const isOpen = openDropdowns.has(menu.idmenu);

                  return (
                    <div key={menu.idmenu} className="relative navbar-dropdown flex-shrink-0">
                      <button
                        onClick={() => {
                          if (hasChildren) {
                            toggleDropdown(menu.idmenu);
                          } else {
                            handleMenuClick(menu);
                          }
                        }}
                        className="navbar-button flex items-center space-x-1 px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200 whitespace-nowrap"
                        title={menu.menu}
                      >
                        <div className="flex-shrink-0">
                          {getMenuIcon(menu.icono)}
                        </div>
                        <span className="hidden xl:inline truncate max-w-24">{menu.menu}</span>
                        <span className="hidden lg:inline xl:hidden truncate max-w-16 text-xs">{menu.menu}</span>
                        <span className="hidden md:inline lg:hidden text-xs">
                          {menu.menu.length > 6 ? menu.menu.substring(0, 6) + '...' : menu.menu}
                        </span>
                        {hasChildren && (
                          <ChevronDown 
                            className={`w-3 h-3 xl:w-4 xl:h-4 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
                          />
                        )}
                      </button>

                      {/* Desktop Dropdown Menu - SIMPLE Y RESPONSIVE */}
                      {hasChildren && isOpen && (
                        <div 
                          className="absolute top-full left-0 mt-1 bg-white shadow-lg border border-gray-200 rounded-md py-1 min-w-[200px] max-w-[300px] z-[99999]"
                          style={{ 
                            position: 'absolute',
                            top: '100%',
                            left: '0',
                            zIndex: 99999
                          }}
                        >
                          {menu.children?.map(child => (
                            <button
                              key={child.idmenu}
                              onClick={() => handleMenuClick(child)}
                              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 text-left"
                            >
                              {getMenuIcon(child.icono)}
                              <span className="truncate">{child.menu}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right side - User Menu & Mobile Button */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* User Menu */}
            <div className="relative navbar-dropdown">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="navbar-button flex items-center space-x-1 px-2 xl:px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                title="Menú de usuario"
              >
                <User className="w-4 h-4 xl:w-5 xl:h-5" />
                <ChevronDown 
                  className={`w-3 h-3 xl:w-4 xl:h-4 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} 
                />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" style={{ zIndex: 9999 }}>
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b">
                      <div className="font-medium">{user?.fullName}</div>
                      <div className="text-xs">{user?.UsuPerfil}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="navbar-button p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <MenuIcon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu - CÓDIGO NUEVO COMPLETO */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200 shadow-lg">
            {menus.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No hay menús disponibles</div>
            ) : (
              menus.map((menu) => {
                const hasChildren = menu.children && menu.children.length > 0;
                const isOpen = openDropdowns.has(menu.idmenu);

                return (
                  <div key={menu.idmenu}>
                    <button
                      onClick={() => {
                        if (!hasChildren) {
                          // Si NO tiene hijos, navegar directamente
                          setMobileMenuOpen(false);
                          if (onMenuClick) onMenuClick(menu);
                        } else {
                          // Si YA está abierto, cerrarlo
                          if (isOpen) {
                            setOpenDropdowns(new Set());
                          } 
                          // Si está cerrado, abrirlo
                          else {
                            setOpenDropdowns(new Set([menu.idmenu]));
                          }
                        }
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-2">
                        {getMenuIcon(menu.icono)}
                        <span>{menu.menu}</span>
                      </div>
                      {hasChildren && (
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                        />
                      )}
                    </button>

                    {/* Mobile Submenu */}
                    {hasChildren && isOpen && (
                      <div className="pl-6 mt-1 space-y-1">
                        {menu.children?.map(child => (
                          <button
                            key={child.idmenu}
                            onClick={() => {
                              // SIEMPRE cerrar el menú móvil y navegar
                              setMobileMenuOpen(false);
                              setOpenDropdowns(new Set());
                              if (onMenuClick) onMenuClick(child);
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                          >
                            {getMenuIcon(child.icono)}
                            <span>{child.menu}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
