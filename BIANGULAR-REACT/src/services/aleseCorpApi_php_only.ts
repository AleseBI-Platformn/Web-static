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
  message?: string;
}

class AleseCorpApiService {
  // SOLO PHP - para local (con servidor PHP) y Bluehost
  private baseUrl = '/api';

  /**
   * Autenticar usuario usando PHP directo
   */
  async authenticate(username: string, password: string): Promise<LoginResponse> {
    try {
      console.log('🔐 Autenticando con PHP:', username);
      console.log('🌐 Endpoint:', `${this.baseUrl}/login_dual.php`);
      
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
        console.log('✅ Autenticación exitosa:', result.user.fullName);
        console.log('📋 Permisos obtenidos:', result.permissions.length);
        
        // Guardar en localStorage
        localStorage.setItem('aleseCorpUser', JSON.stringify(result.user));
        localStorage.setItem('aleseCorpPermissions', JSON.stringify(result.permissions));
        localStorage.setItem('aleseCorpToken', result.token);
      } else {
        console.log('❌ Autenticación fallida:', result.message);
        throw new Error(result.message || 'Credenciales incorrectas');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error en autenticación:', error);
      throw error;
    }
  }

  /**
   * Obtener menús usando PHP directo
   */
  async getMenus(permissions: number[]): Promise<MenuItem[]> {
    try {
      console.log('📋 Obteniendo menús con PHP:', permissions);
      console.log('🌐 Endpoint:', `${this.baseUrl}/menus_dual.php`);
      
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
        console.log('✅ Menús obtenidos:', result.total);
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
}

// Exportar instancia única
export const aleseCorpApi = new AleseCorpApiService();
