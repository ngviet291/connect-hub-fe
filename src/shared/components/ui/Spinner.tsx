export const Spinner = ({ size = 8, className = '' }: { size?: number; className?: string }) => (
  <div
    style={{ height: size * 4, width: size * 4 }}
    className={`animate-spin rounded-full border-2 border-primary border-t-transparent ${className}`}
  />
);

export const PageSpinner = () => (
  <div className="flex h-[60vh] items-center justify-center">
    <Spinner size={9} />
  </div>
);
