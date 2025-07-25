export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'lead_generation' | 'pre_sales' | 'sales' | 'implementation' | 'finance';
  department?: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLogin?: string;
}

export interface Permission {
  module: string;
  permissions: string[];
}

export const ROLE_LABELS = {
  admin: 'Administrator',
  lead_generation: 'Lead Generation Team',
  pre_sales: 'Pre-Sales/Qualification Team',
  sales: 'Sales Team',
  implementation: 'Implementation Team',
  finance: 'Finance Team'
} as const;