import { useState, useEffect, useRef } from 'react';
import { aleseCorpApi, MenuItem } from '../services/aleseCorpApi_php_only';
import { useAuth } from '../contexts/AuthContext_new';

export const useMenus = () => {
  const { permissions, isAuthenticated } = useAuth();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastPermissionsRef = useRef<string>('');

  useEffect(() => {
    // Si no está autenticado o no hay permisos, limpiar menús
    if (!isAuthenticated || permissions.length === 0) {
      setMenus([]);
      return;
    }

    // Evitar llamadas duplicadas comparando los permisos
    const currentPermissions = JSON.stringify(permissions.sort());
    if (lastPermissionsRef.current === currentPermissions) {
      return; // Ya se cargaron los menús para estos permisos
    }

    const fetchMenus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Solo log si está habilitado
        if (import.meta.env.VITE_APP_API_LOGS === 'true') {
          console.log('📋 Cargando menús para permisos:', permissions);
        }
        
        // Obtener menús directamente desde MySQL
        const menuData = await aleseCorpApi.getMenus(permissions);
        
        setMenus(menuData);
        lastPermissionsRef.current = currentPermissions;
        
        if (import.meta.env.VITE_APP_API_LOGS === 'true') {
          console.log('✅ Menús cargados:', menuData.length);
        }
        
      } catch (error) {
        console.error('❌ Error obteniendo menús:', error);
        setError('Error al cargar los menús');
        setMenus([]);
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
