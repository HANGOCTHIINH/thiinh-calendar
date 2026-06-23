import { useMemo, useEffect, useState } from 'react';
import { format, startOfYear, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { SpecialDay } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { getDailyQuote } from '../lib/quotes';
import confetti from 'canvas-confetti';
import { Gift, Plus, Star, X } from 'lucide-react';

interface YearViewProps {
  currentDate: Date;
  specialDays: SpecialDay[];
  userSpecialDays: SpecialDay[];
  onAddSpecialDay: (day: SpecialDay) => void;
  onRemoveSpecialDay: (id: string) => void;
  onDateClick: (date: Date) => void;
}

export function YearView({ currentDate, specialDays, userSpecialDays, onAddSpecialDay, onRemoveSpecialDay, onDateClick }: YearViewProps) {
  const currentYear = currentDate.getFullYear();
  const months = useMemo(() => {
    const yearStart = startOfYear(currentDate);
    return Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i));
  }, [currentYear]);

  const [selectedDateToAdd, setSelectedDateToAdd] = useState<Date | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventType, setNewEventType] = useState<'birthday' | 'custom'>('birthday');

  useEffect(() => {
    // Check if today is a birthday
    const today = new Date();
    const todayFormatted = format(today, 'MM-dd');
    const hasBirthday = specialDays.some(sd => sd.date === todayFormatted && sd.type === 'birthday');
    
    if (hasBirthday) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ff0000', '#00ff00', '#0000ff']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ff0000', '#00ff00', '#0000ff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [specialDays]);

  const handleSaveEvent = () => {
    if (selectedDateToAdd && newEventName.trim()) {
      onAddSpecialDay({
        id: `sd-${Date.now()}`,
        name: newEventName.trim(),
        date: format(selectedDateToAdd, 'MM-dd'),
        type: newEventType
      });
      setIsAddingEvent(false);
      setNewEventName('');
      setNewEventType('birthday');
    }
  };

  const handleCloseModal = () => {
    setSelectedDateToAdd(null);
    setIsAddingEvent(false);
    setNewEventName('');
    setNewEventType('birthday');
  };

  const getSpecialDaysForDate = (date: Date) => {
    const formattedDate = format(date, 'MM-dd');
    return specialDays.filter(sd => sd.date === formattedDate);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-2xl border border-purple-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500"></div>
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Châm ngôn hôm nay
        </h3>
        <p className="text-lg text-slate-700 italic border-l-4 border-purple-400 pl-4 py-1">"{getDailyQuote(currentDate)}"</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {months.map(month => {
          const daysInMonth = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
          const firstDayOfWeek = startOfMonth(month).getDay();
          const paddingDays = Array.from({ length: firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 }, (_, i) => i);

          return (
            <div key={month.toISOString()} className="bg-bg-card border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-center mb-3 text-slate-800 capitalize">
                {format(month, 'MMMM', { locale: vi })}
              </h4>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-text-muted mb-2">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                  <div key={d} className="font-medium">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {paddingDays.map(i => <div key={`pad-${i}`} />)}
                {daysInMonth.map(day => {
                  const daySpecialEvents = getSpecialDaysForDate(day);
                  const isHoliday = daySpecialEvents.some(e => e.type === 'holiday');
                  const isBirthday = daySpecialEvents.some(e => e.type === 'birthday');
                  const isToday = isSameDay(day, new Date());

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDateToAdd(day)}
                      onDoubleClick={() => onDateClick(day)}
                      title={daySpecialEvents.map(e => e.name).join(', ')}
                      className={clsx(
                        "aspect-square flex items-center justify-center rounded-full text-sm transition-all cursor-pointer relative",
                        isToday ? "bg-blue-500 text-white font-bold shadow-md" : "hover:bg-slate-100 text-slate-700",
                        isHoliday && !isToday && "text-red-600 font-bold bg-red-50",
                        isBirthday && !isToday && "text-pink-600 font-bold bg-pink-50"
                      )}
                    >
                      {format(day, 'd')}
                      {daySpecialEvents.length > 0 && !isToday && (
                        <span className={clsx(
                          "absolute bottom-0.5 w-1 h-1 rounded-full",
                          isHoliday ? "bg-red-500" : isBirthday ? "bg-pink-500" : "bg-purple-500"
                        )} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-pink-500" /> Sự kiện đặc biệt của bạn
        </h3>
        {userSpecialDays.length === 0 ? (
          <p className="text-text-muted text-sm">Chưa có sự kiện nào. Hãy click vào một ngày trên lịch để thêm!</p>
        ) : (
          <div className="space-y-3">
            {userSpecialDays.map(sd => (
              <div key={sd.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                    sd.type === 'birthday' ? "bg-gradient-to-br from-pink-400 to-rose-500" : "bg-gradient-to-br from-purple-400 to-indigo-500"
                  )}>
                    {sd.date.split('-')[1]}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{sd.name}</p>
                    <p className="text-xs text-text-muted">Ngày {sd.date.split('-')[1]} tháng {sd.date.split('-')[0]} • {sd.type === 'birthday' ? 'Sinh nhật' : 'Kỷ niệm'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onRemoveSpecialDay(sd.id)}
                  className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedDateToAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-200/50 flex items-center justify-between bg-white/50">
                <h3 className="font-bold text-lg text-slate-800">
                  {format(selectedDateToAdd, 'dd/MM/yyyy')}
                </h3>
                <button onClick={handleCloseModal} className="p-2 hover:bg-slate-200/50 rounded-full transition-colors cursor-pointer text-slate-500 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                {!isAddingEvent ? (
                  <div className="space-y-6">
                    {getSpecialDaysForDate(selectedDateToAdd).length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Sự kiện trong ngày</h4>
                        {getSpecialDaysForDate(selectedDateToAdd).map(sd => (
                          <div key={sd.id} className={clsx(
                            "flex items-center gap-3 p-3 rounded-xl border",
                            sd.type === 'holiday' ? "bg-red-50 border-red-100" :
                            sd.type === 'birthday' ? "bg-pink-50 border-pink-100" : "bg-purple-50 border-purple-100"
                          )}>
                            <div className={clsx(
                              "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0",
                              sd.type === 'holiday' ? "bg-red-500" :
                              sd.type === 'birthday' ? "bg-pink-500" : "bg-purple-500"
                            )}>
                              <Star className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{sd.name}</p>
                              <p className="text-xs text-slate-500">
                                {sd.type === 'holiday' ? 'Ngày lễ quốc gia' : sd.type === 'birthday' ? 'Sinh nhật' : 'Kỷ niệm'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Gift className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500">Không có sự kiện nào trong ngày này</p>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => setIsAddingEvent(true)}
                      className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-blue-200"
                    >
                      <Plus className="w-5 h-5" /> Thêm sự kiện cá nhân
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tên sự kiện</label>
                      <input
                        type="text"
                        value={newEventName}
                        onChange={(e) => setNewEventName(e.target.value)}
                        placeholder="VD: Sinh nhật mẹ, Kỷ niệm..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Loại sự kiện</label>
                      <div className="flex gap-4">
                        <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 rounded-xl border border-pink-200 bg-pink-50 hover:bg-pink-100 transition-colors">
                          <input 
                            type="radio" 
                            name="type" 
                            checked={newEventType === 'birthday'} 
                            onChange={() => setNewEventType('birthday')}
                            className="text-pink-500 focus:ring-pink-500 w-4 h-4"
                          />
                          <span className="text-pink-700 font-medium">Sinh nhật</span>
                        </label>
                        <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors">
                          <input 
                            type="radio" 
                            name="type" 
                            checked={newEventType === 'custom'} 
                            onChange={() => setNewEventType('custom')}
                            className="text-purple-500 focus:ring-purple-500 w-4 h-4"
                          />
                          <span className="text-purple-700 font-medium">Kỷ niệm</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="pt-4 flex justify-end gap-3">
                      <button 
                        onClick={() => setIsAddingEvent(false)}
                        className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer font-medium"
                      >
                        Quay lại
                      </button>
                      <button 
                        onClick={handleSaveEvent}
                        disabled={!newEventName.trim()}
                        className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer flex items-center gap-2 font-medium shadow-md"
                      >
                        <Plus className="w-4 h-4" /> Lưu sự kiện
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
