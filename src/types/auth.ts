export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'lead_generation' | 'pre_sales' | 'sales' | 'implementation' | 'finance' | 'data_team' | 'presales_team' | 'sales_team';
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
  finance: 'Finance Team',
  data_team: 'Data Team',
  presales_team: 'Pre-Sales Team',
  sales_team: 'Sales Team'
} as const;