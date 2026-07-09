import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Avatar } from '../../../shared/components/ui/Avatar';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Textarea } from '../../../shared/components/ui/Textarea';
import { Modal } from '../../../shared/components/ui/Modal';
import { useTranslation } from 'react-i18next';
import { BIO_MAX_LENGTH } from '../../../constants/limits';
import type { UpdateProfileRequest, UserProfile } from '../types/user.types';
import { userApi } from '../api/userApi';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaved: (profile: UserProfile) => void;
}

export const EditProfileModal = ({ isOpen, onClose, profile, onSaved }: EditProfileModalProps) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<UpdateProfileRequest>({
    displayName: profile.displayName,
    bio: profile.bio ?? '',
    website: profile.website ?? '',
    location: profile.location ?? '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const set = (key: keyof UpdateProfileRequest) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await userApi.updateProfile(profile.username, form);
      onSaved(updated);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('edit_profile_title')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-4">
          <Avatar src={profile.avatarUrl} name={profile.displayName} size="lg" />
          <Button type="button" variant="outline" size="sm">{t('change_avatar')}</Button>
        </div>
        <Input label={t('display_name')} value={form.displayName} onChange={set('displayName')} maxLength={50} required />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-secondary">{t('bio')}</label>
          <Textarea
            value={form.bio}
            onChange={set('bio')}
            rows={3}
            maxLength={BIO_MAX_LENGTH}
            className="rounded-xl border border-border bg-surface px-4 py-2.5"
          />
          <span className="self-end text-xs text-secondary">{(form.bio ?? '').length}/{BIO_MAX_LENGTH}</span>
        </div>
        <Input label={t('location')} value={form.location} onChange={set('location')} />
        <Input label={t('website')} value={form.website} onChange={set('website')} />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button type="submit" loading={isSaving}>{t('save')}</Button>
        </div>
      </form>
    </Modal>
  );
};
