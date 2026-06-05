'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

export default function SignupPage() {
  const { signup, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('TEAM_MEMBER');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      toast.error('All fields are required.');
      return;
    }

    setSubmitting(true);
    try {
      await signup(name, email, password, role);
      toast.success('Registration successful! Please login.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Email might be taken.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400">
            HeroCollab
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Smart Project & Task Collaboration System
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl text-slate-100 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-400" /> Create Account
            </CardTitle>
            <CardDescription className="text-slate-400">
              Sign up to start collaborating with your team.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-950 border-slate-850 text-slate-100 focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  disabled={loading || submitting}
                />
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-300">System Role</Label>
                <Select
                  value={role}
                  onValueChange={(val) => setRole(val || '')}
                  disabled={loading || submitting}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-850 text-slate-100 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                    <SelectItem value="TEAM_MEMBER" className="hover:bg-slate-800 focus:bg-slate-800">
                      Team Member (Update assigned tasks only)
                    </SelectItem>
                    <SelectItem value="PROJECT_MANAGER" className="hover:bg-slate-800 focus:bg-slate-800">
                      Project Manager (Create projects, assign tasks)
                    </SelectItem>
                    <SelectItem value="ADMIN" className="hover:bg-slate-800 focus:bg-slate-800">
                      Admin (Full system access)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition duration-200 shadow-lg shadow-indigo-600/20"
                disabled={loading || submitting}
              >
                {submitting ? 'Creating Account...' : 'Sign Up'}
              </Button>
              <div className="text-center text-sm text-slate-400">
                Already have an account?{' '}
                <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4">
                  Sign In
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
