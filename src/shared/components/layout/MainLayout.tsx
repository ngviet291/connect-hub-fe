import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { LeftSidebar, RightSidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { CreatePostModal } from '../../../features/post/components/CreatePostModal';

export const MainLayout = () => {
  const [composeOpen, setComposeOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // Trang Tin nhắn cần layout 2 cột full chiều rộng của khung, không bị bó
  // hẹp lại như các trang đọc nội dung (feed, profile...).
  const isFullWidthPage = location.pathname.startsWith('/messages');

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-text">
      <Navbar />
      <div className="flex w-full flex-1 overflow-hidden md:gap-3 md:p-3">
        <LeftSidebar />
        <main className="h-full w-full flex-1 overflow-y-auto scrollbar-none bg-surface pb-20 md:rounded-2xl md:border md:border-border md:pb-0">
          <div className={`mx-auto flex h-full w-full flex-col ${isFullWidthPage ? '' : 'max-w-2xl'}`}>
            <Outlet />
          </div>
        </main>
        <RightSidebar />
      </div>
      <BottomNav onCompose={() => setComposeOpen(true)} />
      <CreatePostModal isOpen={composeOpen} onClose={() => setComposeOpen(false)} onCreated={() => navigate('/')} />
    </div>
  );
};
