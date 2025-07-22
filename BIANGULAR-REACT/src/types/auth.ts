export interface User {
  UsuCod: string;
  UsuNom: string;
  UsuApePat: string;
  UsuApeMat: string;
  UsuEmail: string;
  UsuPerfil: string;
  fullName: string;
}

export interface Menu {
  idmenu: number;
  menu: string;
  vista: string;
  icono: string;
  estado: string;
  url: string;
  ancho: string;
  alto: string;
  parent: number | null;
  children: Menu[];
}

export interface LoginResponse {
  success: boolean;
  user: User;
  permissions: number[];
  token: string;
}

export interface MenusResponse {
  success: boolean;
  menus: Menu[];
  total: number;
}

export interface AuthContextType {
  user: User | null;
  permissions: number[];
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}
