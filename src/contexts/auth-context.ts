import { createContext } from 'react';
import { User, Permission } from '../types/auth';

export interface AuthContextType {
  user: User | null;
  permissions: Permission[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (module: string, permission: string) => boolean;
  canAccess: (module: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);