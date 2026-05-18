import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import type { TimesheetRecord, ShiftType } from '../types';
import { Calculator, Clock, Download, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

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

  const [filterStartDate, setFilterStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [filterEndDate, setFilterEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

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
    const start = startOfDay(parseISO(filterStartDate));
    const end = endOfDay(parseISO(filterEndDate));
    
    return records
      .filter(r => isWithinInterval(parseISO(r.date), { start, end }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, filterStartDate, filterEndDate]);

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

    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cham-cong-${filterStartDate}-den-${filterEndDate}.csv`);
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
        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-fit"
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
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
              <Calculator className="w-5 h-5 text-indigo-500" /> Tổng kết lương
            </h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500">Từ</span>
                <input 
                  type="date" 
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="bg-transparent text-sm focus:outline-none"
                />
                <span className="text-xs text-slate-500 border-l pl-2 border-slate-200">Đến</span>
                <input 
                  type="date" 
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="bg-transparent text-sm focus:outline-none"
                />
              </div>
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" /> Xuất CSV
              </button>
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
