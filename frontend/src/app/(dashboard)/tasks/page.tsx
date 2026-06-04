'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Search, 
  Calendar, 
  User, 
  Clock, 
  SlidersHorizontal,
  CheckCircle,
  Play,
  RotateCcw
} from 'lucide-react';

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const [deadlineStatusFilter, setDeadlineStatusFilter] = useState('ALL'); // UPCOMING / OVERDUE
  const [sortBy, setSortBy] = useState('LATEST');

  const fetchTasksAndFiltersData = async () => {
    try {
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
        api.get('/users'),
      ]);

      if (tasksRes.success) setTasks(tasksRes.data);
      if (projectsRes.success) setProjects(projectsRes.data);
      if (usersRes.success) setUsers(usersRes.data);
    } catch (error) {
      console.error('Failed to load tasks filters data:', error);
      toast.error('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndFiltersData();
  }, []);

  const handleQuickStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      // Find the task to verify role-based access before api request
      const targetTask = tasks.find(t => t.id === taskId);
      if (!targetTask) return;

      // Rule Check: Team Member can only update assigned tasks
      if (user?.role === 'TEAM_MEMBER' && targetTask.assignedToId !== user.id) {
        toast.error('Access denied. You can only update tasks assigned to you.');
        return;
      }

      const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
      if (res.success) {
        toast.success(`Task status updated to ${newStatus}`);
        fetchTasksAndFiltersData(); // Reload list
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task status.');
    }
  };

  // Filter & Sort Logic
  const now = new Date();
  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                            task.description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
      const matchesProject = projectFilter === 'ALL' || task.projectId === projectFilter;
      const matchesAssignee = assigneeFilter === 'ALL' || 
                              (assigneeFilter === 'UNASSIGNED' && !task.assignedToId) ||
                              task.assignedToId === assigneeFilter;
      
      const isTaskOverdue = task.status !== 'COMPLETED' && new Date(task.dueDate) < now;
      const matchesDeadline = deadlineStatusFilter === 'ALL' || 
                              (deadlineStatusFilter === 'OVERDUE' && isTaskOverdue) ||
                              (deadlineStatusFilter === 'UPCOMING' && !isTaskOverdue);
      
      return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesAssignee && matchesDeadline;
    })
    .sort((a, b) => {
      if (sortBy === 'LATEST') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'DEADLINE') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'PRIORITY') {
        const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        const wA = priorityWeight[a.priority as keyof typeof priorityWeight] || 0;
        const wB = priorityWeight[b.priority as keyof typeof priorityWeight] || 0;
        return wB - wA;
      }
      if (sortBy === 'UPDATED') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return 0;
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
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Tasks</h1>
        <p className="text-slate-400 mt-1">Search, filter, and modify task status and assignees.</p>
      </div>

      {/* Advanced Filter panel */}
      <div className="p-5 rounded-xl border border-slate-850 bg-slate-900/30 backdrop-blur-md space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search tasks by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-950 border-slate-850 text-slate-100"
          />
        </div>

        {/* Filters Select Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 text-xs">
          {/* Project Filter */}
          <div className="space-y-1">
            <Label className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Project</Label>
            <Select value={projectFilter} onValueChange={(val) => setProjectFilter(val || '')}>
              <SelectTrigger className="bg-slate-950 border-slate-850 h-9 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                <SelectItem value="ALL">All Projects</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <Label className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Status</Label>
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || '')}>
              <SelectTrigger className="bg-slate-950 border-slate-850 h-9 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="TODO">Todo</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="space-y-1">
            <Label className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Priority</Label>
            <Select value={priorityFilter} onValueChange={(val) => setPriorityFilter(val || '')}>
              <SelectTrigger className="bg-slate-950 border-slate-850 h-9 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                <SelectItem value="ALL">All Priority</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignee Filter */}
          <div className="space-y-1">
            <Label className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Assignee</Label>
            <Select value={assigneeFilter} onValueChange={(val) => setAssigneeFilter(val || '')}>
              <SelectTrigger className="bg-slate-950 border-slate-850 h-9 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                <SelectItem value="ALL">All Members</SelectItem>
                <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Deadline Filter */}
          <div className="space-y-1">
            <Label className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Deadline</Label>
            <Select value={deadlineStatusFilter} onValueChange={(val) => setDeadlineStatusFilter(val || '')}>
              <SelectTrigger className="bg-slate-950 border-slate-850 h-9 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                <SelectItem value="ALL">All Dates</SelectItem>
                <SelectItem value="UPCOMING">Upcoming</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sorting */}
          <div className="space-y-1">
            <Label className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Sort By</Label>
            <Select value={sortBy} onValueChange={(val) => setSortBy(val || '')}>
              <SelectTrigger className="bg-slate-950 border-slate-850 h-9 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                <SelectItem value="LATEST">Latest Created</SelectItem>
                <SelectItem value="DEADLINE">Nearest Deadline</SelectItem>
                <SelectItem value="PRIORITY">Highest Priority</SelectItem>
                <SelectItem value="UPDATED">Recently Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Task List Grid */}
      {loading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="space-y-4">
          {filteredTasks.map((t) => {
            const isOverdue = t.status !== 'COMPLETED' && new Date(t.dueDate) < now;
            // Can this user modify status?
            const isAssignee = t.assignedToId === user?.id;
            const canModifyStatus = user?.role !== 'TEAM_MEMBER' || isAssignee;

            return (
              <Card key={t.id} className="border-slate-800 bg-slate-900/40 text-slate-100 shadow-md">
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div className="space-y-2 overflow-hidden flex-1">
                    <div className="flex items-center gap-2">
                      <Link href={`/tasks/${t.id}`} className="text-lg font-bold text-slate-100 hover:text-indigo-400 hover:underline truncate">
                        {t.title}
                      </Link>
                      <Badge variant="outline" className={`border text-[9px] font-bold ${getPriorityBadge(t.priority)}`}>
                        {t.priority}
                      </Badge>
                      <Badge variant="outline" className={`border text-[9px] font-semibold bg-slate-950/40 border-slate-800`}>
                        {t.project?.name}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-xs truncate max-w-[500px]">{t.description || 'No description provided.'}</p>
                    
                    <div className="flex flex-wrap gap-4 text-[10px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Assignee: {t.assignedTo?.name || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span className={isOverdue ? 'text-red-500 font-bold' : ''}>
                          Due: {new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          {isOverdue && ' (OVERDUE)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 shrink-0 justify-between md:justify-end">
                    <Badge variant="outline" className={`border uppercase text-[10px] font-bold py-1 px-2.5 ${getStatusBadge(t.status)}`}>
                      {t.status.replace('_', ' ')}
                    </Badge>
                    
                    {/* Quick status actions */}
                    {canModifyStatus && (
                      <div className="flex gap-1.5">
                        {t.status !== 'TODO' && (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="w-8 h-8 border-slate-800 hover:bg-slate-800 text-slate-400"
                            onClick={() => handleQuickStatusUpdate(t.id, 'TODO')}
                            title="Mark as Todo"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                          </Button>
                        )}
                        {t.status !== 'IN_PROGRESS' && (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="w-8 h-8 border-slate-800 hover:bg-slate-800 text-slate-400"
                            onClick={() => handleQuickStatusUpdate(t.id, 'IN_PROGRESS')}
                            title="Mark as In Progress"
                          >
                            <Play className="w-3.5 h-3.5 text-cyan-400" />
                          </Button>
                        )}
                        {t.status !== 'COMPLETED' && (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="w-8 h-8 border-slate-800 hover:bg-slate-850 text-slate-400"
                            onClick={() => handleQuickStatusUpdate(t.id, 'COMPLETED')}
                            title="Mark as Completed"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          </Button>
                        )}
                      </div>
                    )}
                    
                    <Link href={`/tasks/${t.id}`}>
                      <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-indigo-300 font-bold">
                        Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
          <p className="text-slate-500 text-sm">No tasks match the filter criteria.</p>
        </div>
      )}
    </div>
  );
}
