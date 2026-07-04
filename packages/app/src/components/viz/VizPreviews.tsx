import type { ReactNode } from 'react';
import { useAppStore, type CvdSetting } from '../../state/store';
import { useThrottledStore } from '../../state/useThrottled';
import { BarViz } from './BarViz';
import { HeatmapViz } from './HeatmapViz';
import { LineViz } from './LineViz';
import { ScatterViz } from './ScatterViz';
import { UiMockViz } from './UiMockViz';
import './viz.css';

const CVD_NAMES: Record<Exclude<CvdSetting, 'none'>, string> = {
  protan: 'protanopia',
  deutan: 'deuteranopia',
  tritan: 'tritanopia',
};

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="viz-card">
      <h3 className="viz-card__title">{title}</h3>
      {children}
    </section>
  );
}

export function VizPreviews() {
  const doc = useThrottledStore((s) => s.doc, 100);
  const cvd = useAppStore((s) => s.cvd);
  return (
    <div className="viz-previews">
      {cvd !== 'none' && <div className="viz-cvd-badge">Simulating: {CVD_NAMES[cvd]}</div>}
      <Card title="Line chart">
        <LineViz doc={doc} cvd={cvd} />
      </Card>
      <Card title="Bar chart">
        <BarViz doc={doc} cvd={cvd} />
      </Card>
      <Card title="Scatter">
        <ScatterViz doc={doc} cvd={cvd} />
      </Card>
      <Card title="Heatmap">
        <HeatmapViz doc={doc} cvd={cvd} />
      </Card>
      <Card title="UI mock">
        <UiMockViz doc={doc} cvd={cvd} />
      </Card>
    </div>
  );
}
