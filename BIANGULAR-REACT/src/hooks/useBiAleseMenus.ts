import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { aleseCorpApi, MenuItem } from '../services/aleseCorpApi_php_only';
import { useAuth } from '../contexts/AuthContext_new';

/**
 * Hook para obtener menú actual por URL (como BiAleseCorp)
 * Replicando la lógica de Welcome::index() de BiAleseCorp
 */
export const useCurrentMenu = () => {
  const location = useLocation();
  const [currentMenu, setCurrentMenu] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentMenu = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Obtener la URL actual (como $this->uri->uri_string de BiAleseCorp)
        const currentPath = location.pathname.replace('/', '') || 'dashboard'; // Default a dashboard
        
        console.log('🔍 Buscando menú para URL:', currentPath);
        
        // Buscar el menú por URL (como $this->menu->getMenu($pageLoad))
        const menu = await aleseCorpApi.getMenuByUrl(currentPath);
        
        if (menu) {
          console.log('✅ Menú encontrado:', menu.menu);
          setCurrentMenu(menu);
        } else {
          console.log('❌ Menú no encontrado para URL:', currentPath);
          setCurrentMenu(null);
          setError(`No se encontró menú para la URL: ${currentPath}`);
        }
        
      } catch (error) {
        console.error('❌ Error obteniendo menú actual:', error);
        setError('Error al cargar el menú actual');
        setCurrentMenu(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentMenu();
  }, [location.pathname]);

  return {
    currentMenu,
    isLoading,
    error,
    refetch: () => {
      // Re-ejecutar la búsqueda del menú actual
      const currentPath = location.pathname.replace('/', '') || 'dashboard';
      aleseCorpApi.getMenuByUrl(currentPath).then(setCurrentMenu).catch(console.error);
    }
  };
};

/**
 * Hook para obtener submenús de un menú padre específico
 * Replicando la lógica de Menu::getSubMenus($parent) de BiAleseCorp
 */
export const useSubMenus = (parentId: number | null) => {
  const [subMenus, setSubMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!parentId) {
      setSubMenus([]);
      return;
    }

    const fetchSubMenus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔍 Obteniendo submenús para padre:', parentId);
        
        // Obtener submenús (como $this->menu->getSubMenus($parent))
        const subs = await aleseCorpApi.getSubMenus(parentId);
        
        console.log('✅ Submenús obtenidos:', subs.length);
        setSubMenus(subs);
        
      } catch (error) {
        console.error('❌ Error obteniendo submenús:', error);
        setError('Error al cargar los submenús');
        setSubMenus([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubMenus();
  }, [parentId]);

  return {
    subMenus,
    isLoading,
    error,
    refetch: () => {
      if (parentId) {
        aleseCorpApi.getSubMenus(parentId).then(setSubMenus).catch(console.error);
      }
    }
  };
};

/**
 * Hook para obtener TODOS los menús con submenús (para navegación)
 * Replicando la lógica de Api::menus() de BiAleseCorp con permisos por perfil
 */
export const useAllMenus = () => {
  const { user } = useAuth();
  const [allMenus, setAllMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllMenus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('📋 Obteniendo TODOS los menús con permisos por perfil');
        
        // Obtener todos los menús con submenús usando el usuario actual
        const menus = await aleseCorpApi.getAllMenusWithSubmenus(user?.UsuCod);
        
        console.log('✅ Todos los menús obtenidos con permisos:', menus.length);
        setAllMenus(menus);
        
      } catch (error) {
        console.error('❌ Error obteniendo todos los menús:', error);
        setError('Error al cargar todos los menús');
        setAllMenus([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Solo hacer la petición si tenemos un usuario autenticado
    if (user?.UsuCod) {
      fetchAllMenus();
    }
  }, [user?.UsuCod]);

  return {
    allMenus,
    isLoading,
    error,
    refetch: () => {
      if (user?.UsuCod) {
        aleseCorpApi.getAllMenusWithSubmenus(user.UsuCod).then(setAllMenus).catch(console.error);
      }
    }
  };
};
