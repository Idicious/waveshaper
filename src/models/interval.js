/**
 * A segment of audio
 * 
 * @export
 * @param {string} id 
 * @param {number} start 
 * @param {number} end
 * @param {number} index
 * @param {number} originalStart 
 * @param {Float32Array} data 
 * @param {startPixel} number
 * @param {endPixel} number
 */
export function Interval(id, start, end, index, originalStart, data, startPixel, endPixel) {
    this.id = id;
    this.start = start;
    this.end = end;
    this.data = data;
    this.index = index;
    this.originalStart = originalStart;
    this.startPixel = startPixel;
    this.endPixel = endPixel;
}