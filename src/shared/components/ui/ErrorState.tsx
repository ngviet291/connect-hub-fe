import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import { BiError } from "react-icons/bi";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center animate-fade-in">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-2xl">
        <BiError color="currentColor" />
      </div>
      <p className="text-sm text-secondary">{message ?? t("error_generic")}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t("retry")}
        </Button>
      )}
    </div>
  );
};
