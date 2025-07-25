import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreHorizontal, FileText, Send, CheckCircle, XCircle, Clock, Edit, Trash2, Download, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { blink } from '@/blink/client'
import type { Contract } from '@/types/crm'

const CONTRACT_STATUSES = [
  { id: 'draft', name: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  { id: 'sent', name: 'Sent for Signature', color: 'bg-blue-100 text-blue-800', icon: Send },
  { id: 'signed', name: 'Signed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { id: 'completed', name: 'Completed', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
  { id: 'cancelled', name: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle }
]

const CONTRACT_TYPES = [
  'Service Agreement',
  'Sales Contract',
  'NDA',
  'Employment Contract',
  'Consulting Agreement',
  'License Agreement',
  'Partnership Agreement',
  'Other'
]

export default function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    contactId: '',
    opportunityId: '',
    contractType: '',
    value: 0,
    status: 'draft',
    startDate: '',
    endDate: '',
    templateId: ''
  })

  const loadContracts = async () => {
    try {
      const user = await blink.auth.me()
      const [contractData, contactData, oppData] = await Promise.all([
        blink.db.contracts.list({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        }),
        blink.db.contacts.list({
          where: { userId: user.id }
        }),
        blink.db.opportunities.list({
          where: { userId: user.id }
        })
      ])
      setContracts(contractData)
      setContacts(contactData)
      setOpportunities(oppData)
    } catch (error) {
      console.error('Failed to load contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      contactId: '',
      opportunityId: '',
      contractType: '',
      value: 0,
      status: 'draft',
      startDate: '',
      endDate: '',
      templateId: ''
    })
  }

  useEffect(() => {
    loadContracts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const user = await blink.auth.me()
      
      if (editingContract) {
        await blink.db.contracts.update(editingContract.id, {
          title: formData.title,
          contactId: formData.contactId,
          opportunityId: formData.opportunityId,
          contractType: formData.contractType,
          value: formData.value,
          status: formData.status,
          startDate: formData.startDate,
          endDate: formData.endDate,
          templateId: formData.templateId,
          updatedAt: new Date().toISOString()
        })
      } else {
        await blink.db.contracts.create({
          id: `contract_${Date.now()}`,
          title: formData.title,
          contactId: formData.contactId,
          opportunityId: formData.opportunityId,
          contractType: formData.contractType,
          value: formData.value,
          status: formData.status,
          startDate: formData.startDate,
          endDate: formData.endDate,
          templateId: formData.templateId,
          userId: user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
      
      await loadContracts()
      setIsCreateDialogOpen(false)
      setEditingContract(null)
      resetForm()
    } catch (error) {
      console.error('Failed to save contract:', error)
    }
  }

  const handleDelete = async (contractId: string) => {
    if (confirm('Are you sure you want to delete this contract?')) {
      try {
        await blink.db.contracts.delete(contractId)
        await loadContracts()
      } catch (error) {
        console.error('Failed to delete contract:', error)
      }
    }
  }

  const sendForSignature = async (contract: Contract) => {
    try {
      // This would integrate with HelloSign API
      // For now, we'll just update the status
      await blink.db.contracts.update(contract.id, {
        status: 'sent',
        updatedAt: new Date().toISOString()
      })
      await loadContracts()
      alert('Contract sent for signature! (HelloSign integration would be implemented here)')
    } catch (error) {
      console.error('Failed to send contract:', error)
    }
  }

  const openEditDialog = (contract: Contract) => {
    setEditingContract(contract)
    setFormData({
      title: contract.title || '',
      contactId: contract.contactId || '',
      opportunityId: contract.opportunityId || '',
      contractType: contract.contractType || '',
      value: contract.value || 0,
      status: contract.status || 'draft',
      startDate: contract.startDate || '',
      endDate: contract.endDate || '',
      templateId: contract.templateId || ''
    })
    setIsCreateDialogOpen(true)
  }

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = `${contract.title} ${contract.contractType}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusInfo = (status: string) => {
    return CONTRACT_STATUSES.find(s => s.id === status) || CONTRACT_STATUSES[0]
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

  const getOpportunityName = (opportunityId: string) => {
    const opportunity = opportunities.find(o => o.id === opportunityId)
    return opportunity ? opportunity.name : 'N/A'
  }

  const totalValue = filteredContracts.reduce((sum, contract) => sum + (contract.value || 0), 0)
  const signedContracts = filteredContracts.filter(contract => contract.status === 'signed' || contract.status === 'completed')
  const signedValue = signedContracts.reduce((sum, contract) => sum + (contract.value || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading contracts...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contracts</h1>
          <p className="text-gray-600">Manage contracts and e-signatures</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingContract(null) }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingContract ? 'Edit Contract' : 'Create New Contract'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Contract Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  <Label htmlFor="opportunityId">Related Opportunity</Label>
                  <Select value={formData.opportunityId} onValueChange={(value) => setFormData({ ...formData, opportunityId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select opportunity" />
                    </SelectTrigger>
                    <SelectContent>
                      {opportunities.map((opportunity) => (
                        <SelectItem key={opportunity.id} value={opportunity.id}>
                          {opportunity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contractType">Contract Type</Label>
                  <Select value={formData.contractType} onValueChange={(value) => setFormData({ ...formData, contractType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTRACT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="value">Contract Value ($)</Label>
                  <Input
                    id="value"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_STATUSES.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingContract ? 'Update Contract' : 'Create Contract'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contract Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Signed Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(signedValue)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contracts</p>
                <p className="text-2xl font-bold text-gray-900">{filteredContracts.length}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Signature Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredContracts.length > 0 
                    ? Math.round((signedContracts.length / filteredContracts.length) * 100)
                    : 0}%
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
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
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {CONTRACT_STATUSES.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Contracts ({filteredContracts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.map((contract) => {
                const statusInfo = getStatusInfo(contract.status || 'draft')
                const StatusIcon = statusInfo.icon
                
                return (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{contract.title}</div>
                          <div className="text-sm text-gray-500">{getOpportunityName(contract.opportunityId || '')}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getContactName(contract.contactId || '')}</TableCell>
                    <TableCell>{contract.contractType || 'N/A'}</TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(contract.value || 0)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <StatusIcon className="w-4 h-4" />
                        <Badge className={statusInfo.color}>
                          {statusInfo.name}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {contract.startDate 
                        ? new Date(contract.startDate).toLocaleDateString()
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      {contract.endDate 
                        ? new Date(contract.endDate).toLocaleDateString()
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      {contract.createdAt ? new Date(contract.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(contract)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {contract.status === 'draft' && (
                            <DropdownMenuItem onClick={() => sendForSignature(contract)}>
                              <Send className="w-4 h-4 mr-2" />
                              Send for Signature
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Document
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(contract.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {filteredContracts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No contracts found. Create your first contract to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* HelloSign Integration Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">HelloSign Integration</h3>
              <p className="text-blue-700 mb-4">
                Seamlessly send contracts for digital signature using HelloSign's secure e-signature platform. 
                Track signature status, send reminders, and automatically update contract status when signed.
              </p>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  Configure HelloSign
                </Button>
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  View Templates
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}