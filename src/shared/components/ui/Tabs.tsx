interface Tab {
  key: string;
  label: string;
  badge?: number;
}

export const Tabs = ({ tabs, active, onChange }: { tabs: Tab[]; active: string; onChange: (key: string) => void }) => (
  <div className="flex border-b border-border">
    {tabs.map((tab) => (
      <button
        key={tab.key}
        onClick={() => onChange(tab.key)}
        className={`relative flex-1 cursor-pointer px-4 py-3.5 text-sm font-semibold transition-colors ${
          active === tab.key ? 'text-text' : 'text-secondary hover:text-text'
        }`}
      >
        {tab.label}
        {!!tab.badge && <span className="ml-1.5 text-primary">{tab.badge}</span>}
        {active === tab.key && <span className="absolute inset-x-0 bottom-0 mx-auto h-0.5 w-full bg-text" />}
      </button>
    ))}
  </div>
);
