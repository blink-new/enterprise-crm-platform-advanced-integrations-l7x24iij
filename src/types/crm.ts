export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  title?: string
  status: 'active' | 'inactive' | 'prospect'
  leadSource?: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
  userId: string
}

export interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  title?: string
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted'
  leadSource: string
  score?: number
  assignedTo?: string
  createdAt: string
  updatedAt: string
  userId: string
}

export interface Opportunity {
  id: string
  name: string
  accountName: string
  contactId?: string
  stage: 'prospecting' | 'qualification' | 'needs-analysis' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'
  amount: number
  probability: number
  closeDate: string
  assignedTo?: string
  description?: string
  createdAt: string
  updatedAt: string
  userId: string
}

export interface Company {
  id: string
  name: string
  industry?: string
  website?: string
  phone?: string
  email?: string
  address?: string
  employees?: number
  revenue?: number
  status: 'prospect' | 'customer' | 'partner' | 'inactive'
  assignedTo?: string
  createdAt: string
  updatedAt: string
  userId: string
}

export interface Task {
  id: string
  title: string
  description?: string
  type: 'call' | 'email' | 'meeting' | 'follow-up' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  dueDate: string
  assignedTo?: string
  relatedTo?: string
  relatedType?: 'contact' | 'lead' | 'opportunity' | 'company'
  createdAt: string
  updatedAt: string
  userId: string
}

export interface Contract {
  id: string
  title: string
  clientName: string
  clientEmail: string
  amount: number
  status: 'draft' | 'sent' | 'signed' | 'completed' | 'cancelled'
  templateId?: string
  signatureStatus: 'pending' | 'partial' | 'complete'
  sentDate?: string
  signedDate?: string
  expiryDate?: string
  helloSignId?: string
  createdAt: string
  updatedAt: string
  userId: string
}

export interface Integration {
  id: string
  name: string
  type: 'crm' | 'calendar' | 'email' | 'social' | 'finance' | 'communication' | 'signature'
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: string
  settings?: Record<string, any>
  userId: string
}

export interface DashboardMetrics {
  totalContacts: number
  totalLeads: number
  totalOpportunities: number
  totalRevenue: number
  conversionRate: number
  activeTasks: number
  pendingContracts: number
  recentActivity: Activity[]
}

export interface Activity {
  id: string
  type: 'contact_created' | 'lead_converted' | 'opportunity_won' | 'task_completed' | 'contract_signed'
  title: string
  description: string
  timestamp: string
  userId: string
  relatedTo?: string
  relatedType?: string
}