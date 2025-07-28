import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  UserPlus,
  Target,
  DollarSign,
  TrendingUp,
  CheckSquare,
  FileText,
  Calendar,
  Phone,
  Mail,
  MoreHorizontal
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { blink } from '@/blink/client'
import type { DashboardMetrics, Activity } from '@/types/crm'

const COLORS = ['#2563EB', '#F59E42', '#10B981', '#EF4444', '#8B5CF6']

const revenueData = [
  { month: 'Jan', revenue: 45000, target: 50000 },
  { month: 'Feb', revenue: 52000, target: 55000 },
  { month: 'Mar', revenue: 48000, target: 50000 },
  { month: 'Apr', revenue: 61000, target: 60000 },
  { month: 'May', revenue: 55000, target: 58000 },
  { month: 'Jun', revenue: 67000, target: 65000 },
]

const pipelineData = [
  { name: 'Prospecting', value: 35, count: 12 },
  { name: 'Qualification', value: 25, count: 8 },
  { name: 'Proposal', value: 20, count: 6 },
  { name: 'Negotiation', value: 15, count: 4 },
  { name: 'Closed Won', value: 5, count: 2 },
]

const leadSourceData = [
  { source: 'Website', leads: 45 },
  { source: 'Referral', leads: 32 },
  { source: 'Social Media', leads: 28 },
  { source: 'Email Campaign', leads: 22 },
  { source: 'Cold Calling', leads: 18 },
]

export function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalContacts: 1247,
    totalLeads: 89,
    totalOpportunities: 32,
    totalRevenue: 387500,
    conversionRate: 24.5,
    activeTasks: 15,
    pendingContracts: 7,
    recentActivity: []
  })

  const [recentActivity] = useState<Activity[]>([
    {
      id: '1',
      type: 'contact_created',
      title: 'New contact added',
      description: 'Sarah Johnson from TechCorp was added to contacts',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      userId: 'user1'
    },
    {
      id: '2',
      type: 'opportunity_won',
      title: 'Deal closed',
      description: 'Enterprise Software License - $45,000',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      userId: 'user1'
    },
    {
      id: '3',
      type: 'lead_converted',
      title: 'Lead converted',
      description: 'Michael Chen converted to opportunity',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      userId: 'user1'
    },
    {
      id: '4',
      type: 'contract_signed',
      title: 'Contract signed',
      description: 'Annual maintenance contract executed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      userId: 'user1'
    },
    {
      id: '5',
      type: 'task_completed',
      title: 'Task completed',
      description: 'Follow-up call with Acme Corp completed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      userId: 'user1'
    }
  ])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'contact_created':
        return <Users className="h-4 w-4 text-blue-600" />
      case 'lead_converted':
        return <UserPlus className="h-4 w-4 text-green-600" />
      case 'opportunity_won':
        return <Target className="h-4 w-4 text-green-600" />
      case 'task_completed':
        return <CheckSquare className="h-4 w-4 text-blue-600" />
      case 'contract_signed':
        return <FileText className="h-4 w-4 text-purple-600" />
      default:
        return <Users className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your CRM.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            This Month
          </Button>
          <Button size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Contacts</p>
                <p className="text-3xl font-bold">{metrics.totalContacts.toLocaleString()}</p>
                <p className="text-blue-100 text-sm">+12% from last month</p>
              </div>
              <Users className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Leads</p>
                <p className="text-3xl font-bold">{metrics.totalLeads}</p>
                <p className="text-green-100 text-sm">+8% from last month</p>
              </div>
              <UserPlus className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Opportunities</p>
                <p className="text-3xl font-bold">{metrics.totalOpportunities}</p>
                <p className="text-orange-100 text-sm">+15% from last month</p>
              </div>
              <Target className="h-12 w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Revenue</p>
                <p className="text-3xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
                <p className="text-purple-100 text-sm">+22% from last month</p>
              </div>
              <DollarSign className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Revenue vs Target
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" fill="#2563EB" name="Revenue" />
                <Bar dataKey="target" fill="#E5E7EB" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Sales Pipeline
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pipelineData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, count }) => `${name} (${count})`}
                >
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={leadSourceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="source" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="leads" fill="#F59E42" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Conversion Rate</span>
              </div>
              <Badge variant="secondary">{metrics.conversionRate}%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckSquare className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Active Tasks</span>
              </div>
              <Badge variant="secondary">{metrics.activeTasks}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Pending Contracts</span>
              </div>
              <Badge variant="secondary">{metrics.pendingContracts}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Calls Today</span>
              </div>
              <Badge variant="secondary">23</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Emails Sent</span>
              </div>
              <Badge variant="secondary">156</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}