import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMenus } from '@/hooks/useMenus';
import { Menu } from '@/types/auth';
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
  TrendingUp
} from 'lucide-react';

// Icon mapping for menu items
const getMenuIcon = (iconName: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'users': <Users className="w-4 h-4" />,
    'settings': <Settings className="w-4 h-4" />,
    'file': <FileText className="w-4 h-4" />,
    'database': <Database className="w-4 h-4" />,
    'dollar': <DollarSign className="w-4 h-4" />,
    'package': <Package className="w-4 h-4" />,
    'chart': <BarChart3 className="w-4 h-4" />,
    'trending': <TrendingUp className="w-4 h-4" />,
    'building': <Building className="w-4 h-4" />,
  };
  
  return iconMap[iconName] || <FileText className="w-4 h-4" />;
};

interface NavbarProps {
  onMenuClick?: (menu: Menu) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { menus, loading } = useMenus();
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

  const handleMenuClick = (menu: Menu) => {
    if (menu.url && menu.url !== '#') {
      window.open(menu.url, '_blank');
    }
    onMenuClick?.(menu);
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
  };

  const renderMenuItem = (menu: Menu, level: number = 0) => {
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
            {menu.children.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="animate-pulse">Cargando menús...</div>
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
                src="/alese-logo.png" 
                alt="ALESE CORP" 
                className="h-10 w-auto"
              />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-800">Analytics</h1>
                <p className="text-xs text-gray-500">Portal Empresarial</p>
              </div>
            </div>
          </div>

          {/* Main Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {menus.map((menu) => {
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
                        {menu.children.map(child => renderMenuItem(child))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
              >
                <User className="w-5 h-5" />
                <span className="hidden md:block">{user?.fullName || user?.UsuNom}</span>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} 
                />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b">
                      <div className="font-medium">{user?.fullName || user?.UsuNom}</div>
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
