import { useState } from 'react';
import { colorAt, type Palette } from 'color-curves';
import { useAppStore } from '../state/store';
import { useThrottledStore } from '../state/useThrottled';
import { getSamples } from '../state/selectors';
import { FORMATS } from '../export/formats';

const GROUPS = ['Values', 'CSS', 'Code', 'Image'] as const;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function renderPng(doc: Palette, mode: 'continuous' | 'discrete', count: number): Promise<Blob> {
  const w = 1200;
  const h = 300;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  if (mode === 'continuous') {
    for (let x = 0; x < w; x++) {
      const { r, g, b } = colorAt(doc, x / (w - 1)).rgb;
      ctx.fillStyle = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
      ctx.fillRect(x, 0, 1, h);
    }
  } else {
    const samples = getSamples(doc, count, 'none');
    samples.forEach((s, i) => {
      ctx.fillStyle = s.hex;
      ctx.fillRect(Math.round((i / samples.length) * w), 0, Math.ceil(w / samples.length), h);
    });
  }
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'),
  );
}

export function ExportPanel({ onToast }: { onToast(msg: string): void }) {
  const doc = useThrottledStore((s) => s.doc, 150);
  const displayCount = useAppStore((s) => s.display.count);
  const displayMode = useAppStore((s) => s.display.mode);
  const [countOverride, setCountOverride] = useState<number | null>(null);
  const [formatId, setFormatId] = useState('hex');
  const [pngMode, setPngMode] = useState<'continuous' | 'discrete' | null>(null);

  const count = countOverride ?? displayCount;
  // Exports always use true colors — CVD simulation is a preview aid only.
  const samples = getSamples(doc, count, 'none');
  const format = FORMATS.find((f) => f.id === formatId) ?? FORMATS[0]!;
  const text = format.kind === 'png' ? '' : format.generate(samples, doc);
  const effectivePngMode = pngMode ?? displayMode;

  const filename = `${(doc.name ?? 'palette').toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'palette'}.${format.ext ?? 'txt'}`;

  const copy = () => {
    navigator.clipboard
      .writeText(text)
      .then(() => onToast('Copied to clipboard'))
      .catch(() => onToast('Copy failed'));
  };

  const download = () => {
    if (format.kind === 'svg') {
      downloadBlob(new Blob([text], { type: 'image/svg+xml' }), filename);
      onToast(`Downloaded ${filename}`);
    } else if (format.kind === 'png') {
      renderPng(doc, effectivePngMode, count)
        .then((blob) => {
          downloadBlob(blob, filename);
          onToast(`Downloaded ${filename}`);
        })
        .catch(() => onToast('PNG render failed'));
    }
  };

  return (
    <div className="export-panel">
      <div className="export-panel__controls">
        <label className="field">
          <span>Stops</span>
          <input
            type="number"
            min={1}
            max={64}
            value={count}
            onChange={(e) => {
              const v = Math.round(Number(e.target.value));
              if (Number.isFinite(v)) setCountOverride(Math.min(64, Math.max(1, v)));
            }}
          />
        </label>
        {countOverride !== null && countOverride !== displayCount && (
          <button className="library__link" onClick={() => setCountOverride(null)}>
            reset
          </button>
        )}
      </div>

      <div className="export-panel__swatches" aria-hidden="true">
        {samples.map((s, i) => (
          <span key={i} style={{ background: s.hex }} title={s.hex} />
        ))}
      </div>

      {GROUPS.map((group) => (
        <div key={group} className="export-panel__group">
          <div className="export-panel__group-title">{group}</div>
          <div className="export-panel__formats">
            {FORMATS.filter((f) => f.group === group).map((f) => (
              <button
                key={f.id}
                className={f.id === format.id ? 'is-active' : ''}
                onClick={() => setFormatId(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {format.kind === 'png' ? (
        <div className="export-panel__preview">
          <div className="segmented">
            <button
              className={effectivePngMode === 'continuous' ? 'is-active' : ''}
              onClick={() => setPngMode('continuous')}
            >
              Continuous
            </button>
            <button
              className={effectivePngMode === 'discrete' ? 'is-active' : ''}
              onClick={() => setPngMode('discrete')}
            >
              Discrete
            </button>
          </div>
          <p className="export-panel__note">1200 × 300 px</p>
        </div>
      ) : (
        <pre className="export-panel__code">{text}</pre>
      )}

      <div className="export-panel__actions">
        {format.kind !== 'png' && (
          <button className="button button--primary" onClick={copy}>
            Copy
          </button>
        )}
        {(format.kind === 'svg' || format.kind === 'png') && (
          <button className="button" onClick={download}>
            Download
          </button>
        )}
      </div>
    </div>
  );
}
