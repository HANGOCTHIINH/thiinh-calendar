import { useState, useEffect } from 'react';
import { format } from 'date-fns';

const quotes = [
  "Có công mài sắt, có ngày nên kim.",
  "Đi một ngày đàng, học một sàng khôn.",
  "Học thầy không tày học bạn.",
  "Muốn biết phải hỏi, muốn giỏi phải học.",
  "Học, học nữa, học mãi. - V.I. Lenin",
  "Thất bại là mẹ thành công.",
  "Không có gì quý hơn độc lập tự do. - Hồ Chí Minh",
  "Trên bước đường thành công không có dấu chân của kẻ lười biếng. - Lỗ Tấn",
  "Đường đi khó không khó vì ngăn sông cách núi, mà khó vì lòng người ngại núi e sông.",
  "Cuộc đời là một tác phẩm nghệ thuật, hãy vẽ nó thật đẹp.",
  "Hãy hướng về phía mặt trời, bóng tối sẽ ngả về sau bạn.",
  "Nơi nào có ý chí, nơi đó có con đường.",
  "Một nụ cười bằng mười thang thuốc bổ.",
  "Người ta có thể quên đi điều bạn nói, nhưng những gì bạn để lại trong lòng họ thì không bao giờ phai nhạt.",
  "Đừng đếm những ngày trôi qua, hãy làm cho mỗi ngày đáng giá.",
  "Khởi đầu là một nửa của mọi công việc.",
  "Hãy làm việc thông minh hơn, không phải vất vả hơn.",
  "Mỗi ngày là một cơ hội mới.",
  "Hãy tự làm người dẫn đường cho chính mình.",
  "Nụ cười là chiếc chìa khóa mở được mọi cánh cửa trái tim.",
  "Không có áp lực, không có kim cương.",
  "Điều tuyệt vời nhất thường đến khi bạn ít mong chờ nhất."
];

function getDayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export function Header() {
  const [time, setTime] = useState(new Date());
  const [slogan, setSlogan] = useState('');

  useEffect(() => {
    const dayOfYear = getDayOfYear(new Date());
    setSlogan(quotes[dayOfYear % quotes.length]);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex flex-col md:flex-row justify-between items-center py-6 mb-2 border-b border-slate-200">
      <div>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 pb-1 tracking-tight">
          Thời Khóa Biểu
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
