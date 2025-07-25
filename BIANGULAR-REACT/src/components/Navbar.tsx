import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext_new';
import { useMenus } from '../hooks/useMenus_new';
import { MenuItem } from '../services/aleseCorpApi_php_only';
import { 
  ChevronDown, 
  User, 
  LogOut, 
  Menu as MenuIcon,
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

  const toggleDropdown = (menuId: number) => {
    const newOpenDropdowns = new Set(openDropdowns);
    if (newOpenDropdowns.has(menuId)) {
      newOpenDropdowns.delete(menuId);
    } else {
      newOpenDropdowns.add(menuId);
    }
    setOpenDropdowns(newOpenDropdowns);
  };

  const handleMenuClick = (menu: MenuItem) => {
    console.log('Menu clicked:', menu);
    
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
              <div className="animate-pulse text-blue-600">🔄 Cargando menús desde MySQL...</div>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img 
                src="/assets/img/alese-logo.png" 
                alt="ALESE CORP" 
                className="h-10 w-auto"
              />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-800">Analytics</h1>
                <p className="text-xs text-gray-500">Portal Empresarial MySQL Directo</p>
              </div>
            </div>
          </div>

          {/* Main Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {menus.length === 0 ? (
              <div className="text-gray-500 text-sm">No hay menús disponibles</div>
            ) : (
              menus.map((menu) => {
                const hasChildren = menu.children && menu.children.length > 0;
                const isOpen = openDropdowns.has(menu.idmenu);

                return (
                  <div key={menu.idmenu} className="relative">
                    <button
                      onClick={() => hasChildren ? toggleDropdown(menu.idmenu) : handleMenuClick(menu)}
                      className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                    >
                      {getMenuIcon(menu.icono)}
                      <span>{menu.menu}</span>
                      {hasChildren && (
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                        />
                      )}
                    </button>

                    {/* Dropdown Menu */}
                    {hasChildren && isOpen && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="py-1">
                          {menu.children?.map(child => renderMenuItem(child))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
              >
                <User className="w-5 h-5" />
                <span className="hidden md:block">{user?.fullName}</span>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} 
                />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b">
                      <div className="font-medium">{user?.fullName}</div>
                      <div className="text-xs">{user?.UsuPerfil}</div>
                      <div className="text-xs text-green-600 mt-1">✅ MySQL Directo</div>
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
          </div>
        </div>
      </div>

      {/* Mobile Menu Button (for future implementation) */}
      <div className="md:hidden">
        <button className="p-2 text-gray-700">
          <MenuIcon className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
