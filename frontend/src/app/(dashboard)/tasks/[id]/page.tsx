'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
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
  User, 
  Clock, 
  Trash2, 
  MessageSquare, 
  Paperclip, 
  ChevronRight, 
  Folder,
  Send,
  Upload,
  Lock,
  Edit,
  Download
} from 'lucide-react';

const BACKEND_HOST = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';

export default function TaskDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Comment state
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Attachment state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Edit Task state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editAssignee, setEditAssignee] = useState('UNASSIGNED');
  const [updatingTask, setUpdatingTask] = useState(false);

  const fetchTaskDetails = async () => {
    try {
      const res = await api.get(`/tasks/${taskId}`);
      if (res.success && res.data) {
        setTask(res.data);
        
        // Pre-populate edit form
        setEditTitle(res.data.title);
        setEditDesc(res.data.description);
        setEditStatus(res.data.status);
        setEditPriority(res.data.priority);
        setEditDueDate(res.data.dueDate.split('T')[0]);
        setEditAssignee(res.data.assignedToId || 'UNASSIGNED');
      }
    } catch (error: any) {
      console.error('Failed to load task details:', error);
      toast.error(error.message || 'Could not load task details.');
      router.push('/tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingTask(true);
    try {
      const payload: any = {
        title: editTitle,
        description: editDesc,
        status: editStatus,
        priority: editPriority,
        dueDate: editDueDate,
      };

      payload.assignedToId = editAssignee === 'UNASSIGNED' ? null : editAssignee;

      const res = await api.put(`/tasks/${taskId}`, payload);
      if (res.success) {
        toast.success('Task updated successfully.');
        setEditDialogOpen(false);
        fetchTaskDetails();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task.');
    } finally {
      setUpdatingTask(false);
    }
  };

  const handleStatusChangeOnly = async (newStatus: string) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
      if (res.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchTaskDetails();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status.');
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await api.delete(`/tasks/${taskId}`);
      if (res.success) {
        toast.success('Task deleted successfully.');
        router.push(`/projects/${task.projectId}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete task.');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await api.post(`/tasks/${taskId}/comments`, { text: commentText });
      if (res.success) {
        toast.success('Comment added.');
        setCommentText('');
        fetchTaskDetails(); // Reload to show comment
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await api.post(`/tasks/${taskId}/attachments`, formData);
      if (res.success) {
        toast.success('File uploaded successfully!');
        setSelectedFile(null);
        // Clear input element
        const fileInput = document.getElementById('task-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        fetchTaskDetails();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload file.');
    } finally {
      setUploadingFile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!task) return null;

  const isAssignee = task.assignedToId === user?.id;
  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';
  const canEditAll = isManagerOrAdmin;
  const canUpdateStatus = isManagerOrAdmin || isAssignee;

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
        <Link href={`/projects/${task.projectId}`} className="hover:text-indigo-400 transition font-medium truncate max-w-[120px]">
          {task.project?.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-350 font-bold truncate max-w-[150px]">{task.title}</span>
      </div>

      {/* Task Details panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: Meta details, edits, upload */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-800 bg-slate-900/30 text-slate-100 shadow-md">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={`border text-[9px] font-bold ${getPriorityBadge(task.priority)}`}>
                    {task.priority} Priority
                  </Badge>
                  <Badge variant="outline" className={`border uppercase text-[9px] font-bold ${getStatusBadge(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold text-white pt-2">{task.title}</CardTitle>
              </div>
              
              {isManagerOrAdmin && (
                <div className="flex gap-2">
                  {/* Edit Dialog */}
                  <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogTrigger render={<Button variant="outline" size="icon" className="w-8 h-8 border-slate-800 hover:bg-slate-850" />}>
                      <Edit className="w-4 h-4 text-slate-300" />
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Edit Task Details</DialogTitle>
                        <DialogDescription className="text-slate-400">Modify properties and assignee assignments.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleUpdateTask}>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-task-title">Title</Label>
                            <Input
                              id="edit-task-title"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="bg-slate-950 border-slate-850"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-task-desc">Description</Label>
                            <textarea
                              id="edit-task-desc"
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              className="flex min-h-[80px] w-full rounded-md border border-slate-850 bg-slate-950 px-3 py-2 text-sm text-slate-105"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-task-status">Status</Label>
                              <Select value={editStatus} onValueChange={(val) => setEditStatus(val || '')}>
                                <SelectTrigger className="bg-slate-950 border-slate-850">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                                  <SelectItem value="TODO">Todo</SelectItem>
                                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                  <SelectItem value="COMPLETED">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-task-priority">Priority</Label>
                              <Select value={editPriority} onValueChange={(val) => setEditPriority(val || '')}>
                                <SelectTrigger className="bg-slate-950 border-slate-850">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                                  <SelectItem value="LOW">Low</SelectItem>
                                  <SelectItem value="MEDIUM">Medium</SelectItem>
                                  <SelectItem value="HIGH">High</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-task-duedate">Due Date</Label>
                              <Input
                                id="edit-task-duedate"
                                type="date"
                                value={editDueDate}
                                onChange={(e) => setEditDueDate(e.target.value)}
                                className="bg-slate-950 border-slate-850"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-task-assignee">Assignee</Label>
                              <Select value={editAssignee} onValueChange={(val) => setEditAssignee(val || '')}>
                                <SelectTrigger className="bg-slate-950 border-slate-850">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                                  <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                                  {task.project?.members?.map((m: any) => (
                                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} className="border-slate-800 text-slate-350">
                            Cancel
                          </Button>
                          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500" disabled={updatingTask}>
                            {updatingTask ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" size="icon" onClick={handleDeleteTask} className="w-8 h-8 border-red-950/40 text-red-400 hover:bg-red-950/20">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6 pt-0">
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</h4>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-950/20 border border-slate-850/60 p-4 rounded-xl">
                  {task.description || 'No description provided.'}
                </p>
              </div>

              {/* Status Update Quick Buttons for Assignee */}
              {!isManagerOrAdmin && canUpdateStatus && (
                <div className="p-4 rounded-xl border border-indigo-950/40 bg-indigo-950/10 space-y-3">
                  <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Quick Status Update
                  </h4>
                  <div className="flex gap-2">
                    <Button 
                      variant={task.status === 'TODO' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChangeOnly('TODO')}
                      className={task.status === 'TODO' ? 'bg-indigo-600 text-white' : 'border-slate-800'}
                    >
                      Todo
                    </Button>
                    <Button 
                      variant={task.status === 'IN_PROGRESS' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChangeOnly('IN_PROGRESS')}
                      className={task.status === 'IN_PROGRESS' ? 'bg-cyan-600 text-white' : 'border-slate-800'}
                    >
                      In Progress
                    </Button>
                    <Button 
                      variant={task.status === 'COMPLETED' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChangeOnly('COMPLETED')}
                      className={task.status === 'COMPLETED' ? 'bg-emerald-650 text-white' : 'border-slate-800'}
                    >
                      Completed
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attachments Section */}
          <Card className="border-slate-800 bg-slate-900/30 text-slate-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Paperclip className="w-4.5 h-4.5 text-indigo-400" /> Attachments ({task.attachments?.length || 0})
              </CardTitle>
              <CardDescription className="text-slate-400">Upload documents or images associated with this task.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Attachment Form */}
              <form onSubmit={handleFileUpload} className="flex gap-3 items-end p-3 rounded-lg bg-slate-950/30 border border-slate-850">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="task-file" className="text-slate-400 text-xs">Select File</Label>
                  <input
                    id="task-file"
                    type="file"
                    onChange={handleFileChange}
                    className="flex w-full text-xs text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  size="sm" 
                  className="bg-indigo-600 hover:bg-indigo-500" 
                  disabled={uploadingFile || !selectedFile}
                >
                  <Upload className="w-4 h-4 mr-1.5" /> Upload
                </Button>
              </form>

              {/* Attachments list */}
              <div className="space-y-2">
                {task.attachments?.map((att: any) => (
                  <div key={att.id} className="p-3 rounded-lg bg-slate-950/40 border border-slate-850/60 flex items-center justify-between gap-4">
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold truncate text-slate-200" title={att.fileName}>
                        {att.fileName}
                      </p>
                      <span className="text-[10px] text-slate-500">{new Date(att.createdAt).toLocaleDateString()}</span>
                    </div>
                    <a 
                      href={`${BACKEND_HOST}${att.fileUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 font-bold text-xs shrink-0 flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </div>
                ))}
                {(!task.attachments || task.attachments.length === 0) && (
                  <div className="text-center py-6 text-slate-550 text-xs">No attachments found.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Sidebar - Assignment metadata & Comments */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <Card className="border-slate-800 bg-slate-900/30 text-slate-100">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Task Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-slate-550">Project scope</span>
                <p className="font-semibold text-slate-250 flex items-center gap-1.5">
                  <Folder className="w-4 h-4 text-violet-400" /> {task.project?.name}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-550">Assignee</span>
                <p className="font-semibold text-slate-250 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-cyan-400" /> {task.assignedTo?.name || 'Unassigned'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-550">Due Date</span>
                <p className="font-semibold text-slate-250 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" /> {new Date(task.dueDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card className="border-slate-800 bg-slate-900/30 text-slate-100 flex flex-col max-h-[500px]">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MessageSquare className="w-4.5 h-4.5 text-indigo-400" /> Discussion ({task.comments?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[150px]">
              {task.comments?.map((comment: any) => (
                <div key={comment.id} className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-200">{comment.user?.name}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-350 p-2.5 rounded-lg bg-slate-950/40 border border-slate-850/50 leading-relaxed">
                    {comment.text}
                  </p>
                </div>
              ))}
              {(!task.comments || task.comments.length === 0) && (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs py-8">
                  No comments yet. Start the conversation!
                </div>
              )}
            </CardContent>
            <CardFooter className="p-3 border-t border-slate-800/80 bg-slate-900/50">
              <form onSubmit={handleAddComment} className="flex gap-2 w-full">
                <Input
                  placeholder="Ask a question or post update..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="bg-slate-950 border-slate-850 text-xs h-8 shadow-inner"
                  required
                  disabled={submittingComment}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="w-8 h-8 shrink-0 bg-indigo-600 hover:bg-indigo-500"
                  disabled={submittingComment || !commentText.trim()}
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
