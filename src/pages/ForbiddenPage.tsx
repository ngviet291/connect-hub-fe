import { Link } from 'react-router-dom';
import { Button } from '../shared/components/ui/Button';
import { LogoIcon } from '../shared/components/icons/Icons';

export const ForbiddenPage = () => (
  <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-4 text-center">
    <LogoIcon size={40} />
    <h1 className="text-6xl font-black text-text">403</h1>
    <p className="text-secondary">Bạn không có quyền truy cập trang này.</p>
    <Link to="/">
      <Button>Về trang chủ</Button>
    </Link>
  </div>
);
