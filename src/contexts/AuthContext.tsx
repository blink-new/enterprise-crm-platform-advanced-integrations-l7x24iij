import React, { useState, useEffect, ReactNode, useCallback } from 'react';
import { blink } from '../blink/client';
import { User, Permission } from '../types/auth';
import { AuthContext, AuthContextType } from './auth-context';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const generateSessionToken = (): string => {
    return `crm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const logAuditEvent = async (userId: string, action: string, module: string, recordId: string | null, details: any) => {
    try {
      await blink.db.auditLogs.create({
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        action,
        module,
        recordId,
        details: JSON.stringify(details),
        ipAddress: 'unknown', // In a real app, get from request
        userAgent: navigator.userAgent,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  };

  const loadUserPermissions = async (role: string) => {
    try {
      const rolePermissions = await blink.db.rolePermissions.list({
        where: { role }
      });

      const formattedPermissions: Permission[] = rolePermissions.map(rp => ({
        module: rp.module,
        permissions: JSON.parse(rp.permissions)
      }));

      setPermissions(formattedPermissions);
    } catch (error) {
      console.error('Failed to load permissions:', error);
      setPermissions([]);
    }
  };

  const verifyToken = async (token: string): Promise<User | null> => {
    try {
      // In a real app, this would verify the JWT token
      // For demo purposes, we'll simulate token verification
      const sessions = await blink.db.userSessions.list({
        where: { token, expiresAt: { gte: new Date().toISOString() } }
      });

      if (sessions.length === 0) {
        return null;
      }

      const session = sessions[0];
      const users = await blink.db.users.list({
        where: { id: session.userId, isActive: true }
      });

      if (users.length === 0) {
        return null;
      }

      const userData = users[0];
      return {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role as User['role'],
        department: userData.department,
        phone: userData.phone,
        avatarUrl: userData.avatarUrl,
        isActive: userData.isActive,
        lastLogin: userData.lastLogin
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  };

  const checkExistingSession = useCallback(async () => {
    try {
      const token = localStorage.getItem('crm_auth_token');
      if (token) {
        // Verify token and get user data
        const userData = await verifyToken(token);
        if (userData) {
          setUser(userData);
          await loadUserPermissions(userData.role);
        } else {
          localStorage.removeItem('crm_auth_token');
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
      localStorage.removeItem('crm_auth_token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check for existing session on app load
  useEffect(() => {
    checkExistingSession();
  }, [checkExistingSession]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      // Find user by email
      const users = await blink.db.users.list({
        where: { email: email.toLowerCase(), isActive: true }
      });

      if (users.length === 0) {
        return { success: false, error: 'Invalid email or password' };
      }

      const userData = users[0];

      // Demo user credentials mapping
      const demoCredentials: Record<string, string> = {
        'admin@company.com': 'admin123',
        'leadgen@company.com': 'leadgen123', 
        'presales@company.com': 'presales123',
        'sales@company.com': 'sales123',
        'implementation@company.com': 'impl123',
        'finance@company.com': 'finance123',
        'data@company.com': 'data123'
      };

      // For demo purposes, check if password matches expected demo password
      const expectedPassword = demoCredentials[email.toLowerCase()];
      if (expectedPassword && password !== expectedPassword) {
        return { success: false, error: 'Invalid email or password' };
      }
      
      // In production, use bcrypt.compare(password, userData.passwordHash)

      // Create session token
      const sessionToken = generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

      // Save session to database
      await blink.db.userSessions.create({
        id: `session_${Date.now()}`,
        userId: userData.id,
        token: sessionToken,
        expiresAt: expiresAt.toISOString()
      });

      // Update last login
      await blink.db.users.update(userData.id, {
        lastLogin: new Date().toISOString()
      });

      // Store token in localStorage
      localStorage.setItem('crm_auth_token', sessionToken);

      // Set user data
      const user: User = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role as User['role'],
        department: userData.department,
        phone: userData.phone,
        avatarUrl: userData.avatarUrl,
        isActive: userData.isActive,
        lastLogin: new Date().toISOString()
      };

      setUser(user);
      await loadUserPermissions(user.role);

      // Log audit event
      await logAuditEvent(user.id, 'login', 'auth', null, { email });

      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('crm_auth_token');
      if (token && user) {
        // Remove session from database
        const sessions = await blink.db.userSessions.list({
          where: { token }
        });
        
        if (sessions.length > 0) {
          await blink.db.userSessions.delete(sessions[0].id);
        }

        // Log audit event
        await logAuditEvent(user.id, 'logout', 'auth', null, {});
      }

      // Clear local storage
      localStorage.removeItem('crm_auth_token');
      
      // Clear state
      setUser(null);
      setPermissions([]);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const hasPermission = (module: string, permission: string): boolean => {
    if (!user) return false;
    
    const modulePermissions = permissions.find(p => p.module === module);
    return modulePermissions?.permissions.includes(permission) || false;
  };

  const canAccess = (module: string): boolean => {
    if (!user) return false;
    
    return permissions.some(p => p.module === module && p.permissions.length > 0);
  };

  const value: AuthContextType = {
    user,
    permissions,
    isLoading,
    login,
    logout,
    hasPermission,
    canAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};