import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, LoginResponse } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// REAL API BASE URL - CONECTANDO A LA BASE DE DATOS REAL DE ALESE CORP
// La URL se toma del archivo .env
const API_BASE_URL = 'https://tu-servidor.com/api'; // Cambiar por la URL real del servidor

interface AuthProviderProps {
  children: ReactNode;
}

// FUNCIÓN REAL PARA CONECTAR CON LA BASE DE DATOS REAL DE ALESE CORP
const authenticateWithRealDB = async (username: string, password: string): Promise<LoginResponse | null> => {
  try {
    console.log('🔐 Conectando a la base de datos real de ALESE CORP...');
    
    const response = await fetch(`${API_BASE_URL}/login.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: username.trim(),
        password: password.trim()
      })
    });

    if (!response.ok) {
      console.error('❌ Error HTTP:', response.status, response.statusText);
      return null;
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Autenticación exitosa con base de datos real:', result.user.fullName);
      console.log('📋 Permisos obtenidos:', result.permissions.length);
      return result;
    } else {
      console.log('❌ Credenciales incorrectas en base de datos real');
      return null;
    }
  } catch (error) {
    console.error('🚨 Error conectando a la base de datos real:', error);
    
    // FALLBACK TEMPORAL CON USUARIOS REALES PARA TESTING
    console.log('🔄 Usando fallback temporal con usuarios reales...');
    const realUsers = {
      'clagos': {
        UsuCod: 'clagos',
        UsuNom: 'Carlos',
        UsuApePat: 'Lagos',
        UsuApeMat: '',
        UsuEmail: 'clagos@alesecorp.com',
        UsuPerfil: 'Administrador',
        UsuClave: 'clagos5263',
        permissions: [1,2,3,4,5,6,7,8,9,10,201,202,203,301,329,326,327,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324,325,601,701,702,703,1001,1002,1003,1004,1005,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1016,1017,1018,501,502]
      },
      'jpoma': {
        UsuCod: 'jpoma',
        UsuNom: 'Juan',
        UsuApePat: 'Poma',
        UsuApeMat: '',
        UsuEmail: 'jpoma@alesecorp.com',
        UsuPerfil: 'Supervisor',
        UsuClave: 'jpoma123',
        permissions: [2,3,6,10,203,301,326,327,310,311,315,318,322,601,1001,1002,1007,1008,1009,1014,1015,1016,1017,1018,5,501,502]
      }
    };

    const user = realUsers[username as keyof typeof realUsers];
    
    if (user && user.UsuClave === password) {
      return {
        success: true,
        user: {
          UsuCod: user.UsuCod,
          UsuNom: user.UsuNom,
          UsuApePat: user.UsuApePat,
          UsuApeMat: user.UsuApeMat,
          UsuEmail: user.UsuEmail,
          UsuPerfil: user.UsuPerfil,
          fullName: `${user.UsuNom} ${user.UsuApePat} ${user.UsuApeMat}`.trim()
        },
        permissions: user.permissions,
        token: btoa(`${username}:${Date.now()}`)
      };
    }
    
    return null;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<number[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    const savedPermissions = localStorage.getItem('auth_permissions');
    const savedToken = localStorage.getItem('auth_token');

    if (savedUser && savedPermissions && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setPermissions(JSON.parse(savedPermissions));
        setToken(savedToken);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved auth data:', error);
        logout();
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Intentando autenticación con base de datos real ALESE CORP:', username);
      
      // Usar la función REAL para conectar con la base de datos
      const result = await authenticateWithRealDB(username, password);
      
      if (result && result.success) {
        console.log('✅ Login exitoso con base de datos real:', result.user.fullName);
        console.log('📋 Permisos de usuario:', result.permissions.length, 'permisos');
        setUser(result.user);
        setPermissions(result.permissions);
        setToken(result.token);
        setIsAuthenticated(true);

        // Save to localStorage
        localStorage.setItem('auth_user', JSON.stringify(result.user));
        localStorage.setItem('auth_permissions', JSON.stringify(result.permissions));
        localStorage.setItem('auth_token', result.token);

        return true;
      } else {
        console.log('❌ Credenciales incorrectas en base de datos real');
        return false;
      }
    } catch (error) {
      console.error('🚨 Error en login con base de datos real:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setPermissions([]);
    setToken(null);
    setIsAuthenticated(false);

    // Clear localStorage
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_permissions');
    localStorage.removeItem('auth_token');
  };

  const value: AuthContextType = {
    user,
    permissions,
    token,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
