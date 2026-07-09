import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../shared/components/ui/Button';
import { LogoIcon } from '../shared/components/icons/Icons';

export const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <LogoIcon size={40} />
      <h1 className="text-6xl font-black text-text">404</h1>
      <p className="text-secondary">{t('not_found_desc')}</p>
      <Link to="/">
        <Button>{t('back_home')}</Button>
      </Link>
    </div>
  );
};
