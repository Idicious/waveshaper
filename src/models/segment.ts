/**
 * A segment of audio
 */
export default interface Segment {
    id: string;
    start: number;
    duration: number;
    offsetStart: number;
    offsetEnd: number;
    index: number;
    source: string;
}