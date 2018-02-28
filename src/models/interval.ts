/**
 * A segment of audio
 */
interface Interval {
    id: string;
    start: number;
    end: number;
    offsetStart: number;
    index: number;
    source: string;
}

export default Interval;