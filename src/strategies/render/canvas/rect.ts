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
export default (waveform: number[][], height: number, width: number, element: HTMLCanvasElement, drawStyle: string) => {
    const scale = height / 2;
    const ctx = element.getContext('2d');

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();

    for (let i = 0; i < waveform.length; i++) {
        const minHeight = (waveform[i][0] * scale) + scale;
        const maxHeight = (waveform[i][1] * scale) + scale;
        const height = maxHeight - minHeight;
        ctx.rect(i, minHeight, 1, height);
    }
    ctx.closePath();
    ctx.fill();

    for (let i = 0; i < waveform.length; i++) {
        if(i != 0 && waveform[i-1][2] === 0 && waveform[i][2] === 1) {
            ctx.fillRect(i-1, 0, 1, height);
        }
    }
}