
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, format, isSameMonth, isToday
} from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Task } from '../types';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface MonthlyGridProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  tasks: Task[];
  onAddTask: (date: string) => void;
  onDayClick: (date: string) => void;
}

export function MonthlyGrid({ currentDate, onDateChange, tasks, onAddTask, onDayClick }: MonthlyGridProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => onDateChange(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  const prevMonth = () => onDateChange(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));

  return (
    <div className="bg-bg-card rounded-2xl border border-slate-200 shadow-2xl overflow-hidden backdrop-blur-sm">
      <div className="p-6 flex items-center justify-between border-b border-slate-200 bg-bg-base/50">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-[#a855f7]">
          {format(currentDate, 'MMMM yyyy', { locale: vi }).replace(/^\w/, c => c.toUpperCase())}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
            <ChevronLeft className="w-6 h-6 text-text-muted" />
          </button>
          <button onClick={() => onDateChange(new Date())} className="px-4 py-2 text-sm font-medium hover:bg-slate-100 rounded-xl transition-colors text-text-main cursor-pointer">
            Hôm nay
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
            <ChevronRight className="w-6 h-6 text-text-muted" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-200">
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
          <div key={day} className="py-3 text-center text-sm font-semibold text-text-muted">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[120px] lg:auto-rows-[150px]">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayTasks = tasks.filter(t => t.date === dateStr);
          const isCurrMonth = isSameMonth(day, monthStart);
          const isDayToday = isToday(day);

          return (
            <div 
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              className={clsx(
                "p-2 border-r border-b border-slate-200/50 relative group cursor-pointer transition-colors hover:bg-slate-50",
                !isCurrMonth && "opacity-40 bg-black/20",
                isDayToday && "bg-purple-500/10"
              )}
            >
              <div className="flex justify-between items-start">
                <span className={clsx(
                  "w-7 h-7 flex items-center justify-center rounded-full text-sm",
                  isDayToday ? "bg-purple-500 text-slate-800 font-bold" : "text-text-muted"
                )}>
                  {format(day, 'd')}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); onAddTask(dateStr); }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded text-blue-500 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-2 flex flex-col gap-1 overflow-y-auto max-h-[70px] hide-scrollbar">
                {dayTasks.map(t => (
                  <div key={t.id} className={clsx(
                    "text-xs px-2 py-1 rounded truncate",
                    t.category === 'Học tập' ? "bg-purple-500/20 text-purple-700" :
                    t.category === 'Dự án' ? "bg-blue-500/20 text-blue-700" :
                    "bg-pink-500/20 text-pink-700"
                  )}>
                    {t.startTime} - {t.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
