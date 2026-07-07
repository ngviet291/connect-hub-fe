// Giữ lại để tương thích ngược: state thông báo giờ dùng chung 1 nguồn
// (NotificationProvider) để mọi nơi (sidebar, dropdown, trang Hoạt động,
// bottom nav) luôn đồng bộ khi đánh dấu đã đọc.
export { useNotifications } from '../store/NotificationContext';
