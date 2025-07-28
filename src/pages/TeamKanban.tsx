import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { blink } from '@/blink/client';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Phone,
  Mail,
  Building,
  User,
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface TeamStage {
  id: string;
  team: string;
  stage_name: string;
  stage_order: number;
  color: string;
  description: string;
}

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  lead_source: string;
  status: string;
  score: number;
  temperature: string;
  assigned_to: string;
  notes: string;
  team: string;
  stage: string;
  priority: string;
  next_action: string;
  last_activity_date: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const TEAM_CONFIG = {
  data: {
    name: 'Data Team',
    description: 'Lead capture, enrichment, and validation',
    icon: Users,
    color: '#3B82F6'
  },
  presales: {
    name: 'Pre-Sales Team',
    description: 'Lead qualification and MQL to SQL conversion',
    icon: Target,
    color: '#8B5CF6'
  },
  sales: {
    name: 'Sales Team',
    description: 'Final pitching and contract closing',
    icon: TrendingUp,
    color: '#10B981'
  }
};

const PRIORITY_COLORS = {
  low: '#6B7280',
  medium: '#F59E0B',
  high: '#EF4444'
};

const TEMPERATURE_COLORS = {
  cold: '#6B7280',
  warm: '#F59E0B',
  hot: '#EF4444'
};

export function TeamKanban() {
  const { user } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState<string>('data');
  const [stages, setStages] = useState<TeamStage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterTemperature, setFilterTemperature] = useState<string>('all');
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [newLead, setNewLead] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    job_title: '',
    lead_source: '',
    priority: 'medium',
    temperature: 'cold',
    notes: '',
    next_action: ''
  });

  // Determine user's team based on role
  const getUserTeam = () => {
    if (user?.role === 'data_team') return 'data';
    if (user?.role === 'presales_team' || user?.role === 'pre_sales') return 'presales';
    if (user?.role === 'sales_team' || user?.role === 'sales') return 'sales';
    if (user?.role === 'admin') return selectedTeam;
    return 'data';
  };

  const currentTeam = getUserTeam();

  const loadTeamData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load team stages
      const stagesResult = await blink.db.team_stages.list({
        where: { team: selectedTeam },
        orderBy: { stage_order: 'asc' }
      });
      setStages(stagesResult);

      // Load leads for the selected team
      const leadsResult = await blink.db.leads.list({
        where: { 
          team: selectedTeam,
          user_id: user?.id 
        },
        orderBy: { updated_at: 'desc' }
      });
      setLeads(leadsResult);
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTeam, user]);

  useEffect(() => {
    if (user?.role !== 'admin') {
      setSelectedTeam(currentTeam);
    }
    loadTeamData();
  }, [currentTeam, loadTeamData, selectedTeam, user]);

  const handleAddLead = async () => {
    try {
      const leadData = {
        ...newLead,
        id: `lead_${Date.now()}`,
        team: selectedTeam,
        stage: stages[0]?.stage_name || 'New Lead',
        status: 'new',
        score: 0,
        assigned_to: user?.id || '',
        user_id: user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_activity_date: new Date().toISOString()
      };

      await blink.db.leads.create(leadData);
      await loadTeamData();
      setIsAddLeadOpen(false);
      setNewLead({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        job_title: '',
        lead_source: '',
        priority: 'medium',
        temperature: 'cold',
        notes: '',
        next_action: ''
      });
    } catch (error) {
      console.error('Error adding lead:', error);
    }
  };

  const handleStageChange = async (leadId: string, newStage: string) => {
    try {
      await blink.db.leads.update(leadId, {
        stage: newStage,
        updated_at: new Date().toISOString(),
        last_activity_date: new Date().toISOString()
      });
      await loadTeamData();
    } catch (error) {
      console.error('Error updating lead stage:', error);
    }
  };

  const handleLeadUpdate = async (leadId: string, updates: Partial<Lead>) => {
    try {
      await blink.db.leads.update(leadId, {
        ...updates,
        updated_at: new Date().toISOString(),
        last_activity_date: new Date().toISOString()
      });
      await loadTeamData();
      setEditingLead(null);
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = filterPriority === 'all' || lead.priority === filterPriority;
    const matchesTemperature = filterTemperature === 'all' || lead.temperature === filterTemperature;
    
    return matchesSearch && matchesPriority && matchesTemperature;
  });

  const getLeadsByStage = (stageName: string) => {
    return filteredLeads.filter(lead => lead.stage === stageName);
  };

  const getStageStats = (stageName: string) => {
    const stageLeads = getLeadsByStage(stageName);
    return {
      total: stageLeads.length,
      high: stageLeads.filter(l => l.priority === 'high').length,
      hot: stageLeads.filter(l => l.temperature === 'hot').length
    };
  };

  const teamConfig = TEAM_CONFIG[selectedTeam as keyof typeof TEAM_CONFIG];
  const TeamIcon = teamConfig?.icon || Users;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading team dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <TeamIcon className="h-8 w-8" style={{ color: teamConfig?.color }} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {teamConfig?.name} Kanban
              </h1>
              <p className="text-gray-600">{teamConfig?.description}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {user?.role === 'admin' && (
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="data">Data Team</SelectItem>
                <SelectItem value="presales">Pre-Sales Team</SelectItem>
                <SelectItem value="sales">Sales Team</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={newLead.first_name}
                    onChange={(e) => setNewLead({...newLead, first_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={newLead.last_name}
                    onChange={(e) => setNewLead({...newLead, last_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={newLead.company}
                    onChange={(e) => setNewLead({...newLead, company: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    value={newLead.job_title}
                    onChange={(e) => setNewLead({...newLead, job_title: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="lead_source">Lead Source</Label>
                  <Input
                    id="lead_source"
                    value={newLead.lead_source}
                    onChange={(e) => setNewLead({...newLead, lead_source: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newLead.priority} onValueChange={(value) => setNewLead({...newLead, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="next_action">Next Action</Label>
                  <Input
                    id="next_action"
                    value={newLead.next_action}
                    onChange={(e) => setNewLead({...newLead, next_action: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newLead.notes}
                    onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setIsAddLeadOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddLead}>
                  Add Lead
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-lg border">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterTemperature} onValueChange={setFilterTemperature}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Temperature" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Temp</SelectItem>
            <SelectItem value="cold">Cold</SelectItem>
            <SelectItem value="warm">Warm</SelectItem>
            <SelectItem value="hot">Hot</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      <div className="flex space-x-6 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageLeads = getLeadsByStage(stage.stage_name);
          const stats = getStageStats(stage.stage_name);
          
          return (
            <div key={stage.id} className="flex-shrink-0 w-80">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: stage.color }}
                      />
                      {stage.stage_name}
                    </CardTitle>
                    <Badge variant="secondary">{stats.total}</Badge>
                  </div>
                  <p className="text-xs text-gray-600">{stage.description}</p>
                  {stats.high > 0 || stats.hot > 0 ? (
                    <div className="flex space-x-2 text-xs">
                      {stats.high > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {stats.high} High Priority
                        </Badge>
                      )}
                      {stats.hot > 0 && (
                        <Badge style={{ backgroundColor: '#EF4444' }} className="text-xs text-white">
                          {stats.hot} Hot
                        </Badge>
                      )}
                    </div>
                  ) : null}
                </CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {stageLeads.map((lead) => (
                    <Card key={lead.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">
                            {lead.first_name} {lead.last_name}
                          </h4>
                          <div className="flex space-x-1">
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ 
                                borderColor: PRIORITY_COLORS[lead.priority as keyof typeof PRIORITY_COLORS],
                                color: PRIORITY_COLORS[lead.priority as keyof typeof PRIORITY_COLORS]
                              }}
                            >
                              {lead.priority}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ 
                                borderColor: TEMPERATURE_COLORS[lead.temperature as keyof typeof TEMPERATURE_COLORS],
                                color: TEMPERATURE_COLORS[lead.temperature as keyof typeof TEMPERATURE_COLORS]
                              }}
                            >
                              {lead.temperature}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-xs text-gray-600">
                          {lead.company && (
                            <div className="flex items-center">
                              <Building className="h-3 w-3 mr-1" />
                              {lead.company}
                            </div>
                          )}
                          {lead.job_title && (
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {lead.job_title}
                            </div>
                          )}
                          {lead.email && (
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {lead.email}
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {lead.phone}
                            </div>
                          )}
                        </div>

                        {lead.next_action && (
                          <div className="text-xs bg-blue-50 p-2 rounded">
                            <div className="flex items-center text-blue-700">
                              <Clock className="h-3 w-3 mr-1" />
                              Next: {lead.next_action}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <div className="text-xs text-gray-500">
                            {new Date(lead.last_activity_date).toLocaleDateString()}
                          </div>
                          <Select 
                            value={lead.stage} 
                            onValueChange={(value) => handleStageChange(lead.id, value)}
                          >
                            <SelectTrigger className="h-6 text-xs w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {stages.map((s) => (
                                <SelectItem key={s.id} value={s.stage_name}>
                                  {s.stage_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {stageLeads.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📋</div>
                      <p className="text-sm">No leads in this stage</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold">{filteredLeads.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredLeads.filter(l => l.priority === 'high').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hot Leads</p>
                <p className="text-2xl font-bold text-orange-600">
                  {filteredLeads.filter(l => l.temperature === 'hot').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredLeads.filter(l => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(l.created_at) > weekAgo;
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}