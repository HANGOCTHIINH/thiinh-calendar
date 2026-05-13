import { useState, useEffect } from 'react';
import { format } from 'date-fns';

const slogans = [
  "Mỗi ngày là một cơ hội mới.",
  "Hôm nay bạn sẽ làm điều gì tuyệt vời?",
  "Tập trung và kiên trì, thành công sẽ đến.",
  "Đừng đếm những ngày trôi qua, hãy làm cho mỗi ngày đáng giá.",
  "Bước nhỏ mỗi ngày tạo nên sự thay đổi lớn.",
  "Kỷ luật là cầu nối giữa mục tiêu và thành tựu.",
  "Hãy làm việc thông minh hơn, không phải vất vả hơn."
];

export function Header() {
  const [time, setTime] = useState(new Date());
  const [slogan, setSlogan] = useState('');

  useEffect(() => {
    setSlogan(slogans[new Date().getDay() % slogans.length]);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex flex-col md:flex-row justify-between items-center py-6 mb-2 border-b border-slate-200">
      <div>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 pb-1 tracking-tight">
          Lịch của Thiinh
        </h1>
        <p className="text-text-muted mt-2 text-sm italic font-light">{slogan}</p>
      </div>
      <div className="mt-4 md:mt-0 px-6 py-3 bg-bg-card/80 backdrop-blur-md rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.15)] border border-slate-200">
        <div className="text-3xl font-semibold tracking-wider text-slate-800">
          {format(time, 'HH:mm:ss')}
        </div>
        <div className="text-xs text-gray-500 text-center mt-1 uppercase tracking-widest">
          {format(time, 'dd MMM yyyy')}
        </div>
      </div>
    </header>
  );
}
