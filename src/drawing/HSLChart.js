import { CoordinateSystem } from './CoordinateSystem';

export class HSLChart {

    constructor(canvas, curve, type, padding) {

        const range = type === 'unitCircle' ? [-1, 1] : [0, 1];

        this.canvas = canvas;
        this.curve = curve;
        this.type = type;
        this.padding = padding;
        this.coords = new CoordinateSystem(canvas, {
            nxRange: range,
            nyRange: range,
            padding
        });

        // display settings
        this.lineWidth = canvas.width / 180;

        // color wheel parameters
        this.arcCount = 256;
        this.arcWidth = - Math.PI * 2 / this.arcCount;

        // gradients
        if (type === 'unitCircle') {
            this.gradient = canvas.getContext('2d').createRadialGradient(
                this.coords.nx(0),
                this.coords.ny(0),
                0,
                this.coords.nx(0),
                this.coords.ny(0),
                this.coords.getWidth() / 2
            );
            for (let i = 0; i < this.arcCount; i++) {
                this.gradient.addColorStop(0, `hsl(${360 * i / this.arcCount}, 0%, 50%)`);
                this.gradient.addColorStop(1, `hsl(${360 * i / this.arcCount}, 100%, 50%)`);
            }
        } else if (type === 'l') {
            this.gradient = canvas.getContext('2d').createLinearGradient(
                this.coords.nx(0),
                this.coords.ny(1),
                this.coords.nx(0),
                this.coords.ny(0)
            );
            this.gradient.addColorStop(0, 'hsl(0, 0%, 100%');
            this.gradient.addColorStop(1, 'hsl(0, 0%, 0%');
        }

    }

    setCurve(curve) {
        this.curve = curve;
    }

    drawBlankChart() {
        if (this.type === 'unitCircle') {
            this.drawHsChart();
        } else if (this.type === 'unitSquare') {
            this.drawLChart();
        }
    }

    drawCurve(resolution) {

        const lineSegments = resolution || 128;

        const ctx = this.canvas.getContext('2d', { alpha: false });
        ctx.lineWidth = this.lineWidth;

        // set clamp bounds if necessary
        // this.curve.overflow === 'clamp' && this.curve.setClampBounds();

        let prevCoords;

        const start = this.curve.overflow === 'clamp' ?
            this.curve.clampStart : 0;

        const end = this.curve.overflow === 'clamp' ?
            this.curve.clampEnd : 1

        for (let i = 0; i <= lineSegments; i++) {

            ctx.beginPath();

            const coords = this.curve.getCurveCoordsAt(start + (i / lineSegments) * (end - start));

            ctx.strokeStyle = 'black';

            if (i === 0) {
                ctx.moveTo(this.coords.nx(coords.x), this.coords.ny(coords.y));
            } else {
                ctx.moveTo(this.coords.nx(prevCoords.x), this.coords.ny(prevCoords.y));
                ctx.lineTo(this.coords.nx(coords.x), this.coords.ny(coords.y));
            }

            ctx.stroke();

            prevCoords = coords;

        }

    }

    drawHsChart() {

        const ctx = this.canvas.getContext('2d', { alpha: false });

        // fill background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // other parameters
        const cx = this.coords.nx(0);
        const cy = this.coords.ny(0);
        const r = this.coords.getWidth() / 2;

        const radiusStart = 0;
        const radiusEnd = r;

        ctx.fillStyle = this.gradient;

        // fill chart
        for (let i = 0; i < this.arcCount; i++) {

            const angleStart = i * this.arcWidth;
            const angleEnd = i * this.arcWidth + this.arcWidth;

            ctx.beginPath();
            ctx.arc(cx, cy, radiusStart, angleStart, angleEnd + this.arcWidth, true);
            ctx.arc(cx, cy, radiusEnd, angleEnd + this.arcWidth, angleStart, false);
            ctx.fill();
        }

    }

    drawLChart = () => {

        const ctx = this.canvas.getContext('2d', { alpha: false });

        // fill background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, this.canvas.height, this.canvas.width);

        // fill chart
        ctx.fillStyle = this.gradient;
        ctx.fillRect(
            this.coords.nx(0),
            this.coords.ny(1),
            this.coords.nx(1),
            this.coords.ny(0)
        );

    }

}