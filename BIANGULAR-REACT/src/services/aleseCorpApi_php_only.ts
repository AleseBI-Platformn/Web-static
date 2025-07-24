/**
 * Servicio API PURO PHP para ALESE CORP
 * Solo PHP - Local y Bluehost
 */

export interface User {
  UsuCod: string;
  UsuNom: string;
  UsuApePat: string;
  UsuApeMat: string;
  UsuEmail: string;
  UsuPerfil: string;
  idperfil: number; // Agregado para permisos
  fullName: string;
}

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

export interface LoginResponse {
  success: boolean;
  user: User;
  permissions: number[];
  token: string;
  message?: string;
}

export interface MenuResponse {
  success: boolean;
  menus: MenuItem[];
  total: number;
  total_with_children?: number;
  usuario?: string; // Agregado para validación
  perfil?: number; // Agregado para validación
  message?: string;
}

class AleseCorpApiService {
  // SOLO PHP - para local (con servidor PHP) y Bluehost
  private baseUrl = '/api';

  /**
   * Autenticar usuario usando PHP directo - Optimizado
   */
  async authenticate(username: string, password: string): Promise<LoginResponse> {
    try {
      // Solo logs si está habilitado en desarrollo
      if (import.meta.env.VITE_APP_API_LOGS === 'true') {
        console.log('🔐 Autenticando:', username);
      }
      
      const response = await fetch(`${this.baseUrl}/login_dual.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const result: LoginResponse = await response.json();
      
      if (result.success) {
        if (import.meta.env.VITE_APP_API_LOGS === 'true') {
          console.log('✅ Autenticación exitosa:', result.user.fullName);
          console.log('📋 Permisos obtenidos:', result.permissions.length);
        }
        
        // Guardar en localStorage
        localStorage.setItem('aleseCorpUser', JSON.stringify(result.user));
        localStorage.setItem('aleseCorpPermissions', JSON.stringify(result.permissions));
        localStorage.setItem('aleseCorpToken', result.token);
      } else {
        throw new Error(result.message || 'Credenciales incorrectas');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error en autenticación:', error);
      throw error;
    }
  }

  /**
   * Obtener menús usando PHP directo (por permisos) - Optimizado
   */
  async getMenus(permissions: number[]): Promise<MenuItem[]> {
    try {
      // Solo logs si está habilitado
      if (import.meta.env.VITE_APP_API_LOGS === 'true') {
        console.log('📋 Obteniendo menús:', permissions);
      }
      
      const response = await fetch(`${this.baseUrl}/menus_dual.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          permissions: permissions
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const result: MenuResponse = await response.json();
      
      if (result.success) {
        if (import.meta.env.VITE_APP_API_LOGS === 'true') {
          console.log('✅ Menús obtenidos:', result.total);
        }
        return result.menus || [];
      } else {
        throw new Error(result.message || 'Error al obtener menús');
      }
    } catch (error) {
      console.error('❌ Error obteniendo menús:', error);
      throw error;
    }
  }

  /**
   * Obtener TODOS los menús principales con submenús (como BiAleseCorp)
   * Replicando: Api::menus() de BiAleseCorp con permisos por perfil
   */
  async getAllMenusWithSubmenus(usuario?: string): Promise<MenuItem[]> {
    try {
      console.log('📋 Obteniendo TODOS los menús con submenús (como BiAleseCorp)');
      
      let url = `${this.baseUrl}/all_menus.php`;
      if (usuario) {
        url += `?usuario=${encodeURIComponent(usuario)}`;
        console.log('👤 Usuario:', usuario);
      }
      
      console.log('🌐 Endpoint:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const result: MenuResponse = await response.json();
      
      if (result.success) {
        console.log('✅ Menús obtenidos con permisos:', result.total);
        if (result.usuario) {
          console.log('👤 Usuario validado:', result.usuario, 'Perfil:', result.perfil);
        }
        return result.menus || [];
      } else {
        throw new Error(result.message || 'Error al obtener todos los menús');
      }
    } catch (error) {
      console.error('❌ Error obteniendo todos los menús:', error);
      throw error;
    }
  }

  /**
   * Obtener menú específico por URL (como BiAleseCorp)
   * Replicando: Menu::getMenu($url) de BiAleseCorp
   */
  async getMenuByUrl(url: string): Promise<MenuItem | null> {
    try {
      console.log('📋 Obteniendo menú por URL:', url);
      console.log('🌐 Endpoint:', `${this.baseUrl}/menu_by_url.php`);
      
      const response = await fetch(`${this.baseUrl}/menu_by_url.php?url=${encodeURIComponent(url)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Menú no encontrado
        }
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Menú por URL obtenido:', result.data.menu);
        return result.data;
      } else {
        console.log('❌ Menú no encontrado:', url);
        return null;
      }
    } catch (error) {
      console.error('❌ Error obteniendo menú por URL:', error);
      throw error;
    }
  }

  /**
   * Obtener submenús de un padre específico (como BiAleseCorp)
   * Replicando: Menu::getSubMenus($parent) de BiAleseCorp
   */
  async getSubMenus(parentId: number): Promise<MenuItem[]> {
    try {
      console.log('📋 Obteniendo submenús del padre:', parentId);
      console.log('🌐 Endpoint:', `${this.baseUrl}/submenus.php`);
      
      const response = await fetch(`${this.baseUrl}/submenus.php?parent_id=${parentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Submenús obtenidos:', result.data.total);
        return result.data.submenus || [];
      } else {
        throw new Error(result.message || 'Error al obtener submenús');
      }
    } catch (error) {
      console.error('❌ Error obteniendo submenús:', error);
      throw error;
    }
  }

  /**
   * Probar conexión usando PHP directo
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔗 Probando conexión con PHP...');
      console.log('🌐 Endpoint:', `${this.baseUrl}/test_dual.php`);
      
      const response = await fetch(`${this.baseUrl}/test_dual.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Conexión PHP exitosa:', result.message);
        console.log('📊 Entorno:', result.environment);
      } else {
        console.log('❌ Error PHP:', result.message);
      }
      
      return result.success;
    } catch (error) {
      console.error('❌ Error probando PHP:', error);
      return false;
    }
  }

  /**
   * Obtener usuario desde localStorage
   */
  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem('aleseCorpUser');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  }

  /**
   * Obtener permisos desde localStorage
   */
  getCurrentPermissions(): number[] {
    try {
      const permissions = localStorage.getItem('aleseCorpPermissions');
      return permissions ? JSON.parse(permissions) : [];
    } catch (error) {
      console.error('Error obteniendo permisos:', error);
      return [];
    }
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    localStorage.removeItem('aleseCorpUser');
    localStorage.removeItem('aleseCorpPermissions');
    localStorage.removeItem('aleseCorpToken');
    console.log('🔓 Sesión cerrada');
  }

  /**
   * Welcome Controller API - Simula el flujo completo de BiAleseCorp
   * Replicando: Welcome::index() de BiAleseCorp
   */
  async getWelcomePage(page: string): Promise<any> {
    try {
      if (import.meta.env.VITE_APP_API_LOGS === 'true') {
        console.log('🏠 Welcome Controller - Cargando página:', page);
      }
      
      const response = await fetch(`${this.baseUrl}/welcome.php?page=${encodeURIComponent(page)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, message: 'Página no encontrada' };
        }
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (import.meta.env.VITE_APP_API_LOGS === 'true') {
        console.log('✅ Welcome Controller - Página cargada:', result.success);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error en Welcome Controller:', error);
      throw error;
    }
  }

  /**
   * Health Check API
   */
  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/health.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (import.meta.env.VITE_APP_API_LOGS === 'true') {
        console.log('🏥 Health Check:', result.success ? 'OK' : 'FAILED');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error en Health Check:', error);
      throw error;
    }
  }
}

// Exportar instancia única
export const aleseCorpApi = new AleseCorpApiService();
