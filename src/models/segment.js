/**
 * A segment of audio
 * 
 * @export
 * @param {string} id 
 * @param {number} start 
 * @param {number} duration 
 * @param {number} offsetStart 
 * @param {number} offsetEnd 
 * @param {number} index
 * @param {string} source
 */
export function Segment(id, start, duration, offsetStart, offsetEnd, index, source) {
    this.id = id;
    this.start = start;
    this.duration = duration;
    this.offsetStart = offsetStart;
    this.offsetEnd = offsetEnd;
    this.index = index;
    this.source = source;
}