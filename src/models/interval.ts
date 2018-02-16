/**
 * A segment of audio
 */
export default interface Interval {
    id: string;
    start: number;
    end: number;
    index: number;
    originalStart: number;
    source: string;
}