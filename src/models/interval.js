/**
 * A segment of audio
 * 
 * @export
 * @param {string} id 
 * @param {number} start 
 * @param {number} end
 * @param {number} index
 * @param {number} originalStart 
 * @param {number} startPixel
 * @param {nember} endPixel
 * @param {string} source
 */
export function Interval(id, start, end, index, originalStart, startPixel, endPixel, source) {
    this.id = id;
    this.start = start;
    this.end = end;
    this.index = index;
    this.originalStart = originalStart;
    this.startPixel = startPixel;
    this.endPixel = endPixel;
    this.source = source;
}