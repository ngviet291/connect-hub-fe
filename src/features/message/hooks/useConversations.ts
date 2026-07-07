// Giữ lại để tương thích ngược: state hội thoại giờ dùng chung 1 nguồn
// (ConversationProvider) để sidebar, bottom nav và trang tin nhắn luôn
// đồng bộ số tin chưa đọc.
export { useConversations } from '../store/ConversationContext';
