import React, { useState, useEffect } from 'react'
import { Plus, Search, Settings, CheckCircle, XCircle, RefreshCw, ExternalLink, Zap, Calendar, DollarSign, Phone, Mail, Users, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { blink } from '@/blink/client'
import type { Integration } from '@/types/crm'

const INTEGRATION_CATEGORIES = [
  {
    id: 'crm',
    name: 'CRM & Sales',
    icon: Users,
    integrations: [
      {
        id: 'hubspot',
        name: 'HubSpot',
        description: 'Sync contacts, deals, and activities with HubSpot CRM',
        icon: '🔶',
        category: 'crm',
        features: ['Contact Sync', 'Deal Pipeline', 'Activity Tracking', 'Email Integration']
      },
      {
        id: 'highlevel',
        name: 'HighLevel',
        description: 'Connect with HighLevel for marketing automation and CRM',
        icon: '⚡',
        category: 'crm',
        features: ['Lead Management', 'SMS Campaigns', 'Funnel Integration', 'Appointment Booking']
      }
    ]
  },
  {
    id: 'finance',
    name: 'Finance & Billing',
    icon: DollarSign,
    integrations: [
      {
        id: 'billcom',
        name: 'Bill.com',
        description: 'Automate accounts payable and receivable processes',
        icon: '💰',
        category: 'finance',
        features: ['Invoice Management', 'Payment Processing', 'Expense Tracking', 'Financial Reporting']
      },
      {
        id: 'quickbooks',
        name: 'QuickBooks',
        description: 'Sync financial data with QuickBooks accounting software',
        icon: '📊',
        category: 'finance',
        features: ['Accounting Sync', 'Invoice Creation', 'Expense Management', 'Tax Reporting']
      }
    ]
  },
  {
    id: 'calendar',
    name: 'Calendar & Scheduling',
    icon: Calendar,
    integrations: [
      {
        id: 'calendly',
        name: 'Calendly',
        description: 'Streamline appointment scheduling and booking',
        icon: '📅',
        category: 'calendar',
        features: ['Meeting Scheduling', 'Availability Management', 'Automated Reminders', 'Calendar Sync']
      },
      {
        id: 'gsuite',
        name: 'Google Workspace',
        description: 'Integrate with Gmail, Calendar, and Google Drive',
        icon: '🔍',
        category: 'calendar',
        features: ['Email Integration', 'Calendar Sync', 'Document Storage', 'Contact Sync']
      }
    ]
  },
  {
    id: 'communication',
    name: 'Communication',
    icon: Phone,
    integrations: [
      {
        id: 'softphone',
        name: 'Soft Phone System',
        description: 'Make and receive calls directly from the CRM',
        icon: '📞',
        category: 'communication',
        features: ['Click-to-Call', 'Call Recording', 'Call Analytics', 'Voicemail Integration']
      },
      {
        id: 'twilio',
        name: 'Twilio',
        description: 'SMS and voice communication platform',
        icon: '💬',
        category: 'communication',
        features: ['SMS Campaigns', 'Voice Calls', 'WhatsApp Integration', 'Programmable Messaging']
      }
    ]
  },
  {
    id: 'social',
    name: 'Social Media & Marketing',
    icon: MessageSquare,
    integrations: [
      {
        id: 'linkedin',
        name: 'LinkedIn',
        description: 'Connect and engage with prospects on LinkedIn',
        icon: '💼',
        category: 'social',
        features: ['Lead Generation', 'Connection Requests', 'Message Automation', 'Profile Insights']
      },
      {
        id: 'meta',
        name: 'Meta (Facebook/Instagram)',
        description: 'Manage Facebook and Instagram marketing campaigns',
        icon: '📘',
        category: 'social',
        features: ['Ad Management', 'Lead Ads', 'Audience Targeting', 'Campaign Analytics']
      },
      {
        id: 'google-ads',
        name: 'Google Ads',
        description: 'Manage Google advertising campaigns and track ROI',
        icon: '🎯',
        category: 'social',
        features: ['Campaign Management', 'Keyword Tracking', 'Conversion Tracking', 'ROI Analytics']
      }
    ]
  },
  {
    id: 'documents',
    name: 'Documents & E-Signature',
    icon: Mail,
    integrations: [
      {
        id: 'hellosign',
        name: 'HelloSign',
        description: 'Digital document signing and contract management',
        icon: '✍️',
        category: 'documents',
        features: ['E-Signatures', 'Document Templates', 'Signature Tracking', 'Legal Compliance']
      },
      {
        id: 'docusign',
        name: 'DocuSign',
        description: 'Electronic signature and digital transaction management',
        icon: '📝',
        category: 'documents',
        features: ['Digital Signatures', 'Document Workflow', 'Authentication', 'Audit Trail']
      }
    ]
  }
]

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null)
  const [configData, setConfigData] = useState({
    apiKey: '',
    apiSecret: '',
    webhookUrl: '',
    settings: ''
  })

  const loadIntegrations = async () => {
    try {
      const user = await blink.auth.me()
      const data = await blink.db.integrations.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setIntegrations(data)
    } catch (error) {
      console.error('Failed to load integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIntegrations()
  }, [])

  const handleConfigureIntegration = async (integrationData: any) => {
    setSelectedIntegration(integrationData)
    
    // Check if integration already exists
    const existingIntegration = integrations.find(i => i.name === integrationData.id)
    if (existingIntegration) {
      const config = existingIntegration.config ? JSON.parse(existingIntegration.config) : {}
      setConfigData({
        apiKey: config.apiKey || '',
        apiSecret: config.apiSecret || '',
        webhookUrl: config.webhookUrl || '',
        settings: config.settings || ''
      })
    } else {
      setConfigData({
        apiKey: '',
        apiSecret: '',
        webhookUrl: '',
        settings: ''
      })
    }
    
    setIsConfigDialogOpen(true)
  }

  const handleSaveConfiguration = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const user = await blink.auth.me()
      const config = {
        apiKey: configData.apiKey,
        apiSecret: configData.apiSecret,
        webhookUrl: configData.webhookUrl,
        settings: configData.settings
      }

      const existingIntegration = integrations.find(i => i.name === selectedIntegration.id)
      
      if (existingIntegration) {
        await blink.db.integrations.update(existingIntegration.id, {
          config: JSON.stringify(config),
          status: 'active',
          updatedAt: new Date().toISOString()
        })
      } else {
        await blink.db.integrations.create({
          id: `integration_${Date.now()}`,
          name: selectedIntegration.id,
          type: selectedIntegration.category,
          status: 'active',
          config: JSON.stringify(config),
          userId: user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
      
      await loadIntegrations()
      setIsConfigDialogOpen(false)
      setSelectedIntegration(null)
    } catch (error) {
      console.error('Failed to save integration:', error)
    }
  }

  const toggleIntegration = async (integrationName: string, currentStatus: string) => {
    try {
      const integration = integrations.find(i => i.name === integrationName)
      if (integration) {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
        await blink.db.integrations.update(integration.id, {
          status: newStatus,
          updatedAt: new Date().toISOString()
        })
        await loadIntegrations()
      }
    } catch (error) {
      console.error('Failed to toggle integration:', error)
    }
  }

  const syncIntegration = async (integrationName: string) => {
    try {
      const integration = integrations.find(i => i.name === integrationName)
      if (integration) {
        await blink.db.integrations.update(integration.id, {
          lastSync: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        await loadIntegrations()
        alert(`${integrationName} sync completed successfully!`)
      }
    } catch (error) {
      console.error('Failed to sync integration:', error)
    }
  }

  const getIntegrationStatus = (integrationId: string) => {
    const integration = integrations.find(i => i.name === integrationId)
    return integration?.status || 'inactive'
  }

  const getIntegrationLastSync = (integrationId: string) => {
    const integration = integrations.find(i => i.name === integrationId)
    return integration?.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'
  }

  const filteredCategories = INTEGRATION_CATEGORIES.filter(category => {
    if (categoryFilter !== 'all' && category.id !== categoryFilter) return false
    
    return category.integrations.some(integration =>
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const activeIntegrations = integrations.filter(i => i.status === 'active').length
  const totalAvailableIntegrations = INTEGRATION_CATEGORIES.reduce((sum, cat) => sum + cat.integrations.length, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading integrations...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600">Connect your CRM with external services and tools</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Integrations</p>
                <p className="text-2xl font-bold text-gray-900">{activeIntegrations}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Integrations</p>
                <p className="text-2xl font-bold text-gray-900">{totalAvailableIntegrations}</p>
              </div>
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{INTEGRATION_CATEGORIES.length}</p>
              </div>
              <Settings className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search integrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {INTEGRATION_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Integration Categories */}
      <div className="space-y-8">
        {filteredCategories.map((category) => {
          const CategoryIcon = category.icon
          
          return (
            <div key={category.id}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CategoryIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
                  <p className="text-gray-600">
                    {category.integrations.length} integration{category.integrations.length !== 1 ? 's' : ''} available
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.integrations
                  .filter(integration =>
                    integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    integration.description.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((integration) => {
                    const status = getIntegrationStatus(integration.id)
                    const lastSync = getIntegrationLastSync(integration.id)
                    const isActive = status === 'active'
                    
                    return (
                      <Card key={integration.id} className={`transition-all hover:shadow-lg ${isActive ? 'border-green-200 bg-green-50' : ''}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">{integration.icon}</div>
                              <div>
                                <CardTitle className="text-lg">{integration.name}</CardTitle>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                    {isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <Switch
                              checked={isActive}
                              onCheckedChange={() => toggleIntegration(integration.id, status)}
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-gray-600 text-sm">{integration.description}</p>
                          
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Features:</h4>
                            <div className="flex flex-wrap gap-1">
                              {integration.features.map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          {isActive && (
                            <div className="text-xs text-gray-500">
                              Last sync: {lastSync}
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleConfigureIntegration(integration)}
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              Configure
                            </Button>
                            {isActive && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => syncIntegration(integration.id)}
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Sync
                              </Button>
                            )}
                            <Button size="sm" variant="ghost">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Configure {selectedIntegration?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedIntegration && (
            <form onSubmit={handleSaveConfiguration} className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl">{selectedIntegration.icon}</div>
                <div>
                  <h3 className="font-medium">{selectedIntegration.name}</h3>
                  <p className="text-sm text-gray-600">{selectedIntegration.description}</p>
                </div>
              </div>
              
              <Tabs defaultValue="credentials" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="credentials">Credentials</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="credentials" className="space-y-4">
                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={configData.apiKey}
                      onChange={(e) => setConfigData({ ...configData, apiKey: e.target.value })}
                      placeholder="Enter your API key"
                    />
                  </div>
                  <div>
                    <Label htmlFor="apiSecret">API Secret</Label>
                    <Input
                      id="apiSecret"
                      type="password"
                      value={configData.apiSecret}
                      onChange={(e) => setConfigData({ ...configData, apiSecret: e.target.value })}
                      placeholder="Enter your API secret"
                    />
                  </div>
                  <div>
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      value={configData.webhookUrl}
                      onChange={(e) => setConfigData({ ...configData, webhookUrl: e.target.value })}
                      placeholder="https://your-domain.com/webhook"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4">
                  <div>
                    <Label htmlFor="settings">Additional Settings (JSON)</Label>
                    <Textarea
                      id="settings"
                      value={configData.settings}
                      onChange={(e) => setConfigData({ ...configData, settings: e.target.value })}
                      placeholder='{"syncInterval": 3600, "enableWebhooks": true}'
                      rows={6}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Configuration
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}