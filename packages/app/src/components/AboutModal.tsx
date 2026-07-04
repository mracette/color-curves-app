import { useEffect } from 'react';

export function AboutModal({ onClose }: { onClose(): void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="About Color Curves"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          <h2>About Color Curves</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal__body">
          <p>
            Color Curves builds color palettes from curves drawn through color space. One spline
            travels across the hue–chroma wheel, another shapes lightness, and sampling both from
            start to end yields a continuous palette — or any number of discrete stops.
          </p>
          <p>
            Palettes default to <strong>OKLCH</strong>, a perceptually uniform color space: equal
            distances along the curve read as equal visual steps, which keeps ramps smooth and
            data visualizations honest. The dashed contour on the wheel marks the edge of the sRGB
            gamut; colors beyond it are gently pulled back inside. Classic <strong>HSL</strong> is
            available per palette.
          </p>
          <p>
            <strong>Editing:</strong> drag points, drag the curve body to move it, double-click the
            curve to add a point, double-click a point to remove it, and alt-drag a point to pull
            out tangent handles. On the wheel, alt-drag the curve body to rotate all hues around
            the center and shift-drag to scale chroma. Arrow keys nudge the selected point; S / C /
            A set smooth, corner, or automatic tangents.
          </p>
          <p>
            Everything lives in the URL — copy a share link and the whole palette travels with it.
            The <code>color-curves</code> library that powers this editor is open source, with the
            same palettes reproducible in code.
          </p>
          <p className="modal__fine">
            Inspired by the gradient work behind d3-scale-chromatic. Built by{' '}
            <a href="https://github.com/mracette" target="_blank" rel="noreferrer">
              Mark Racette
            </a>
            {' · '}
            <a href="https://github.com/mracette/color-curves-app" target="_blank" rel="noreferrer">
              Source on GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
