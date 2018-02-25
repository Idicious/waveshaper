/**
 * A segment of audio
 */
export default interface Interval {
    id: string;
    start: number;
    end: number;
    offsetStart: number;
    index: number;
    source: string;
}