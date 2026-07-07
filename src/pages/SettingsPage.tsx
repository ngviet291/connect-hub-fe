import { useAuth } from '../features/auth/store/AuthContext';
import { Button } from '../shared/components/ui/Button';

export const SettingsPage = () => {
  const { user, logout } = useAuth();
  return (
    <div className="rounded-xl border border-[#27272A] bg-[#18181B] p-6">
      <h2 className="mb-6 text-xl font-bold text-[#F5F5F5]">Cài đặt</h2>
      <div className="flex flex-col gap-4">
        <div className="border-b border-[#27272A] pb-4">
          <p className="text-sm text-[#A1A1AA]">Đăng nhập với</p>
          <p className="font-medium text-[#F5F5F5]">{user?.email}</p>
        </div>
        <Button variant="outline" onClick={logout} className="w-fit text-red-400 border-red-400/30 hover:border-red-400">
          Đăng xuất
        </Button>
      </div>
    </div>
  );
};
