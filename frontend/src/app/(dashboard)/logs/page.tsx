'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/logs?limit=50');
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
      toast.error('Could not load activity logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Activity Log</h1>
        <p className="text-slate-400 mt-1">Audit log of system-wide changes, creations, and updates.</p>
      </div>

      <Card className="border-slate-800 bg-slate-900/30 text-slate-100 shadow-md">
        <CardHeader className="border-b border-slate-800/80 pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <History className="w-4.5 h-4.5 text-indigo-400" /> Recent System Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : logs.length > 0 ? (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {logs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl border border-slate-850 bg-slate-950/30 flex items-start gap-4 hover:border-slate-800 transition">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
                    <Calendar className="w-4.5 h-4.5" />
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <p className="text-sm font-medium text-slate-200">
                      {log.action}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>Actor: {log.user?.name || 'System'} ({log.user?.email || 'N/A'})</span>
                      <span>•</span>
                      <span>Time: {new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-550 text-sm">
              No audit logs captured.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
