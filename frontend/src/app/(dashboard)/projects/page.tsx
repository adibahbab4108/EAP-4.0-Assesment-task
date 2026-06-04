'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  FolderPlus, 
  Search, 
  Calendar, 
  Users, 
  CheckSquare, 
  SlidersHorizontal 
} from 'lucide-react';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('LATEST');
  
  // Create Project state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      if (res.success && res.data) {
        setProjects(res.data);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Could not load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !deadline) {
      toast.error('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/projects', { name, description, deadline });
      if (res.success) {
        toast.success(`Project "${name}" created!`);
        setName('');
        setDescription('');
        setDeadline('');
        setCreateDialogOpen(false);
        fetchProjects(); // Reload list
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create project.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter & Sort Logic
  const filteredProjects = projects
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'LATEST') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'DEADLINE') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === 'NAME') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'ON_HOLD': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  // Helper to calculate progress percentage
  const calculateProgress = (projectTasks: any[]) => {
    if (!projectTasks || projectTasks.length === 0) return 0;
    const completed = projectTasks.filter(t => t.status === 'COMPLETED').length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  // Check permissions: Admin or PM
  const canCreate = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  return (
    <div className="space-y-8 pb-12">
      {/* Title section with create action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Projects</h1>
          <p className="text-slate-400 mt-1">Manage and track workspace collaboration scopes.</p>
        </div>

        {canCreate && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition flex items-center gap-2" />}>
              <FolderPlus className="w-4 h-4" /> Create Project
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">New Project Setup</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Fill in the details to establish a new collaboration domain.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProject}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="proj-name" className="text-slate-350">Project Name</Label>
                    <Input
                      id="proj-name"
                      placeholder="e.g. Website Redesign"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-slate-950 border-slate-850 focus:border-indigo-500 focus:ring-indigo-500 text-slate-100"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proj-desc" className="text-slate-350">Description</Label>
                    <textarea
                      id="proj-desc"
                      placeholder="Scope of work, objectives, and deliverables..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="flex min-h-[80px] w-full rounded-md border border-slate-850 bg-slate-950 px-3 py-2 text-sm text-slate-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proj-deadline" className="text-slate-350">Deadline Date</Label>
                    <Input
                      id="proj-deadline"
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="bg-slate-950 border-slate-850 focus:border-indigo-500 focus:ring-indigo-500 text-slate-100"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    className="border-slate-800 text-slate-300 hover:bg-slate-800"
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                    disabled={submitting}
                  >
                    {submitting ? 'Creating...' : 'Create Scope'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters & search panel */}
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-slate-850 bg-slate-900/30 backdrop-blur-md">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search projects by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-950 border-slate-850 text-slate-100"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || '')}>
              <SelectTrigger className="w-[140px] bg-slate-950 border-slate-850 text-slate-100">
                <SelectValue placeholder="Status Filter" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-850 text-slate-100">
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Select value={sortBy} onValueChange={(val) => setSortBy(val || '')}>
            <SelectTrigger className="w-[150px] bg-slate-950 border-slate-850 text-slate-100">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-850 text-slate-100">
              <SelectItem value="LATEST">Latest Created</SelectItem>
              <SelectItem value="DEADLINE">Nearest Deadline</SelectItem>
              <SelectItem value="NAME">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const progress = calculateProgress(project.tasks);
            const pendingTasks = project.tasks?.filter((t: any) => t.status !== 'COMPLETED').length || 0;
            return (
              <Card key={project.id} className="border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition duration-300 flex flex-col justify-between text-slate-100 shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-xl font-bold truncate hover:text-indigo-400 transition">
                      <Link href={`/projects/${project.id}`}>{project.name}</Link>
                    </CardTitle>
                    <Badge variant="outline" className={`border uppercase shrink-0 text-[10px] py-0.5 px-2 font-semibold ${getStatusBadge(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardDescription className="text-slate-400 mt-2 line-clamp-2 min-h-[40px]">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-semibold">Completion progress</span>
                      <span className="text-indigo-400 font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Summary indicators */}
                  <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <span>{project.memberIds?.length || 0} Members</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                      <span>{pendingTasks} Pending Tasks</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-900/60 border-t border-slate-850/80 px-6 py-4 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>Deadline: {new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <Link 
                    href={`/projects/${project.id}`}
                    className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
                  >
                    Manage Scope
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
          <p className="text-slate-500 text-sm">No projects match the criteria.</p>
        </div>
      )}
    </div>
  );
}
