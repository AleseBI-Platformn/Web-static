import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface MenuItem {
  idmenu: number;
  menu: string;
  vista: string | null;
  icono: string | null;
  estado: string;
  url: string | null;
  ancho: string | null;
  alto: string | null;
  parent: number | null;
  children: MenuItem[];
}

interface MenusResponse {
  success: boolean;
  menus: MenuItem[];
  total_permissions: number;
  user_permissions: number;
  profile_permissions: number;
}

// REAL API BASE URL - CONECTANDO A LA BASE DE DATOS REAL DE ALESE CORP
// Cambiar esta URL por la URL real del servidor donde están alojados los archivos PHP
const API_BASE_URL = 'https://tu-servidor.com/api';

export const useMenus = () => {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { permissions, isAuthenticated } = useAuth();

  const fetchMenus = async () => {
    if (!isAuthenticated || !permissions || permissions.length === 0) {
      setMenus([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Obteniendo menús para permisos:', permissions);
      const permissionsParam = permissions.join(',');
      const response = await fetch(`${API_BASE_URL}/menus.php?permissions=${permissionsParam}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MenusResponse = await response.json();
      console.log('📋 Menús obtenidos:', data);

      if (data.success) {
        setMenus(data.menus);
        console.log('✅ Menús configurados correctamente:', data.menus.length);
      } else {
        throw new Error('Failed to fetch menus');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Error fetching menus:', err);
      
      // Fallback con menús de prueba si hay error de conexión
      console.log('🔄 Usando menús de fallback...');
      setMenus([
        {
          idmenu: 1,
          menu: 'Dashboard',
          vista: null,
          icono: 'chart',
          estado: '1',
          url: '/dashboard',
          ancho: null,
          alto: null,
          parent: null,
          children: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [permissions, isAuthenticated]);

  return {
    menus,
    loading,
    error,
    refetch: fetchMenus,
  };
};
