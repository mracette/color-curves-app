import { useAppStore, type InspectorTab } from '../state/store';

const TABS: { id: InspectorTab; label: string }[] = [
  { id: 'export', label: 'Export' },
  { id: 'preview', label: 'Preview' },
  { id: 'a11y', label: 'A11y' },
];

export function InspectorPanel({
  preview,
  a11y,
  exporter,
}: {
  preview: React.ReactNode;
  a11y: React.ReactNode;
  exporter: React.ReactNode;
}) {
  const tab = useAppStore((s) => s.inspectorTab);
  const setTab = useAppStore((s) => s.setInspectorTab);
  return (
    <aside className="inspector">
      <div className="inspector__tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? 'is-active' : ''}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="inspector__body">
        {tab === 'preview' && preview}
        {tab === 'a11y' && a11y}
        {tab === 'export' && exporter}
      </div>
    </aside>
  );
}
