'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { LogIn, User, ShieldAlert, Briefcase } from 'lucide-react';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }
    
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'pm' | 'member') => {
    let demoEmail = '';
    if (role === 'admin') demoEmail = 'admin@example.com';
    else if (role === 'pm') demoEmail = 'pm@example.com';
    else demoEmail = 'member@example.com';
    
    setEmail(demoEmail);
    setPassword('Password123');

    setSubmitting(true);
    try {
      await login(demoEmail, 'Password123');
      toast.success(`Logged in as ${role.toUpperCase()}`);
    } catch (error: any) {
      toast.error(error.message || 'Demo login failed. Make sure DB is seeded.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-violet-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-cyan-600/30 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400">
            HeroCollab
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Smart Project & Task Collaboration System
          </p>
        </div>

        <Card className=" border-slate-800 bg-slate-900/50 backdrop-blur-xl text-slate-100 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <LogIn className="w-5 h-5 text-indigo-400" /> Sign In
            </CardTitle>
            <CardDescription className="text-slate-400">
              Enter your credentials or use a demo role below.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-950 border-slate-850 text-slate-100 focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  disabled={loading || submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-950 border-slate-850 text-slate-100 focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  disabled={loading || submitting}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition duration-200 shadow-lg shadow-indigo-600/20"
                disabled={loading || submitting}
              >
                {submitting ? 'Signing In...' : 'Sign In'}
              </Button>
              <div className="text-center text-sm text-slate-400">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4">
                  Sign Up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Demo login buttons */}
        <div className="space-y-3 p-4 rounded-xl border border-slate-850 bg-slate-900/30 backdrop-blur-md">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
            Demo Login Quick Access
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('admin')}
              className="border-slate-800 hover:bg-violet-950/30 hover:border-violet-500 text-xs text-slate-300 hover:text-violet-400 flex flex-col items-center py-2 h-auto"
              disabled={loading || submitting}
            >
              <ShieldAlert className="w-4 h-4 mb-1" />
              <span>Admin</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('pm')}
              className="border-slate-800 hover:bg-cyan-950/30 hover:border-cyan-500 text-xs text-slate-300 hover:text-cyan-400 flex flex-col items-center py-2 h-auto"
              disabled={loading || submitting}
            >
              <Briefcase className="w-4 h-4 mb-1" />
              <span>Manager</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('member')}
              className="border-slate-800 hover:bg-emerald-950/30 hover:border-emerald-500 text-xs text-slate-300 hover:text-emerald-400 flex flex-col items-center py-2 h-auto"
              disabled={loading || submitting}
            >
              <User className="w-4 h-4 mb-1" />
              <span>Member</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
