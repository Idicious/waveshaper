/**
 * 
 * 
 * @export
 * @param {number[][]} waveform Sampled data for each pixel, max at 0, min at 1 
 * @param {number} height 
 * @param {number} width 
 * @param {HTMLCanvasElement} element 
 * @param {string} drawStyle 
 * @param {string} color
 */
export function drawCanvasLine(waveform, height, width, element, drawStyle, color) {
    const scale = height / 2;
    const ctx = element.getContext('2d');
    const length = waveform.length;
    ctx.fillStyle = color;

    ctx.clearRect(0, 0, width, height);
    for(let i = 0, inSegment = false, segmentStart = 0; i < length; i++) {
        const pointInSegment = waveform[i][3] === 1;
        if(!inSegment && pointInSegment) {
            inSegment = true;
            segmentStart = i;
        } else if (inSegment && (!pointInSegment || i === length - 1)) {
            inSegment = false;
            ctx.fillRect(segmentStart, 0, i - segmentStart, height);
        }
    }
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    
    ctx.moveTo(0, scale);
    for (let i = 0; i < length; i++) {
        ctx.lineTo(i, Math.round((waveform[i][0] * scale) + scale));
    }
    ctx.lineTo(length - 1, scale);

    ctx.moveTo(0, scale);
    for (let i = 0; i < length; i++) {
        ctx.lineTo(i, Math.round((waveform[i][1] * scale) + scale));
    }
    ctx.lineTo(length - 1, scale);

    ctx.closePath();
    switch (drawStyle) { 
        case 'stroke':
            ctx.stroke();
            break;
        default:
            ctx.fill();
    }

    for (let i = 0; i < length; i++) {
        if(i != 0 && waveform[i-1][2] === 0 && waveform[i][2] === 1) {
            ctx.fillRect(i-1, 0, 1, height);
        }
    }
}