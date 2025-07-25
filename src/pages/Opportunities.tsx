import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreHorizontal, DollarSign, Calendar, User, Edit, Trash2, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { blink } from '@/blink/client'
import type { Opportunity } from '@/types/crm'

const STAGES = [
  { id: 'prospecting', name: 'Prospecting', color: 'bg-blue-100 text-blue-800' },
  { id: 'qualification', name: 'Qualification', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'proposal', name: 'Proposal', color: 'bg-orange-100 text-orange-800' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-purple-100 text-purple-800' },
  { id: 'closed-won', name: 'Closed Won', color: 'bg-green-100 text-green-800' },
  { id: 'closed-lost', name: 'Closed Lost', color: 'bg-red-100 text-red-800' }
]

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null)
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')
  const [formData, setFormData] = useState({
    name: '',
    contactId: '',
    company: '',
    value: 0,
    stage: 'prospecting',
    probability: 0,
    closeDate: '',
    leadSource: '',
    assignedTo: '',
    description: ''
  })

  const loadOpportunities = async () => {
    try {
      const user = await blink.auth.me()
      const [oppData, contactData] = await Promise.all([
        blink.db.opportunities.list({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        }),
        blink.db.contacts.list({
          where: { userId: user.id }
        })
      ])
      setOpportunities(oppData)
      setContacts(contactData)
    } catch (error) {
      console.error('Failed to load opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      contactId: '',
      company: '',
      value: 0,
      stage: 'prospecting',
      probability: 0,
      closeDate: '',
      leadSource: '',
      assignedTo: '',
      description: ''
    })
  }

  useEffect(() => {
    loadOpportunities()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const user = await blink.auth.me()
      
      if (editingOpportunity) {
        await blink.db.opportunities.update(editingOpportunity.id, {
          name: formData.name,
          contactId: formData.contactId,
          company: formData.company,
          value: formData.value,
          stage: formData.stage,
          probability: formData.probability,
          closeDate: formData.closeDate,
          leadSource: formData.leadSource,
          assignedTo: formData.assignedTo,
          description: formData.description,
          updatedAt: new Date().toISOString()
        })
      } else {
        await blink.db.opportunities.create({
          id: `opportunity_${Date.now()}`,
          name: formData.name,
          contactId: formData.contactId,
          company: formData.company,
          value: formData.value,
          stage: formData.stage,
          probability: formData.probability,
          closeDate: formData.closeDate,
          leadSource: formData.leadSource,
          assignedTo: formData.assignedTo,
          description: formData.description,
          userId: user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
      
      await loadOpportunities()
      setIsCreateDialogOpen(false)
      setEditingOpportunity(null)
      resetForm()
    } catch (error) {
      console.error('Failed to save opportunity:', error)
    }
  }

  const handleDelete = async (opportunityId: string) => {
    if (confirm('Are you sure you want to delete this opportunity?')) {
      try {
        await blink.db.opportunities.delete(opportunityId)
        await loadOpportunities()
      } catch (error) {
        console.error('Failed to delete opportunity:', error)
      }
    }
  }

  const updateStage = async (opportunityId: string, newStage: string) => {
    try {
      await blink.db.opportunities.update(opportunityId, {
        stage: newStage,
        updatedAt: new Date().toISOString()
      })
      await loadOpportunities()
    } catch (error) {
      console.error('Failed to update stage:', error)
    }
  }

  const openEditDialog = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity)
    setFormData({
      name: opportunity.name || '',
      contactId: opportunity.contactId || '',
      company: opportunity.company || '',
      value: opportunity.value || 0,
      stage: opportunity.stage || 'prospecting',
      probability: opportunity.probability || 0,
      closeDate: opportunity.closeDate || '',
      leadSource: opportunity.leadSource || '',
      assignedTo: opportunity.assignedTo || '',
      description: opportunity.description || ''
    })
    setIsCreateDialogOpen(true)
  }

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = `${opp.name} ${opp.company} ${opp.assignedTo}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesStage = stageFilter === 'all' || opp.stage === stageFilter
    return matchesSearch && matchesStage
  })

  const getStageColor = (stage: string) => {
    const stageObj = STAGES.find(s => s.id === stage)
    return stageObj?.color || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId)
    return contact ? `${contact.firstName} ${contact.lastName}` : 'N/A'
  }

  const totalValue = filteredOpportunities.reduce((sum, opp) => sum + (opp.value || 0), 0)
  const wonOpportunities = filteredOpportunities.filter(opp => opp.stage === 'closed-won')
  const wonValue = wonOpportunities.reduce((sum, opp) => sum + (opp.value || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading opportunities...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Opportunities</h1>
          <p className="text-gray-600">Track your sales pipeline and deals</p>
        </div>
        <div className="flex items-center space-x-4">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'kanban' | 'table')}>
            <TabsList>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
          </Tabs>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingOpportunity(null) }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Opportunity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingOpportunity ? 'Edit Opportunity' : 'Create New Opportunity'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Opportunity Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactId">Contact</Label>
                    <Select value={formData.contactId} onValueChange={(value) => setFormData({ ...formData, contactId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select contact" />
                      </SelectTrigger>
                      <SelectContent>
                        {contacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.firstName} {contact.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="value">Value ($)</Label>
                    <Input
                      id="value"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="probability">Probability (%)</Label>
                    <Input
                      id="probability"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.probability}
                      onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stage">Stage</Label>
                    <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGES.map((stage) => (
                          <SelectItem key={stage.id} value={stage.id}>
                            {stage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="closeDate">Expected Close Date</Label>
                    <Input
                      id="closeDate"
                      type="date"
                      value={formData.closeDate}
                      onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="leadSource">Lead Source</Label>
                    <Select value={formData.leadSource} onValueChange={(value) => setFormData({ ...formData, leadSource: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="social-media">Social Media</SelectItem>
                        <SelectItem value="cold-call">Cold Call</SelectItem>
                        <SelectItem value="email-campaign">Email Campaign</SelectItem>
                        <SelectItem value="trade-show">Trade Show</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="assignedTo">Assigned To</Label>
                    <Input
                      id="assignedTo"
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingOpportunity ? 'Update Opportunity' : 'Create Opportunity'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pipeline</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Won Deals</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(wonValue)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Opportunities</p>
                <p className="text-2xl font-bold text-gray-900">{filteredOpportunities.length}</p>
              </div>
              <User className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Win Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredOpportunities.length > 0 
                    ? Math.round((wonOpportunities.length / filteredOpportunities.length) * 100)
                    : 0}%
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
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
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {STAGES.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {STAGES.map((stage) => {
            const stageOpportunities = filteredOpportunities.filter(opp => opp.stage === stage.id)
            const stageValue = stageOpportunities.reduce((sum, opp) => sum + (opp.value || 0), 0)
            
            return (
              <Card key={stage.id} className="h-fit">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
                    <Badge variant="secondary">{stageOpportunities.length}</Badge>
                  </div>
                  <p className="text-xs text-gray-500">{formatCurrency(stageValue)}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stageOpportunities.map((opportunity) => (
                    <Card key={opportunity.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">{opportunity.name}</h4>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(opportunity)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              {STAGES.filter(s => s.id !== opportunity.stage).map((targetStage) => (
                                <DropdownMenuItem 
                                  key={targetStage.id}
                                  onClick={() => updateStage(opportunity.id, targetStage.id)}
                                >
                                  Move to {targetStage.name}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuItem 
                                onClick={() => handleDelete(opportunity.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-xs text-gray-500">{opportunity.company}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-600">
                            {formatCurrency(opportunity.value || 0)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {opportunity.probability || 0}%
                          </span>
                        </div>
                        <Progress value={opportunity.probability || 0} className="h-1" />
                        {opportunity.closeDate && (
                          <p className="text-xs text-gray-500">
                            Close: {new Date(opportunity.closeDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Opportunities ({filteredOpportunities.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Contact</th>
                    <th className="text-left p-2">Company</th>
                    <th className="text-left p-2">Value</th>
                    <th className="text-left p-2">Stage</th>
                    <th className="text-left p-2">Probability</th>
                    <th className="text-left p-2">Close Date</th>
                    <th className="text-left p-2">Assigned To</th>
                    <th className="text-right p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOpportunities.map((opportunity) => (
                    <tr key={opportunity.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{opportunity.name}</td>
                      <td className="p-2">{getContactName(opportunity.contactId || '')}</td>
                      <td className="p-2">{opportunity.company || 'N/A'}</td>
                      <td className="p-2 font-medium text-green-600">
                        {formatCurrency(opportunity.value || 0)}
                      </td>
                      <td className="p-2">
                        <Badge className={getStageColor(opportunity.stage || 'prospecting')}>
                          {STAGES.find(s => s.id === opportunity.stage)?.name || 'Prospecting'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <Progress value={opportunity.probability || 0} className="w-16 h-2" />
                          <span className="text-sm">{opportunity.probability || 0}%</span>
                        </div>
                      </td>
                      <td className="p-2">
                        {opportunity.closeDate 
                          ? new Date(opportunity.closeDate).toLocaleDateString()
                          : 'N/A'
                        }
                      </td>
                      <td className="p-2">{opportunity.assignedTo || 'Unassigned'}</td>
                      <td className="p-2 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(opportunity)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(opportunity.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredOpportunities.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No opportunities found. Create your first opportunity to get started.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}