'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Calendar, 
  Users, 
  CheckSquare, 
  Trash2, 
  UserPlus, 
  Plus, 
  ChevronRight, 
  FolderEdit, 
  User, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import Link from 'next/link';

export default function ProjectDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Member invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Edit Project state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [updatingProject, setUpdatingProject] = useState(false);

  // Create Task state
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('UNASSIGNED');
  const [creatingTask, setCreatingTask] = useState(false);

  // Task filters
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('ALL');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState('ALL');

  const fetchProjectDetails = async () => {
    try {
      const res = await api.get(`/projects/${projectId}`);
      if (res.success && res.data) {
        setProject(res.data);
        // Pre-fill edit forms
        setEditName(res.data.name);
        setEditDesc(res.data.description);
        setEditStatus(res.data.status);
        // Extract YYYY-MM-DD
        setEditDeadline(res.data.deadline.split('T')[0]);
      }
    } catch (error: any) {
      console.error('Failed to load project details:', error);
      toast.error(error.message || 'Could not load project details.');
      router.push('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProject(true);
    try {
      const res = await api.put(`/projects/${projectId}`, {
        name: editName,
        description: editDesc,
        status: editStatus,
        deadline: editDeadline,
      });
      if (res.success) {
        toast.success('Project details updated successfully.');
        setEditDialogOpen(false);
        fetchProjectDetails();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update project.');
    } finally {
      setUpdatingProject(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete this project? All associated tasks will be permanently removed.')) {
      return;
    }
    
    try {
      const res = await api.delete(`/projects/${projectId}`);
      if (res.success) {
        toast.success('Project deleted successfully.');
        router.push('/projects');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete project.');
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviting(true);
    try {
      const res = await api.post(`/projects/${projectId}/members`, { email: inviteEmail });
      if (res.success) {
        toast.success(`Successfully added ${inviteEmail} to project!`);
        setInviteEmail('');
        setInviteDialogOpen(false);
        fetchProjectDetails();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add member.');
    } finally {
      setInviting(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskDueDate) {
      toast.error('Task title and due date are required.');
      return;
    }

    setCreatingTask(true);
    try {
      const payload: any = {
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        dueDate: taskDueDate,
        projectId,
      };

      if (taskAssignee !== 'UNASSIGNED') {
        payload.assignedToId = taskAssignee;
      }

      const res = await api.post('/tasks', payload);
      if (res.success) {
        toast.success('Task created successfully!');
        setTaskTitle('');
        setTaskDesc('');
        setTaskPriority('MEDIUM');
        setTaskDueDate('');
        setTaskAssignee('UNASSIGNED');
        setTaskDialogOpen(false);
        fetchProjectDetails();
      }
    } catch (error: any) {
      // Catch validation errors and display appropriate messages
      toast.error(error.message || 'Failed to create task.');
    } finally {
      setCreatingTask(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const canEdit = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  // Task filtering
  const filteredTasks = project.tasks?.filter((t: any) => {
    const matchesSearch = t.title.toLowerCase().includes(taskSearch.toLowerCase()) || 
                          t.description.toLowerCase().includes(taskSearch.toLowerCase());
    const matchesStatus = taskStatusFilter === 'ALL' || t.status === taskStatusFilter;
    const matchesPriority = taskPriorityFilter === 'ALL' || t.priority === taskPriorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'HIGH': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'TODO': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'IN_PROGRESS': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/projects" className="hover:text-indigo-400 transition font-medium">Projects</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-300 font-bold truncate max-w-[150px]">{project.name}</span>
      </div>

      {/* Hero Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between p-6 rounded-2xl border border-slate-800 bg-slate-900/30 backdrop-blur-md relative overflow-hidden">
        {/* Neon accent glows */}
        <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-indigo-500/5 blur-[80px]" />
        
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{project.name}</h1>
            <Badge variant="outline" className={`border uppercase text-[10px] py-0.5 px-2 font-bold bg-slate-950/50`}>
              {project.status}
            </Badge>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">{project.description}</p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Deadline: {new Date(project.deadline).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>{project.members?.length || 0} Team Members</span>
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex flex-wrap gap-3 shrink-0">
            {/* Edit details dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogTrigger render={<Button variant="outline" className="border-slate-800 hover:bg-slate-800 text-slate-300 flex items-center gap-2" />}>
                <FolderEdit className="w-4 h-4" /> Edit Scope
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Edit Project Scope</DialogTitle>
                  <DialogDescription className="text-slate-400">Update metadata and status fields.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateProject}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Project Name</Label>
                      <Input
                        id="edit-name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-slate-950 border-slate-850"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-desc">Description</Label>
                      <textarea
                        id="edit-desc"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="flex min-h-[80px] w-full rounded-md border border-slate-850 bg-slate-950 px-3 py-2 text-sm text-slate-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-deadline">Deadline</Label>
                        <Input
                          id="edit-deadline"
                          type="date"
                          value={editDeadline}
                          onChange={(e) => setEditDeadline(e.target.value)}
                          className="bg-slate-950 border-slate-850"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-status">Status</Label>
                        <Select value={editStatus} onValueChange={(val) => setEditStatus(val || '')}>
                          <SelectTrigger className="bg-slate-950 border-slate-850">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="ON_HOLD">On Hold</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} className="border-slate-800 text-slate-300">
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500" disabled={updatingProject}>
                      {updatingProject ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete button */}
            <Button variant="outline" onClick={handleDeleteProject} className="border-red-950/40 text-red-400 hover:bg-red-950/20 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete Scope
            </Button>
          </div>
        )}
      </div>

      {/* Split view: Team & Tasks */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Team Members List Column */}
        <div className="space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" /> Project Team
            </h2>
            {canEdit && (
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger render={<Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-100" />}>
                  <UserPlus className="w-4 h-4" />
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Add Team Member</DialogTitle>
                    <DialogDescription className="text-slate-400">Enter a user email to add them to this project scope.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleInviteMember}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="invite-email">Member Email</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          placeholder="member@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="bg-slate-950 border-slate-850"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)} className="border-slate-800 text-slate-350">
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500" disabled={inviting}>
                        {inviting ? 'Adding...' : 'Add Member'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Card className="border-slate-800 bg-slate-900/30 text-slate-100">
            <CardContent className="p-4 space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {project.members?.map((m: any) => (
                <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-950/30 border border-slate-850/50">
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                    {m.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold truncate text-slate-200">{m.name}</p>
                    <span className="text-[9px] text-slate-500">{m.role.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
              {project.members?.length === 0 && (
                <div className="text-center py-4 text-slate-500 text-xs">No team members added.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tasks List Column */}
        <div className="space-y-4 lg:col-span-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-400" /> Tasks ({project.tasks?.length || 0})
            </h2>
            
            {canEdit && (
              <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                <DialogTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition flex items-center gap-2 h-9 px-4" />}>
                  <Plus className="w-4 h-4" /> Create Task
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">New Task Creation</DialogTitle>
                    <DialogDescription className="text-slate-400">Set up a task under this project. Deadlines must be in the future.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateTask}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="task-title" className="text-slate-300">Task Title</Label>
                        <Input
                          id="task-title"
                          placeholder="e.g. Design homepage wireframe"
                          value={taskTitle}
                          onChange={(e) => setTaskTitle(e.target.value)}
                          className="bg-slate-950 border-slate-850"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="task-desc" className="text-slate-300">Description</Label>
                        <textarea
                          id="task-desc"
                          placeholder="Details of task objectives..."
                          value={taskDesc}
                          onChange={(e) => setTaskDesc(e.target.value)}
                          className="flex min-h-[80px] w-full rounded-md border border-slate-850 bg-slate-950 px-3 py-2 text-sm text-slate-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="task-priority" className="text-slate-300">Priority</Label>
                          <Select value={taskPriority} onValueChange={(val) => setTaskPriority(val || '')}>
                            <SelectTrigger className="bg-slate-950 border-slate-850">
                              <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                              <SelectItem value="LOW">Low</SelectItem>
                              <SelectItem value="MEDIUM">Medium</SelectItem>
                              <SelectItem value="HIGH">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="task-duedate" className="text-slate-300">Due Date</Label>
                          <Input
                            id="task-duedate"
                            type="date"
                            value={taskDueDate}
                            onChange={(e) => setTaskDueDate(e.target.value)}
                            className="bg-slate-950 border-slate-850"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="task-assignee" className="text-slate-300">Assign Member</Label>
                        <Select value={taskAssignee} onValueChange={(val) => setTaskAssignee(val || '')}>
                          <SelectTrigger className="bg-slate-950 border-slate-850">
                            <SelectValue placeholder="Select Assignee" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                            <SelectItem value="UNASSIGNED">Unassigned (Leave empty)</SelectItem>
                            {project.members?.map((m: any) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.name} ({m.role.replace('_', ' ')})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setTaskDialogOpen(false)} className="border-slate-800 text-slate-350">
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500" disabled={creatingTask}>
                        {creatingTask ? 'Creating...' : 'Create Task'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Task filters */}
          <div className="flex flex-col sm:flex-row gap-3 p-3 rounded-lg border border-slate-850 bg-slate-900/10">
            <div className="flex-1 relative">
              <Input
                placeholder="Search tasks..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                className="bg-slate-950 border-slate-850 text-xs h-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={taskStatusFilter} onValueChange={(val) => setTaskStatusFilter(val || '')}>
                <SelectTrigger className="w-[120px] bg-slate-950 border-slate-850 text-xs h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-850 text-slate-100">
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="TODO">Todo</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={taskPriorityFilter} onValueChange={(val) => setTaskPriorityFilter(val || '')}>
                <SelectTrigger className="w-[120px] bg-slate-950 border-slate-850 text-xs h-9">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-850 text-slate-100">
                  <SelectItem value="ALL">All Priority</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Task List Grid */}
          <div className="space-y-3">
            {filteredTasks && filteredTasks.length > 0 ? (
              filteredTasks.map((t: any) => {
                const now = new Date();
                const isOverdue = t.status !== 'COMPLETED' && new Date(t.dueDate) < now;
                return (
                  <div key={t.id} className="p-4 rounded-xl border border-slate-850 bg-slate-900/20 hover:border-slate-750 transition duration-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1.5 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <Link href={`/tasks/${t.id}`} className="font-semibold text-slate-200 hover:text-indigo-400 hover:underline truncate">
                          {t.title}
                        </Link>
                        <Badge variant="outline" className={`border text-[9px] py-0.5 px-1.5 ${getPriorityBadge(t.priority)}`}>
                          {t.priority}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-xs truncate max-w-[400px]">{t.description || 'No description provided.'}</p>
                      
                      <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 pt-1">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Assignee: {t.assignedTo?.name || 'Unassigned'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          <span className={isOverdue ? 'text-red-500 font-bold' : ''}>
                            Due: {new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            {isOverdue && ' (OVERDUE)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <Badge variant="outline" className={`border uppercase text-[10px] font-bold ${getStatusBadge(t.status)}`}>
                        {t.status.replace('_', ' ')}
                      </Badge>
                      <Link href={`/tasks/${t.id}`}>
                        <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300 font-bold">
                          Manage Task
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
                <p className="text-slate-500 text-sm">No tasks meet the criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
