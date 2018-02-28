import { ManagerOptions } from "../config/managerconfig";

/**
 * 
 * 
 * @export
 * @param waveform Sampled data for each pixel, max at 0, min at 1 
 * @param options
 * @param ctx 
 * @param color
 */
export default (waveform: Float32Array, options: ManagerOptions, ctx: CanvasRenderingContext2D, color: string) => {
    const scale = options.height / 2;
    const width = options.width;
    
    ctx.fillStyle = color;
    ctx.clearRect(0, 0, width, options.height);
    
    for(let i = 0, inSegment = false, segmentStart = 0; i < width; i++) {
        const index = i * 4;
        const pointInSegment = waveform[index + 3] === 1;
        if(!inSegment && pointInSegment) {
            inSegment = true;
            segmentStart = i;
        } else if (inSegment && (!pointInSegment || i === width - 1)) {
            inSegment = false;
            ctx.fillRect(segmentStart, 0, i - segmentStart, options.height);
        }
    }
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    
    ctx.moveTo(0, scale);
    for (let i = 0; i < width; i++) {
        const index = i * 4;

        ctx.lineTo(i, Math.round((waveform[index] * scale) + scale));
    }
    ctx.lineTo(width - 1, scale);

    ctx.moveTo(0, scale);
    for (let i = 0; i < width; i++) {
        const index = i * 4;

        ctx.lineTo(i, Math.round((waveform[index + 1] * scale) + scale));
    }
    ctx.lineTo(width - 1, scale);
    ctx.closePath();

    for (let i = 0; i < width; i++) {
        const index = i * 4;
        if(waveform[index - 4 + 2] === 0 && waveform[index + 2] === 1) {
            ctx.rect(i, 0, 1, options.height);
        }
    }
    
    ctx.fill();
}