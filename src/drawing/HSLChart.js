import { CoordinateSystem } from './CoordinateSystem';

export class HSLChart {

    constructor(canvas, curve, type, onParamChange) {

        this.onParamChange = onParamChange;

        const range = type === 'unitCircle' ? [-1, 1] : [0, 1];

        this.padding = 0.07;
        this.htmlPadding = 0.15; // from CSS
        this.highlightColor = 'hsl(0, 0%, 25%)';

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.curve = curve;
        this.type = type;
        this.coords = new CoordinateSystem(canvas, {
            nxRange: range,
            nyRange: range,
            padding: this.padding,
            orientationY: 'up'
        });

        // display settings
        this.lineWidth = this.coords.getWidth() / 170;
        this.endPointLineWidth = this.coords.getWidth() / 80;
        this.endPointRadius = this.coords.getWidth() / 60;

        // color wheel parameters
        this.arcCount = 256;
        this.arcWidth = - Math.PI * 2 / this.arcCount;

        this.mouseDown = false;
        this.takeSnapshot = false;

        // mouseover state held here
        this.mouseOver = {
            startPoint: {
                cx: null,
                cy: null,
                mouseOver: false,
                dragging: false,
                error: this.endPointRadius
            },
            endPoint: {
                cx: null,
                cy: null,
                mouseOver: false,
                dragging: false,
                error: this.endPointRadius
            },
            curve: {
                points: [],
                mouseOver: false,
                dragging: false,
                error: 5
            }
        }

        this.curveParamSnapshots = {
            translateX: null,
            translateY: null,
            scaleX: null,
            scaleY: null,
            rotation: null
        }

        this.update();

    }

    update() {
        this.drawBlankChart();
        this.drawCurve();
        this.drawEndpoints();
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

    drawLChart() {

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

    drawCurve(resolution) {

        const lineSegments = resolution || 128;
        const points = [];

        this.ctx.lineWidth = this.lineWidth;

        let prevCoords;

        const start = this.curve.overflow === 'clamp' ?
            this.curve.clampStart : 0;

        const end = this.curve.overflow === 'clamp' ?
            this.curve.clampEnd : 1

        for (let i = 0; i <= lineSegments; i++) {

            this.ctx.beginPath();

            const coords = this.curve.getCurveCoordsAt(start + (i / lineSegments) * (end - start));

            this.ctx.strokeStyle = (this.mouseOver.curve.mouseOver || this.mouseOver.curve.grabbing)
                ? this.highlightColor : 'black';

            if (i === 0) {
                this.ctx.moveTo(this.coords.nx(coords.x), this.coords.ny(coords.y));
            } else {
                this.ctx.moveTo(this.coords.nx(prevCoords.x), this.coords.ny(prevCoords.y));
                this.ctx.lineTo(this.coords.nx(coords.x), this.coords.ny(coords.y));
            }

            points.push([this.coords.nx(coords.x), this.coords.ny(coords.y)]);

            this.ctx.stroke();

            prevCoords = coords;

        }

        this.mouseOver.curve.points = points;

    }

    drawEndpoints() {

        let s, e;

        if (this.curve.overflow === 'clamp') {

            // use clamp start/end
            s = this.curve.getCurveCoordsAt(this.curve.clampStart);
            e = this.curve.getCurveCoordsAt(this.curve.clampEnd);

        } else {

            // use 0 and 1
            s = this.curve.getCurveCoordsAt(0);
            e = this.curve.getCurveCoordsAt(1);

        }

        this.ctx.lineWidth = this.endPointLineWidth

        this.ctx.strokeStyle = (this.mouseOver.startPoint.mouseOver || this.mouseOver.startPoint.grabbing)
            ? this.highlightColor : 'black';

        this.ctx.beginPath();
        this.ctx.fillStyle = "lightgreen";
        this.ctx.arc(this.coords.nx(s.x), this.coords.ny(s.y), this.endPointRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.fill();

        this.mouseOver.startPoint.cx = this.coords.nx(s.x);
        this.mouseOver.startPoint.cy = this.coords.ny(s.y);

        this.ctx.strokeStyle = (this.mouseOver.endPoint.mouseOver || this.mouseOver.endPoint.grabbing)
            ? this.highlightColor : 'black';

        this.ctx.beginPath();
        this.ctx.fillStyle = "palevioletred";
        this.ctx.moveTo(this.coords.nx(e.x), this.coords.ny(e.y));
        this.ctx.arc(this.coords.nx(e.x), this.coords.ny(e.y), this.endPointRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.fill();

        this.mouseOver.endPoint.cx = this.coords.nx(e.x);
        this.mouseOver.endPoint.cy = this.coords.ny(e.y);

    }

    updateMousePos(x, y, sx, sy) {

        const mouseDown = (typeof sx !== 'undefined' && typeof sy !== 'undefined');

        this.updateMouseover('curve', this.isCurveOver(x, y), mouseDown);
        this.updateMouseover('startPoint', this.isStartPointOver(x, y), mouseDown);
        this.updateMouseover('endPoint', this.isEndPointOver(x, y), mouseDown);

        // this is the initial mousedown event, take a snapshot of curve params
        if (mouseDown && !this.mouseDown) {
            this.curveParamSnapshots.translateX = this.curve.translation.x;
            this.curveParamSnapshots.translateY = this.curve.translation.y;
            this.curveParamSnapshots.scaleX = this.curve.scale.x;
            this.curveParamSnapshots.scaleY = this.curve.scale.y;
            this.curveParamSnapshots.rotation = this.curve.rotation;
        }

        this.mouseDown = mouseDown;

        if (this.mouseDown) {

            const xDelta = (this.coords.nxRange[1] - this.coords.nxRange[0]) * (x - sx) / this.coords.getWidth();
            const yDelta = (this.coords.nyRange[1] - this.coords.nyRange[0]) * (y - sy) / (-1 * this.coords.getHeight());

            if (this.mouseOver.startPoint.grabbing) {

            } else if (this.mouseOver.endPoint.grabbing) {

            } else if (this.mouseOver.curve.grabbing) {
                console.log(xDelta, x, y, sx, sy);
                this.onParamChange('translateX', this.curveParamSnapshots.translateX + xDelta);
                this.onParamChange('translateY', this.curveParamSnapshots.translateY + yDelta);
            }
        }

    }

    updateMouseover(element, status, mouseDown) {

        // endpoints override curve
        if ((element === 'startPoint' || element === 'endPoint') && status) {
            this.mouseOver.curve.mouseOver = false;
        }

        // if true update accordingly
        if (status) {
            this.mouseOver[element].mouseOver = status;
            this.mouseOver[element].grabbing = mouseDown;

            // if element goes from true -> false, chart needs an update
        } else if (this.mouseOver[element].mouseOver) {
            this.mouseOver[element].mouseOver = false;
            this.mouseOver[element].grabbing = mouseDown;
            document.body.style.cursor = 'default';
            this.update();
        }

        if (status || mouseDown) {
            document.body.style.cursor = 'grab';
            this.update();
        }

    }

    isCurveOver(x, y) {
        return this.mouseOver.curve.points.map((point) => {
            return (
                Math.abs(point[0] - x) <= this.mouseOver.curve.error &&
                Math.abs(point[1] - y) <= this.mouseOver.curve.error
            );
        }).find((d) => d === true)
    }

    isStartPointOver(x, y) {
        return (
            Math.abs(this.mouseOver.startPoint.cx - x) <= this.mouseOver.startPoint.error &&
            Math.abs(this.mouseOver.startPoint.cy - y) <= this.mouseOver.startPoint.error
        );
    }

    isEndPointOver(x, y) {
        return (
            Math.abs(this.mouseOver.endPoint.cx - x) <= this.mouseOver.endPoint.error &&
            Math.abs(this.mouseOver.endPoint.cy - y) <= this.mouseOver.endPoint.error
        );
    }

}