import { useState, type FormEvent } from 'react';
import { Input } from '../../shared/components/ui/Input';
import { Button } from '../../shared/components/ui/Button';
import { Toggle } from '../../shared/components/ui/Toggle';

export const SecuritySettingsPage = () => {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [twoFactor, setTwoFactor] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (form.next !== form.confirm) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setError('');
    setSaved(true);
    setForm({ current: '', next: '', confirm: '' });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-md">
      <h2 className="mb-1 text-base font-semibold text-text">Bảo mật</h2>
      <p className="mb-4 text-sm text-secondary">Đổi mật khẩu và quản lý bảo mật tài khoản.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input label="Mật khẩu hiện tại" type="password" value={form.current} onChange={(e) => setForm((f) => ({ ...f, current: e.target.value }))} />
        <Input label="Mật khẩu mới" type="password" value={form.next} onChange={(e) => setForm((f) => ({ ...f, next: e.target.value }))} />
        <Input label="Xác nhận mật khẩu mới" type="password" value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} />
        {error && <p className="text-sm text-danger">{error}</p>}
        <div>
          <Button type="submit">{saved ? 'Đã cập nhật ✓' : 'Đổi mật khẩu'}</Button>
        </div>
      </form>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <div>
          <p className="text-sm font-medium text-text">Xác thực 2 lớp (2FA)</p>
          <p className="text-sm text-secondary">Bảo vệ tài khoản bằng mã xác thực bổ sung.</p>
        </div>
        <Toggle checked={twoFactor} onChange={setTwoFactor} />
      </div>
    </div>
  );
};
