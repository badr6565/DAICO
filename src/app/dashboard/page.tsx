'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Security & Route Protection
  useEffect(() => {
    setIsClient(true);
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle.trim() }),
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks([newTask, ...tasks]);
        setNewTaskTitle('');
      } else if (res.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to add task', error);
    }
  };

  const handleToggleTask = async (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'PUT' });
      if (res.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    }
  };

  const handleDeleteTask = async (id: string) => {
    const previousTasks = [...tasks];
    setTasks(tasks.filter(t => t.id !== id));

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      setTasks(previousTasks);
    }
  };

  if (!isClient || (!isAuthenticated && loadingTasks)) return null; 

  return (
    <div className="min-h-screen">
      {/* Top Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Soft Light Theme SVG Logo */}
            <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-500 shadow-sm border border-sky-200">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800">
              Secure<span className="text-sky-500">Do</span>
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-slate-500 hidden sm:block">
              Welcome back, <span className="text-sky-600">User</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 hover:text-rose-500 text-sm font-bold rounded-xl border border-slate-200 transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
            >
              Log Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-3">
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-500">Tasks</span>
          </h1>
          <p className="text-slate-500 font-medium">Manage your daily objectives in a secure workspace.</p>
        </header>

        {/* Add Task Form - Floating Card */}
        <form onSubmit={handleAddTask} className="mb-10 relative">
          <div className="flex items-center bg-white rounded-2xl p-2 shadow-md border border-slate-100 focus-within:ring-2 focus-within:ring-sky-300 focus-within:border-sky-300 transition-all duration-300">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 bg-transparent border-none text-slate-800 px-4 py-3 focus:outline-none focus:ring-0 placeholder-slate-400 font-medium"
              maxLength={200}
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="ml-2 px-8 py-3 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-white font-bold rounded-xl shadow-sm hover:shadow-md disabled:opacity-50 disabled:shadow-none transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              Add
            </button>
          </div>
        </form>

        {/* Task List */}
        <div className="space-y-4">
          {loadingTasks ? (
            <div className="text-center py-16 text-slate-400 font-medium animate-pulse">Loading your tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-200 border-dashed">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium">All caught up! Time to relax or add a new task.</p>
            </div>
          ) : (
            tasks.map(task => (
              <div 
                key={task.id} 
                className={`group flex items-center justify-between p-5 bg-white rounded-2xl border transition-all duration-300 ${
                  task.completed 
                    ? 'border-slate-200 shadow-sm opacity-75' 
                    : 'border-slate-100 shadow-md hover:shadow-lg hover:border-sky-200'
                }`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Creative Custom Checkbox */}
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className={`flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-300 ${
                      task.completed 
                        ? 'bg-sky-500 border-sky-500 text-white shadow-sm' 
                        : 'bg-slate-50 border-slate-300 group-hover:border-sky-400'
                    }`}
                  >
                    {task.completed && (
                      <svg className="w-4 h-4 stroke-[3px]" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l3 3 7-7" />
                      </svg>
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleToggleTask(task.id)}>
                    <p className={`text-base font-semibold truncate transition-colors duration-300 ${
                      task.completed ? 'text-slate-400 line-through' : 'text-slate-700 group-hover:text-slate-900'
                    }`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{new Date(task.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="ml-4 p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  aria-label="Delete task"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
