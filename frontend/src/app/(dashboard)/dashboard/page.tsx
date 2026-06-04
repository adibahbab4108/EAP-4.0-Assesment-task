'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FolderGit2, 
  CheckSquare, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Calendar,
  ArrowRight 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState<any>({
    projects: [],
    tasks: [],
    workload: [],
    logs: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, tasksRes, workloadRes, logsRes] = await Promise.all([
        api.get('/projects'),
        api.get('/tasks'),
        api.get('/users/workload'),
        api.get('/logs?limit=8'),
      ]);

      setData({
        projects: projectsRes.data || [],
        tasks: tasksRes.data || [],
        workload: workloadRes.data || [],
        logs: logsRes.data || [],
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { projects, tasks, workload, logs } = data;

  // KPI calculations
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED').length;
  const pendingTasks = totalTasks - completedTasks;
  
  const now = new Date();
  const overdueTasks = tasks.filter((t: any) => {
    return t.status !== 'COMPLETED' && new Date(t.dueDate) < now;
  }).length;

  // 1. Tasks by Priority Chart Data
  const highPriority = tasks.filter((t: any) => t.priority === 'HIGH').length;
  const mediumPriority = tasks.filter((t: any) => t.priority === 'MEDIUM').length;
  const lowPriority = tasks.filter((t: any) => t.priority === 'LOW').length;

  const priorityData = [
    { name: 'High', value: highPriority, color: '#ef4444' },
    { name: 'Medium', value: mediumPriority, color: '#f59e0b' },
    { name: 'Low', value: lowPriority, color: '#10b981' },
  ].filter(item => item.value > 0);

  // 2. Task Status Distribution Chart Data
  const todoCount = tasks.filter((t: any) => t.status === 'TODO').length;
  const inProgressCount = tasks.filter((t: any) => t.status === 'IN_PROGRESS').length;
  const statusData = [
    { name: 'Todo', value: todoCount, color: '#6366f1' },
    { name: 'In Progress', value: inProgressCount, color: '#06b6d4' },
    { name: 'Completed', value: completedTasks, color: '#10b981' },
  ].filter(item => item.value > 0);

  // 3. Project Progress Chart Data
  const projectProgressData = projects.map((p: any) => {
    const pTasks = tasks.filter((t: any) => t.projectId === p.id);
    const total = pTasks.length;
    const completed = pTasks.filter((t: any) => t.status === 'COMPLETED').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      Progress: percentage,
    };
  });

  // 4. Team Productivity Data (total vs completed tasks)
  const teamProductivityData = workload.map((member: any) => ({
    name: member.name,
    Total: member.workload.total,
    Completed: member.workload.completed,
  }));

  // Filter lists
  const upcomingDeadlines = tasks
    .filter((t: any) => t.status !== 'COMPLETED')
    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const highPriorityTasks = tasks
    .filter((t: any) => t.priority === 'HIGH' && t.status !== 'COMPLETED')
    .slice(0, 5);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome banner */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">System Insights</h1>
        <p className="text-slate-400 mt-1">Real-time status updates and workload progress metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border-slate-800 bg-slate-900/40 backdrop-blur text-slate-100 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Projects</CardTitle>
            <FolderGit2 className="w-4 h-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/40 backdrop-blur text-slate-100 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</CardTitle>
            <CheckSquare className="w-4 h-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/40 backdrop-blur text-slate-100 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Tasks</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{completedTasks}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/40 backdrop-blur text-slate-100 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Tasks</CardTitle>
            <Clock className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">{pendingTasks}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/40 backdrop-blur text-slate-100 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overdue Tasks</CardTitle>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{overdueTasks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Project Progress Trend */}
        <Card className="border-slate-800 bg-slate-900/30 text-slate-100">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" /> Project Completion Progress (%)
            </CardTitle>
            <CardDescription className="text-slate-400">Percentage of completed tasks for each project.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {projectProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                  <Bar dataKey="Progress" fill="url(#progressGrad)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No project data available.</div>
            )}
          </CardContent>
        </Card>

        {/* Team Productivity Overview */}
        <Card className="border-slate-800 bg-slate-900/30 text-slate-100">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" /> Team Member Productivity
            </CardTitle>
            <CardDescription className="text-slate-400">Comparing total tasks assigned against completed tasks.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {teamProductivityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamProductivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="Total" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No team productivity data.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Task Priorities Pie Chart */}
        <Card className="border-slate-800 bg-slate-900/30 text-slate-100">
          <CardHeader>
            <CardTitle className="text-base font-bold">Tasks by Priority</CardTitle>
          </CardHeader>
          <CardContent className="h-60 flex flex-col justify-center">
            {priorityData.length > 0 ? (
              <div className="h-full w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom legends */}
                <div className="absolute bottom-0 inset-x-0 flex justify-center gap-4 text-xs">
                  {priorityData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-400">{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 text-sm">No tasks assigned yet.</div>
            )}
          </CardContent>
        </Card>

        {/* Task Status Distribution */}
        <Card className="border-slate-800 bg-slate-900/30 text-slate-100">
          <CardHeader>
            <CardTitle className="text-base font-bold">Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-60 flex flex-col justify-center">
            {statusData.length > 0 ? (
              <div className="h-full w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute bottom-0 inset-x-0 flex justify-center gap-3 text-xs">
                  {statusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-400">{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 text-sm">No tasks created yet.</div>
            )}
          </CardContent>
        </Card>

        {/* Member Workload Summary List */}
        <Card className="border-slate-800 bg-slate-900/30 text-slate-100">
          <CardHeader>
            <CardTitle className="text-base font-bold">Workload Summary</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[240px] overflow-y-auto pr-1">
            <div className="space-y-3">
              {workload.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-850">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{m.name}</p>
                    <span className="text-[10px] text-slate-500">{m.role.replace('_', ' ')}</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="text-slate-400" title="Pending tasks">P: {m.workload.pending}</span>
                    <span className="text-emerald-500" title="Completed tasks">C: {m.workload.completed}</span>
                  </div>
                </div>
              ))}
              {workload.length === 0 && (
                <div className="text-center text-slate-500 text-sm py-4">No team members.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Lists and Logs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* High Priority Tasks list */}
        <Card className="border-slate-800 bg-slate-900/30 text-slate-100 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-base font-bold">High Priority Tasks</CardTitle>
            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">Action Required</Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {highPriorityTasks.map((t: any) => (
                <Link 
                  href={`/tasks/${t.id}`} 
                  key={t.id} 
                  className="block p-3 rounded-lg bg-slate-950/40 border border-slate-850 hover:border-slate-700 transition duration-200"
                >
                  <p className="text-sm font-semibold text-slate-200 truncate">{t.title}</p>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-slate-500 truncate max-w-[120px]">{t.project?.name}</span>
                    <span className="text-red-400">{t.status.replace('_', ' ')}</span>
                  </div>
                </Link>
              ))}
              {highPriorityTasks.length === 0 && (
                <div className="text-center text-slate-500 text-sm py-6">No urgent pending tasks!</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="border-slate-800 bg-slate-900/30 text-slate-100 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-base font-bold">Upcoming Deadlines</CardTitle>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {upcomingDeadlines.map((t: any) => {
                const isOverdue = new Date(t.dueDate) < now;
                return (
                  <Link 
                    href={`/tasks/${t.id}`} 
                    key={t.id} 
                    className="block p-3 rounded-lg bg-slate-950/40 border border-slate-850 hover:border-slate-700 transition duration-200"
                  >
                    <p className="text-sm font-semibold text-slate-200 truncate">{t.title}</p>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-slate-500 truncate max-w-[120px]">{t.project?.name}</span>
                      <span className={isOverdue ? 'text-red-500 font-medium' : 'text-indigo-400'}>
                        {new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </Link>
                );
              })}
              {upcomingDeadlines.length === 0 && (
                <div className="text-center text-slate-500 text-sm py-6">No upcoming tasks.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities feed */}
        <Card className="border-slate-800 bg-slate-900/30 text-slate-100 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-base font-bold">Recent Activities</CardTitle>
            <Link href="/logs" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4 overflow-y-auto max-h-[320px]">
              {logs.map((log: any) => (
                <div key={log.id} className="flex gap-3 text-xs leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                  <div className="space-y-1">
                    <p className="text-slate-300">
                      {log.action}
                    </p>
                    <span className="text-[10px] text-slate-500">
                      {new Date(log.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} by {log.user?.name || 'System'}
                    </span>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-center text-slate-500 text-sm py-6">No recent activity logs.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
