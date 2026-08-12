import React, { useState, useMemo, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, startOfDay, endOfDay, subDays } from 'date-fns';
import type { TimesheetRecord, ShiftType } from '../types';
import { Calculator, Clock, Download, Plus, Trash2, CalendarCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const SHIFT_HOURS = {
  1: 4.5, // 8:00 - 12:30
  2: 5.5, // 12:30 - 18:00
  3: 4.5, // 18:00 - 22:30
};

const HOURLY_RATE = 19000;

interface TimesheetViewProps {
  records: TimesheetRecord[];
  onAddRecord: (record: TimesheetRecord) => void;
  onRemoveRecord: (id: string) => void;
}

export function TimesheetView({ records, onAddRecord, onRemoveRecord }: TimesheetViewProps) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [shift, setShift] = useState<ShiftType>(1);
  const [overtime, setOvertime] = useState<number | ''>('');
  const [bonus, setBonus] = useState<number | ''>('');
  const [penalty, setPenalty] = useState<number | ''>('');

  // Mode: 'cycle' (Chốt theo ngày lấy lương) or 'custom' (Chọn khoảng ngày tùy chỉnh)
  const [filterMode, setFilterMode] = useState<'cycle' | 'custom'>('cycle');
  
  // Payday cutoff day (Day of month: 1 - 31)
  const [cutoffDay, setCutoffDay] = useState<number>(() => {
    const saved = localStorage.getItem('thiinh-payday-cutoff');
    return saved ? Number(saved) : 5; // Default 5th of month
  });

  // Cycle Offset (0 = Current cycle, -1 = Previous cycle, +1 = Next cycle)
  const [cycleOffset, setCycleOffset] = useState<number>(0);

  const [filterStartDate, setFilterStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [filterEndDate, setFilterEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  useEffect(() => {
    localStorage.setItem('thiinh-payday-cutoff', cutoffDay.toString());
  }, [cutoffDay]);

  // Compute active pay cycle dates
  const activeCycle = useMemo(() => {
    const now = new Date();
    let currentYear = now.getFullYear();
    let currentMonth = now.getMonth(); // 0-indexed

    if (now.getDate() < cutoffDay) {
      currentMonth -= 1;
    }

    const targetStart = new Date(currentYear, currentMonth + cycleOffset, cutoffDay);
    const targetEnd = subDays(new Date(currentYear, currentMonth + cycleOffset + 1, cutoffDay), 1);

    return {
      start: startOfDay(targetStart),
      end: endOfDay(targetEnd),
      startDateStr: format(targetStart, 'yyyy-MM-dd'),
      endDateStr: format(targetEnd, 'yyyy-MM-dd'),
      label: `Kỳ ${format(targetStart, 'dd/MM')} - ${format(targetEnd, 'dd/MM/yyyy')}`
    };
  }, [cutoffDay, cycleOffset]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRecord({
      id: `ts-${Date.now()}`,
      date,
      shift,
      overtimeHours: Number(overtime) || 0,
      bonus: Number(bonus) || 0,
      penalty: Number(penalty) || 0,
    });
    // Reset form mostly, keep date
    setShift(1);
    setOvertime('');
    setBonus('');
    setPenalty('');
  };

  const filteredRecords = useMemo(() => {
    let start: Date;
    let end: Date;

    if (filterMode === 'cycle') {
      start = activeCycle.start;
      end = activeCycle.end;
    } else {
      start = startOfDay(parseISO(filterStartDate));
      end = endOfDay(parseISO(filterEndDate));
    }
    
    return records
      .filter(r => isWithinInterval(parseISO(r.date), { start, end }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, filterMode, activeCycle, filterStartDate, filterEndDate]);

  const summary = useMemo(() => {
    let totalShifts = 0;
    let totalRegularHours = 0;
    let totalOvertime = 0;
    let totalBonus = 0;
    let totalPenalty = 0;

    filteredRecords.forEach(r => {
      totalShifts += 1;
      totalRegularHours += SHIFT_HOURS[r.shift];
      totalOvertime += r.overtimeHours;
      totalBonus += r.bonus;
      totalPenalty += r.penalty;
    });

    const totalHours = totalRegularHours + totalOvertime;
    const totalSalary = (totalHours * HOURLY_RATE) + totalBonus - totalPenalty;

    return { totalShifts, totalRegularHours, totalOvertime, totalBonus, totalPenalty, totalSalary, totalHours };
  }, [filteredRecords]);

  const handleExport = () => {
    let csv = 'Ngày,Ca làm,Số giờ ca,Tăng ca,Thưởng,Phạt,Thành tiền\n';
    
    filteredRecords.forEach(r => {
      const regHours = SHIFT_HOURS[r.shift];
      const rowSalary = (regHours + r.overtimeHours) * HOURLY_RATE + r.bonus - r.penalty;
      csv += `${r.date},Ca ${r.shift},${regHours},${r.overtimeHours},${r.bonus},${r.penalty},${rowSalary}\n`;
    });

    csv += `\nTỔNG CỘNG:,${summary.totalShifts} ca,${summary.totalRegularHours}h,${summary.totalOvertime}h,${summary.totalBonus},${summary.totalPenalty},${summary.totalSalary}`;

    const dateRangeLabel = filterMode === 'cycle' ? activeCycle.label.replace(/\//g, '-') : `${filterStartDate}-den-${filterEndDate}`;
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cham-cong-${dateRangeLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 md:p-6 border border-white/60 shadow-lg h-fit"
      >
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" /> Chấm công mới
        </h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ngày làm việc</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ca làm việc</label>
            <select
              value={shift}
              onChange={(e) => setShift(Number(e.target.value) as ShiftType)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Ca 1 (08:00 - 12:30) • 4.5h</option>
              <option value={2}>Ca 2 (12:30 - 18:00) • 5.5h</option>
              <option value={3}>Ca 3 (18:00 - 22:30) • 4.5h</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Giờ tăng ca (nếu có)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={overtime}
              onChange={(e) => setOvertime(Number(e.target.value))}
              placeholder="VD: 1.5"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Thưởng (VNĐ)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={bonus}
                onChange={(e) => setBonus(Number(e.target.value))}
                placeholder="0"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phạt (VNĐ)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={penalty}
                onChange={(e) => setPenalty(Number(e.target.value))}
                placeholder="0"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button 
            type="submit"
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Ghi nhận ca làm
          </button>
        </form>
      </motion.div>

      {/* Summary & List Section */}
      <div className="lg:col-span-2 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 md:p-6 border border-white/60 shadow-xl"
        >
          {/* Header & Filter Toggle Bar */}
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                <Calculator className="w-5 h-5 text-indigo-500" /> Tổng kết lương
              </h3>

              <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/80 w-full sm:w-auto">
                <button
                  onClick={() => setFilterMode('cycle')}
                  className={clsx(
                    "flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                    filterMode === 'cycle' ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <CalendarCheck className="w-3.5 h-3.5" /> Theo ngày lấy lương
                </button>
                <button
                  onClick={() => setFilterMode('custom')}
                  className={clsx(
                    "flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                    filterMode === 'custom' ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <Clock className="w-3.5 h-3.5" /> Khoảng ngày
                </button>
              </div>
            </div>

            {/* Sub-Filter Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100/80">
              {filterMode === 'cycle' ? (
                <div className="flex flex-wrap items-center justify-between sm:justify-start gap-3 w-full">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <span className="text-slate-500">Ngày chốt lương:</span>
                    <select
                      value={cutoffDay}
                      onChange={(e) => setCutoffDay(Number(e.target.value))}
                      className="bg-white border border-indigo-200 rounded-lg px-2 py-1 font-bold text-indigo-600 focus:outline-none cursor-pointer"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>Ngày {day} hàng tháng</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => setCycleOffset(prev => prev - 1)}
                      className="p-1.5 hover:bg-white rounded-lg border border-slate-200/60 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                      title="Kỳ trước"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCycleOffset(0)}
                      className={clsx(
                        "px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer",
                        cycleOffset === 0 ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      Kỳ hiện tại
                    </button>
                    <button
                      onClick={() => setCycleOffset(prev => prev + 1)}
                      className="p-1.5 hover:bg-white rounded-lg border border-slate-200/60 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                      title="Kỳ sau"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="w-full text-xs text-indigo-700 font-semibold bg-white/70 px-3 py-1.5 rounded-xl border border-indigo-100 flex justify-between items-center mt-1">
                    <span>📅 {activeCycle.label}</span>
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Xuất CSV
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-2 w-full">
                  <div className="flex flex-wrap items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm w-full sm:w-auto">
                    <span className="text-slate-500 font-medium">Từ</span>
                    <input 
                      type="date" 
                      value={filterStartDate}
                      onChange={(e) => setFilterStartDate(e.target.value)}
                      className="bg-transparent focus:outline-none font-medium text-slate-700"
                    />
                    <span className="text-slate-500 font-medium border-l pl-2 border-slate-200">Đến</span>
                    <input 
                      type="date" 
                      value={filterEndDate}
                      onChange={(e) => setFilterEndDate(e.target.value)}
                      className="bg-transparent focus:outline-none font-medium text-slate-700"
                    />
                  </div>
                  <button 
                    onClick={handleExport}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-700 shadow-sm transition-all cursor-pointer w-full sm:w-auto"
                  >
                    <Download className="w-4 h-4 text-blue-500" /> Xuất CSV
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-blue-100">
              <p className="text-xs text-text-muted mb-1">Tổng số ca</p>
              <p className="text-xl font-bold text-slate-800">{summary.totalShifts}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-100">
              <p className="text-xs text-text-muted mb-1">Tổng giờ làm</p>
              <p className="text-xl font-bold text-slate-800">{summary.totalHours}h</p>
              <p className="text-xs text-slate-500 mt-1">Gồm {summary.totalOvertime}h tăng ca</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-100">
              <p className="text-xs text-text-muted mb-1">Thưởng / Phạt</p>
              <p className="text-sm font-bold text-green-600">+{formatMoney(summary.totalBonus)}</p>
              <p className="text-sm font-bold text-red-500">-{formatMoney(summary.totalPenalty)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-100 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
              <p className="text-xs text-indigo-100 mb-1">Tổng thu nhập</p>
              <p className="text-xl font-bold">{formatMoney(summary.totalSalary)}</p>
            </div>
          </div>
        </motion.div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h4 className="font-bold text-slate-800">Lịch sử làm việc</h4>
            <span className="text-xs font-medium px-2 py-1 bg-white rounded-md border border-slate-200 text-slate-600">
              19k/giờ
            </span>
          </div>
          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center text-text-muted">
              Không có dữ liệu chấm công trong khoảng thời gian này.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRecords.map(r => {
                const regHours = SHIFT_HOURS[r.shift];
                const rowSalary = (regHours + r.overtimeHours) * HOURLY_RATE + r.bonus - r.penalty;
                
                return (
                  <div key={r.id} className="p-4 hover:bg-slate-50 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex flex-col items-center justify-center font-bold">
                        <span className="text-xs opacity-80">Ca</span>
                        <span>{r.shift}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{format(parseISO(r.date), 'dd/MM/yyyy')}</p>
                        <p className="text-sm text-text-muted">
                          {regHours}h {r.overtimeHours > 0 && <span className="text-purple-500">+{r.overtimeHours}h OT</span>}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/2">
                      <div className="text-right">
                        <p className="font-bold text-slate-800">{formatMoney(rowSalary)}</p>
                        <div className="flex gap-2 text-xs">
                          {r.bonus > 0 && <span className="text-green-600">+{r.bonus / 1000}k</span>}
                          {r.penalty > 0 && <span className="text-red-500">-{r.penalty / 1000}k</span>}
                        </div>
                      </div>
                      <button 
                        onClick={() => onRemoveRecord(r.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
