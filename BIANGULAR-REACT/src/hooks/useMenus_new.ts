import { useState, useEffect } from 'react';
import { aleseCorpApi, MenuItem } from '../services/aleseCorpApi';
import { useAuth } from '../contexts/AuthContext';

export const useMenus = () => {
  const { permissions, isAuthenticated } = useAuth();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || permissions.length === 0) {
      setMenus([]);
      return;
    }

    const fetchMenus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('📋 Obteniendo menús desde MySQL para permisos:', permissions);
        
        // Obtener menús directamente desde MySQL
        const menuData = await aleseCorpApi.getMenus(permissions);
        
        setMenus(menuData);
        console.log('✅ Menús obtenidos exitosamente:', menuData.length);
        
      } catch (error) {
        console.error('❌ Error obteniendo menús:', error);
        setError('Error al cargar los menús');
        setMenus([]); // Sin fallbacks - si falla, no hay menús
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenus();
  }, [permissions, isAuthenticated]);

  return {
    menus,
    isLoading,
    error,
    refetch: () => {
      if (isAuthenticated && permissions.length > 0) {
        // Re-ejecutar la carga de menús
        const fetchMenus = async () => {
          try {
            setIsLoading(true);
            setError(null);
            const menuData = await aleseCorpApi.getMenus(permissions);
            setMenus(menuData);
          } catch (error) {
            console.error('❌ Error refrescando menús:', error);
            setError('Error al refrescar los menús');
            setMenus([]);
          } finally {
            setIsLoading(false);
          }
        };
        fetchMenus();
      }
    }
  };
};
