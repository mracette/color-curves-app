import { CoordinateSystem } from './CoordinateSystem';

export class HSLChart {

    constructor(canvas, curve, type) {

        const range = type === 'unitCircle' ? [-1, 1] : [0, 1];

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.curve = curve;
        this.type = type;
        this.padding = 0.07;
        this.coords = new CoordinateSystem(canvas, {
            nxRange: range,
            nyRange: range,
            padding: this.padding,
            orientationY: 'up'
        });

        // display settings
        this.lineWidth = canvas.width / 180;

        // color wheel parameters
        this.arcCount = 256;
        this.arcWidth = - Math.PI * 2 / this.arcCount;

        this.update();

    }

    update() {
        this.drawBlankChart();
        this.drawCurve();
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

        this.ctx.lineWidth = this.lineWidth;

        let prevCoords;

        const start = this.curve.overflow === 'clamp' ?
            this.curve.clampStart : 0;

        const end = this.curve.overflow === 'clamp' ?
            this.curve.clampEnd : 1

        for (let i = 0; i <= lineSegments; i++) {

            this.ctx.beginPath();

            const coords = this.curve.getCurveCoordsAt(start + (i / lineSegments) * (end - start));

            this.ctx.strokeStyle = 'black';

            if (i === 0) {
                this.ctx.moveTo(this.coords.nx(coords.x), this.coords.ny(coords.y));
            } else {
                this.ctx.moveTo(this.coords.nx(prevCoords.x), this.coords.ny(prevCoords.y));
                this.ctx.lineTo(this.coords.nx(coords.x), this.coords.ny(coords.y));
            }

            this.ctx.stroke();

            prevCoords = coords;

        }

    }

    drawHsChart() {

        // fill background
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // other parameters
        const cx = this.coords.nx(0);
        const cy = this.coords.ny(0);
        const r = this.coords.getWidth() / 2;

        const radiusStart = 0;
        const radiusEnd = r;

        // fill chart
        for (let i = 0; i < this.arcCount; i++) {

            const gradient = this.ctx.createRadialGradient(
                this.coords.nx(0),
                this.coords.ny(0),
                0,
                this.coords.nx(0),
                this.coords.ny(0),
                this.coords.getWidth() / 2
            );

            gradient.addColorStop(0, `hsl(${360 * i / this.arcCount}, 0%, 50%)`);
            gradient.addColorStop(1, `hsl(${360 * i / this.arcCount}, 100%, 50%)`);

            this.ctx.fillStyle = gradient;

            const angleStart = i * this.arcWidth;
            const angleEnd = i * this.arcWidth + this.arcWidth;

            this.ctx.beginPath();
            this.ctx.arc(cx, cy, radiusStart, angleStart, angleEnd + this.arcWidth, true);
            this.ctx.arc(cx, cy, radiusEnd, angleEnd + this.arcWidth, angleStart, false);
            this.ctx.fill();
        }

    }

    drawLChart = () => {

        // fill background
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.height, this.canvas.width);

        // make gradient
        const gradient = this.ctx.createLinearGradient(
            this.coords.nx(0),
            this.coords.ny(1),
            this.coords.nx(0),
            this.coords.ny(0)
        );
        gradient.addColorStop(0, 'hsl(0, 0%, 100%');
        gradient.addColorStop(1, 'hsl(0, 0%, 0%');

        // fill chart
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(
            this.coords.nx(0),
            this.coords.ny(0),
            this.coords.getWidth(),
            -1 * this.coords.getHeight()
        );

    }

}