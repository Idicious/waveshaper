/**
 * 
 * 
 * @export
 * @param {number[][]} waveform Sampled data for each pixel, max at 0, min at 1 
 * @param {number} height 
 * @param {number} width 
 * @param {HTMLCanvasElement} element 
 * @param {string} drawStyle 
 */
export function drawCanvasLine(waveform, height, width, element, drawStyle) {
    const scale = height / 2;
    const ctx = element.getContext('2d');
    
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    
    ctx.moveTo(0, scale);
    for (let i = 0; i < waveform.length; i++) {
        ctx.lineTo(i, (waveform[i][0] * scale) + scale);
    }
    ctx.lineTo(waveform.length - 1, scale);

    ctx.moveTo(0, scale);
    for (let i = 0; i < waveform.length; i++) {
        ctx.lineTo(i, (waveform[i][1] * scale) + scale);
    }
    ctx.lineTo(waveform.length - 1, scale);

    ctx.closePath();
    switch (drawStyle) { 
        case 'stroke':
            ctx.stroke();
            break;
        default:
            ctx.fill();
    }
}