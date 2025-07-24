import React, { createContext, useContext, useState, useEffect } from 'react';
import { aleseCorpApi, User, LoginResponse } from '../services/aleseCorpApi_php_only';

interface AuthContextType {
  user: User | null;
  permissions: number[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Cargar datos del usuario desde localStorage al iniciar
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem('aleseCorpUser');
        const storedPermissions = localStorage.getItem('aleseCorpPermissions');
        
        if (storedUser && storedPermissions) {
          setUser(JSON.parse(storedUser));
          setPermissions(JSON.parse(storedPermissions));
          console.log('✅ Usuario cargado desde localStorage');
        }
      } catch (error) {
        console.error('❌ Error cargando datos del usuario:', error);
        // Limpiar datos corruptos
        localStorage.removeItem('aleseCorpUser');
        localStorage.removeItem('aleseCorpPermissions');
        localStorage.removeItem('aleseCorpToken');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  /**
   * Login directo - Sin fallbacks
   */
  const login = async (username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('🔐 Iniciando login directo para:', username);

      // Autenticar directamente
      const response: LoginResponse = await aleseCorpApi.authenticate(username, password);
      
      if (!response.success) {
        throw new Error(response.message || 'Credenciales incorrectas');
      }

      // Guardar datos en estado y localStorage
      setUser(response.user!);
      setPermissions(response.permissions!);
      
      localStorage.setItem('aleseCorpUser', JSON.stringify(response.user));
      localStorage.setItem('aleseCorpPermissions', JSON.stringify(response.permissions));
      localStorage.setItem('aleseCorpToken', response.token || '');
      
      console.log('✅ Login exitoso para:', response.user!.fullName);
      console.log('📋 Permisos asignados:', response.permissions!.length);
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      // Limpiar cualquier dato previo
      setUser(null);
      setPermissions([]);
      localStorage.removeItem('aleseCorpUser');
      localStorage.removeItem('aleseCorpPermissions');
      localStorage.removeItem('aleseCorpToken');
      
      // Relanzar el error para que lo maneje el componente
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cerrar sesión y limpiar todos los datos
   */
  const logout = () => {
    console.log('🔓 Cerrando sesión...');
    
    setUser(null);
    setPermissions([]);
    
    localStorage.removeItem('aleseCorpUser');
    localStorage.removeItem('aleseCorpPermissions');
    localStorage.removeItem('aleseCorpToken');
    
    console.log('✅ Sesión cerrada exitosamente');
  };

  const value: AuthContextType = {
    user,
    permissions,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
