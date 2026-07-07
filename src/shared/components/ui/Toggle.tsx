export const Toggle = ({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
      checked ? 'bg-primary' : 'bg-border'
    }`}
  >
    <span
      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
        checked ? 'translate-x-[22px]' : 'translate-x-0.5'
      }`}
    />
  </button>
);
