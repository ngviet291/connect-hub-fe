export const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'vừa xong';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} phút`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} giờ`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} ngày`;
  const week = Math.floor(day / 7);
  if (week < 4) return `${week} tuần`;
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });
};

export const formatFullDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'long', year: 'numeric' });
