'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Bell, Check, Eye } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Could not load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await api.put(`/notifications/${id}/read`);
      if (res.success) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        toast.success('Notification marked as read.');
      }
    } catch (error) {
      toast.error('Failed to update notification.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await api.put('/notifications/mark-all-read');
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        toast.success('All notifications marked as read.');
      }
    } catch (error) {
      toast.error('Failed to mark all as read.');
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Notifications</h1>
          <p className="text-slate-400 mt-1">Inbox for assignments, project invites, and task updates.</p>
        </div>
        {notifications.some(n => !n.read) && (
          <Button 
            onClick={handleMarkAllAsRead}
            variant="outline" 
            className="border-slate-800 hover:bg-slate-800 text-slate-300 flex items-center gap-1.5 h-9"
          >
            <Check className="w-4 h-4" /> Mark All as Read
          </Button>
        )}
      </div>

      <Card className="border-slate-800 bg-slate-900/30 text-slate-100 shadow-md">
        <CardHeader className="border-b border-slate-800/80 pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Bell className="w-4.5 h-4.5 text-indigo-400" /> Notifications Inbox
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-slate-850">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-5 flex items-start justify-between gap-6 transition duration-200 ${
                    n.read ? 'bg-slate-900/5' : 'bg-indigo-950/5 border-l-2 border-indigo-500'
                  }`}
                >
                  <div className="space-y-1 overflow-hidden">
                    <p className={`text-sm ${n.read ? 'text-slate-350' : 'text-white font-semibold'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-500 block pt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {!n.read && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleMarkAsRead(n.id)}
                      className="text-indigo-400 hover:text-indigo-300 h-8 font-semibold text-xs shrink-0 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 text-sm">
              Your inbox is clean. No new notifications!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
