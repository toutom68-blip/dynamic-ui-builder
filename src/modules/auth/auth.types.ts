export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  language?: string;
  roles?: string[];
  [key: string]: any;
}

export interface AuthResponse {
  user?: User;
  access_token?: string;
  refreshToken?: string;
  message?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}
