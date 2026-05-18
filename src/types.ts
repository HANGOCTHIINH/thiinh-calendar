export type Category = 'Học tập' | 'Dự án' | 'Cá nhân';

export type Note = {
  id: string;
  text: string;
  completed: boolean;
};

export type Task = {
  id: string;
  title: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  category: Category;
  date: string; // YYYY-MM-DD
  notes: Note[];
  completed: boolean;
};

export type Mood = 'Tuyệt vời' | 'Tốt' | 'Bình thường' | 'Tệ' | 'Rất tệ';

export type DailyData = {
  date: string;
  energyLevel: number; // 0 - 100
  mood?: Mood;
};

export type SpecialDay = {
  id: string;
  name: string;
  date: string; // MM-DD format
  type: 'birthday' | 'holiday' | 'custom';
};

export type ShiftType = 1 | 2 | 3;

export type TimesheetRecord = {
  id: string;
  date: string; // YYYY-MM-DD
  shift: ShiftType;
  overtimeHours: number;
  bonus: number;
  penalty: number;
};
