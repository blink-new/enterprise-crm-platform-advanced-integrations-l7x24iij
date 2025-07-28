import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Target,
  Building2,
  CheckSquare,
  Calendar,
  BarChart3,
  Settings,
  Plug,
  CreditCard,
  Mail,
  FileText,
  ChevronLeft,
  ChevronRight,
  Shield,
  Kanban
} from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useAuth } from '../../hooks/useAuth'
import { ROLE_LABELS } from '../../types/auth'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Contacts', href: '/contacts', icon: Users, requiredModule: 'contacts' },
  { name: 'Leads', href: '/leads', icon: UserPlus, requiredModule: 'leads' },
  { name: 'Team Kanban', href: '/team-kanban', icon: Kanban, requiredModule: 'leads' },
  { name: 'Opportunities', href: '/opportunities', icon: Target, requiredModule: 'opportunities' },
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Contracts', href: '/contracts', icon: FileText, requiredModule: 'contracts' },
  { name: 'Reports', href: '/reports', icon: BarChart3, requiredModule: 'reports' },
  { name: 'Marketing', href: '/marketing', icon: Mail },
  { name: 'Billing', href: '/billing', icon: CreditCard, requiredModule: 'billing' },
  { name: 'Integrations', href: '/integrations', icon: Plug, requiredModule: 'integrations' },
  { name: 'Users', href: '/users', icon: Shield, requiredModule: 'users', adminOnly: true },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const { user, canAccess } = useAuth()

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      lead_generation: 'bg-green-100 text-green-800',
      pre_sales: 'bg-blue-100 text-blue-800',
      sales: 'bg-purple-100 text-purple-800',
      implementation: 'bg-orange-100 text-orange-800',
      finance: 'bg-yellow-100 text-yellow-800',
      data_team: 'bg-cyan-100 text-cyan-800',
      presales_team: 'bg-indigo-100 text-indigo-800',
      sales_team: 'bg-emerald-100 text-emerald-800'
    }
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  // Filter navigation items based on user permissions
  const filteredNavigation = navigation.filter(item => {
    // Always show items without module requirements
    if (!item.requiredModule) return true
    
    // Check if user has access to the module
    if (!canAccess(item.requiredModule)) return false
    
    // Check admin-only items
    if (item.adminOnly && user?.role !== 'admin') return false
    
    return true
  })

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CRM</span>
            </div>
            <span className="font-semibold text-gray-900">Enterprise CRM</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="p-1.5 h-auto"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("flex-shrink-0", collapsed ? "h-5 w-5" : "h-5 w-5 mr-3")} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      {!collapsed && user && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {getInitials(user.firstName, user.lastName)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                <Badge className={`text-xs ${getRoleBadgeColor(user.role)}`}>
                  {ROLE_LABELS[user.role]}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}