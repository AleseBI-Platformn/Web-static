import { useState, useEffect, useRef } from 'react';
import { aleseCorpApi, MenuItem } from '../services/aleseCorpApi_php_only';
import { useAuth } from '../contexts/AuthContext_new';

export const useMenus = () => {
  const { permissions, isAuthenticated } = useAuth();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastPermissionsRef = useRef<string>('');
  const cacheRef = useRef<Map<string, MenuItem[]>>(new Map());

  useEffect(() => {
    // Si no está autenticado o no hay permisos, limpiar menús
    if (!isAuthenticated || permissions.length === 0) {
      setMenus([]);
      return;
    }

    // Evitar llamadas duplicadas y usar cache
    const currentPermissions = JSON.stringify(permissions.sort());
    if (lastPermissionsRef.current === currentPermissions) {
      return; // Ya se cargaron los menús para estos permisos
    }

    // Verificar cache primero
    const cachedMenus = cacheRef.current.get(currentPermissions);
    if (cachedMenus) {
      setMenus(cachedMenus);
      lastPermissionsRef.current = currentPermissions;
      return;
    }

    const fetchMenus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Obtener menús directamente desde base de datos (sin logs para mayor velocidad)
        const menuData = await aleseCorpApi.getMenus(permissions);
        
        // Guardar en cache
        cacheRef.current.set(currentPermissions, menuData);
        
        setMenus(menuData);
        lastPermissionsRef.current = currentPermissions;
        
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
        const currentPermissions = JSON.stringify(permissions.sort());
        // Limpiar cache para forzar recarga
        cacheRef.current.delete(currentPermissions);
        
        // Re-ejecutar la carga de menús
        const fetchMenus = async () => {
          try {
            setIsLoading(true);
            setError(null);
            const menuData = await aleseCorpApi.getMenus(permissions);
            
            // Actualizar cache
            cacheRef.current.set(currentPermissions, menuData);
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
