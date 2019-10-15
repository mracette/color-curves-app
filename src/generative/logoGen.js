const logoGen = (size) => {

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;

    const lineWidth = size / 20;
    const radius = (size / 2) - lineWidth;
    const innerRadius = radius / 2.5;

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#000000';

    const slices = 16;
    const arcLength = - Math.PI * 2 / slices;

    for(let i = 0; i < 16; i++) {

        ctx.fillStyle = `hsl(${(i / slices) * 360}, 100%, 50%)`;

        const start = i * arcLength;
        const end = i * arcLength + arcLength;

        ctx.beginPath();
        ctx.arc(size / 2, size / 2, radius, start, end, true);
        ctx.stroke();
        if(i === slices - 1) {
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
    
    document.body.appendChild(ctx.canvas);

}

export default logoGen;