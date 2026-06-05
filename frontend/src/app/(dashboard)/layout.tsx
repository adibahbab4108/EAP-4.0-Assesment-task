'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { 
  LayoutDashboard, 
  FolderGit2, 
  CheckSquare, 
  Bell, 
  History, 
  LogOut, 
  Menu, 
  X, 
  UserCircle 
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Fetch notifications to show count
  const fetchNotificationCount = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.success && res.data) {
        const unread = res.data.filter((n: any) => !n.read).length;
        setUnreadNotifications(unread);
      }
    } catch (error) {
      console.error('Failed to load notifications count:', error);
    }
  };

  useEffect(() => {
    fetchNotificationCount();
    // Poll every 30 seconds for notifications
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-200">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400 font-medium">Securing session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // AuthContext handles redirect to login
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderGit2 },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Notifications', href: '/notifications', icon: Bell, count: unreadNotifications },
    { name: 'Activity Log', href: '/logs', icon: History },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'PROJECT_MANAGER': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 text-slate-100 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-6 shrink-0 z-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            H
          </div>
          <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
            HeroCollab
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition duration-200 group ${
                  active 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.name}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${active ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white animate-pulse'}`}>
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profile Card & Actions */}
        <div className="border-t border-slate-800 pt-6 mt-6 space-y-4">
          <div className="flex items-center justify-end">
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/20 text-sm font-medium transition duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <UserCircle className="w-10 h-10 text-slate-400 shrink-0" />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-200 truncate">{user.name}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${getRoleColor(user.role)}`}>
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Header - Mobile */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center font-bold text-white">
            C
          </div>
          <span className="text-xl font-extrabold text-white">HeroCollab</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-400"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[65px] bg-slate-950/95 backdrop-blur-md z-40 flex flex-col p-6 space-y-6">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition group ${
                    active ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-600 text-white">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          
          <div className="border-t border-slate-800 pt-6 mt-auto space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
              <UserCircle className="w-10 h-10 text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-200">{user.name}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/20 text-sm font-semibold transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-6 md:p-10 relative overflow-y-auto max-h-screen">
        {children}
      </main>
      
    </div>
  );
}
