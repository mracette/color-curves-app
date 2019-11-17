import AllAround from '../palettes/AllAround';

export const downloadCanvas = (canvas, filename) => {

    return new Promise((resolve, reject) => {

        // create an "off-screen" anchor tag
        const link = document.createElement('a');

        link.download = filename;
        link.href = canvas.toDataURL("image/png;base64");

        // fire moust event to trigger download
        const e = document.createEvent("MouseEvents");

        e.initMouseEvent("click", true, true, window,
            0, 0, 0, 0, 0, false, false, false,
            false, 0, null);

        link.dispatchEvent(e);

        resolve();

    })

}

export const logoGen = (size) => {

    const pal = new AllAround();

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;

    const lineWidth = size / 20;
    const radius = (size / 2) - lineWidth;
    const innerRadius = radius / 3.5;

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#000000';

    const slices = 16;
    const arcLength = - Math.PI * 2 / slices;

    // fill inner circle with black
    ctx.fillStyle = 'black';
    ctx.arc(size / 2, size / 2, innerRadius, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 16; i++) {

        //ctx.fillStyle = `hsl(${(i / slices) * 360}, 100%, 50%)`;
        ctx.fillStyle = pal.hslValueAt(i / slices);

        const start = i * arcLength;
        const end = i * arcLength + arcLength;

        ctx.beginPath();
        ctx.arc(size / 2, size / 2, radius, start, end, true);
        if (i === slices - 1) {
            ctx.lineWidth *= 0.5;
        }
        ctx.arc(size / 2, size / 2, innerRadius, end, start, false);
        ctx.fill();
        ctx.stroke();

    }

    // smooth out inner and outer borders
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, innerRadius, 0, Math.PI * 2);
    ctx.stroke();

    return canvas;

}