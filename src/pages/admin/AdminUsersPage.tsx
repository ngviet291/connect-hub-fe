export const AdminUsersPage = () => (
  <div className="mx-auto max-w-2xl px-4 py-6">
    <h1 className="text-xl font-bold text-text">Quản trị người dùng</h1>
    <p className="mt-2 text-sm text-secondary">
      Trang chỉ dành cho tài khoản có role <code className="rounded bg-surface px-1.5 py-0.5">ROLE_ADMIN</code>.
      Nối API danh sách người dùng (GetAllUser, ChangeStatus...) tại đây.
    </p>
  </div>
);
