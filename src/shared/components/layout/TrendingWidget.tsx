import { useNavigate } from 'react-router-dom';
import { MOCK_TRENDS } from '../../../mocks/mockData';
import { TrendingIcon } from '../icons/Icons';
import { useLanguage } from '../../../contexts/LanguageContext';

export const TrendingWidget = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-1 flex items-center gap-2">
        <TrendingIcon size={18} className="text-primary" />
        <h3 className="font-semibold text-text">{t('trending')}</h3>
      </div>
      <div className="flex flex-col divide-y divide-border">
        {MOCK_TRENDS.map((t) => (
          <button
            key={t.tag}
            onClick={() => navigate(`/search?q=%23${t.tag}`)}
            className="flex cursor-pointer items-center justify-between py-2.5 text-left transition-colors hover:opacity-80"
          >
            <div>
              <p className="text-sm font-medium text-primary">#{t.tag}</p>
              <p className="text-xs text-secondary">{t.postCount.toLocaleString('vi-VN')} bài viết</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
