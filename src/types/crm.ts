export interface Contact {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  jobTitle?: string
  leadSource?: string
  status?: string
  tags?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  userId: string
}

export interface Lead {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  jobTitle?: string
  leadSource?: string
  status?: string
  score?: number
  temperature?: string
  assignedTo?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  userId: string
}

export interface Opportunity {
  id: string
  name: string
  contactId?: string
  company?: string
  value?: number
  stage?: string
  probability?: number
  closeDate?: string
  leadSource?: string
  assignedTo?: string
  description?: string
  createdAt?: string
  updatedAt?: string
  userId: string
}

export interface Contract {
  id: string
  title: string
  contactId?: string
  opportunityId?: string
  contractType?: string
  value?: number
  status?: string
  startDate?: string
  endDate?: string
  templateId?: string
  hellosignSignatureRequestId?: string
  signedDate?: string
  documentUrl?: string
  createdAt?: string
  updatedAt?: string
  userId: string
}

export interface Integration {
  id: string
  name: string
  type: string
  status?: string
  config?: string
  lastSync?: string
  createdAt?: string
  updatedAt?: string
  userId: string
}

export interface Activity {
  id: string
  type: string
  subject: string
  description?: string
  contactId?: string
  leadId?: string
  opportunityId?: string
  contractId?: string
  dueDate?: string
  completed?: number
  createdAt?: string
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