/**
 * A segment of audio
 * 
 * @export
 * @param {string} id 
 * @param {number} start 
 * @param {number} duration 
 * @param {number} offsetStart 
 * @param {number} offsetEnd 
 * @param {Float32Array} data 
 * @param {number} index
 */
export function Segment(id, start, duration, offsetStart, offsetEnd, data, index) {
    this.id = id;
    this.start = start;
    this.duration = duration;
    this.offsetStart = offsetStart;
    this.offsetEnd = offsetEnd;
    this.data = data;
    this.index = index;
}