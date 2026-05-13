import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { WeeklyGrid } from '../components/WeeklyGrid';
import { MonthlyGrid } from '../components/MonthlyGrid';
import { TaskModal } from '../components/TaskModal';
import { Analytics } from '../components/Analytics';
import { useData } from '../hooks/useData';

import type { Task, Category, Mood } from '../types';
import { LogOut, Search, CalendarDays, CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react';
import { addWeeks, subWeeks } from 'date-fns';
import { supabase } from '../lib/supabase';

import clsx from 'clsx';

export default function Dashboard() {
  const { tasks, setTasks, dailyData, setDailyData, isLoaded } = useData();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const [view, setView] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'Tất cả'>('Tất cả');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = filterCategory === 'Tất cả' || task.category === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [tasks, searchQuery, filterCategory]);

  const handleAddTask = (date: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: 'Công việc mới',
      startTime: '09:00',
      endTime: '10:00',
      category: 'Học tập',
      date,
      notes: [],
      completed: false
    };
    setSelectedTask(newTask);
  };

  const handleSaveTask = (updatedTask: Task) => {
    const exists = tasks.find(t => t.id === updatedTask.id);
    if (exists) {
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    } else {
      setTasks([...tasks, updatedTask]);
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleToggleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleEnergyChange = (date: string, level: number) => {
    const existing = dailyData.find(d => d.date === date);
    if (existing) {
      setDailyData(dailyData.map(d => d.date === date ? { ...d, energyLevel: level } : d));
    } else {
      setDailyData([...dailyData, { date, energyLevel: level }]);
    }
  };

  const handleMoodChange = (date: string, mood: Mood) => {
    const existing = dailyData.find(d => d.date === date);
    if (existing) {
      setDailyData(dailyData.map(d => d.date === date ? { ...d, mood } : d));
    } else {
      setDailyData([...dailyData, { date, energyLevel: 50, mood }]);
    }
  };

  if (!isLoaded) {
    return <div className="min-h-screen bg-bg-base text-slate-800 flex items-center justify-center">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-main font-sans p-4 md:p-8 selection:bg-purple-500/30">
      <div className="max-w-7xl mx-auto space-y-6">
        <Header />

        {/* Sync Info / Navigation Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-bg-card/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 bg-bg-base p-1 rounded-xl border border-slate-200">
            <button 
              onClick={() => setView('week')}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer",
                view === 'week' ? "bg-purple-500 text-slate-800 shadow-lg" : "text-text-muted hover:text-slate-800"
              )}
            >
              <CalendarDays className="w-4 h-4" /> Lịch Tuần
            </button>
            <button 
              onClick={() => setView('month')}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer",
                view === 'month' ? "bg-blue-500 text-slate-800 shadow-lg" : "text-text-muted hover:text-slate-800"
              )}
            >
              <CalendarRange className="w-4 h-4" /> Lịch Tháng
            </button>
          </div>

          {view === 'week' && (
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-text-muted hover:text-slate-800">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="font-semibold text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-[#a855f7] cursor-pointer hover:opacity-80">
                Tuần này
              </button>
              <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-text-muted hover:text-slate-800">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <span className="text-blue-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"/> Đã đồng bộ</span>
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
              }}
              className="flex items-center gap-2 text-slate-500 hover:text-red-500 cursor-pointer px-3 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 transition-colors ml-4"
            >
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
            <input 
              type="text" 
              placeholder="Tìm kiếm công việc..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-bg-card/80 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-blue-500 transition-colors shadow-sm backdrop-blur-md"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {['Tất cả', 'Học tập', 'Dự án', 'Cá nhân'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat as any)}
                className={clsx(
                  "px-6 py-3.5 rounded-xl border whitespace-nowrap transition-all font-medium cursor-pointer",
                  filterCategory === cat 
                    ? cat === 'Học tập' ? 'bg-purple-500/30 border-purple-500 text-purple-700 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                      : cat === 'Dự án' ? 'bg-blue-500/30 border-blue-500 text-blue-700 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : cat === 'Cá nhân' ? 'bg-pink-500/30 border-pink-500 text-pink-700 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                      : 'bg-slate-100 border-white text-slate-800'
                    : 'bg-bg-card/80 border-slate-200 text-text-muted hover:border-[#a4a1b5] hover:bg-slate-50 backdrop-blur-md'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {view === 'week' ? (
          <WeeklyGrid 
            tasks={filteredTasks}
            dailyData={dailyData}
            currentDate={currentDate}
            onTaskClick={setSelectedTask}
            onAddTask={handleAddTask}
            onToggleComplete={handleToggleComplete}
            onEnergyChange={handleEnergyChange}
          />
        ) : (
          <MonthlyGrid 
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            tasks={filteredTasks}
            onAddTask={handleAddTask}
            onDayClick={(date) => {
              setCurrentDate(new Date(date));
              setView('week');
            }}
          />
        )}

        <Analytics 
          tasks={tasks}
          dailyData={dailyData}
          onMoodChange={handleMoodChange}
        />

        <TaskModal 
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      </div>
    </div>
  );
}
