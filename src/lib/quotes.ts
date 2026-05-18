export const dailyQuotes = [
  "Có công mài sắt có ngày nên kim.",
  "Đi một ngày đàng học một sàng khôn.",
  "Thất bại là mẹ thành công.",
  "Học, học nữa, học mãi.",
  "Gần mực thì đen, gần đèn thì rạng.",
  "Lửa thử vàng, gian nan thử sức.",
  "Ăn quả nhớ kẻ trồng cây.",
  "Muốn sang thì bắc cầu Kiều, muốn con hay chữ thì yêu lấy thầy.",
  "Mỗi ngày là một món quà, đừng lãng phí nó.",
  "Hôm nay là cơ hội để xây dựng ngày mai.",
  "Tương lai phụ thuộc vào những gì bạn làm hôm nay.",
  "Thành công không đến từ những gì bạn thỉnh thoảng làm, mà đến từ những gì bạn làm kiên trì.",
  "Không có áp lực, không có kim cương.",
  "Cách tốt nhất để dự đoán tương lai là tạo ra nó.",
  "Hãy luôn hướng về phía mặt trời, bóng tối sẽ ngả về sau bạn.",
  "Chặng đường ngàn dặm bắt đầu từ một bước chân.",
  "Cứ đi rồi sẽ đến, cứ gõ cửa rồi sẽ mở.",
  "Đừng đếm những gì bạn đã mất, hãy quý trọng những gì bạn đang có và lên kế hoạch cho những gì sẽ đạt được."
];

export function getDailyQuote(date: Date) {
  // Use the day of the year to select a quote pseudo-randomly but deterministically for that day
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  return dailyQuotes[dayOfYear % dailyQuotes.length];
}
