import { useState } from 'react';
import { Toggle } from '../../shared/components/ui/Toggle';

const Row = ({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between gap-4 border-b border-border py-4 last:border-0">
    <div>
      <p className="text-sm font-medium text-text">{title}</p>
      <p className="mt-0.5 text-sm text-secondary">{description}</p>
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

export const PrivacySettingsPage = () => {
  const [state, setState] = useState({
    privateAccount: false,
    hideActivity: false,
    allowMentions: true,
    allowMessages: true,
  });

  const set = (key: keyof typeof state) => (v: boolean) => setState((s) => ({ ...s, [key]: v }));

  return (
    <div className="max-w-md">
      <h2 className="mb-1 text-base font-semibold text-text">Quyền riêng tư</h2>
      <p className="mb-2 text-sm text-secondary">Kiểm soát ai có thể xem và tương tác với nội dung của bạn.</p>
      <Row title="Tài khoản riêng tư" description="Chỉ người theo dõi mới xem được bài viết của bạn." checked={state.privateAccount} onChange={set('privateAccount')} />
      <Row title="Ẩn trạng thái hoạt động" description="Người khác sẽ không thấy khi bạn đang online." checked={state.hideActivity} onChange={set('hideActivity')} />
      <Row title="Cho phép nhắc đến (@mention)" description="Người khác có thể gắn thẻ bạn trong bài viết." checked={state.allowMentions} onChange={set('allowMentions')} />
      <Row title="Cho phép nhắn tin" description="Người khác có thể gửi tin nhắn trực tiếp cho bạn." checked={state.allowMessages} onChange={set('allowMessages')} />
    </div>
  );
};
