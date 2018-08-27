import { Interval } from "weighted-interval-merge";

/**
 * A segment of audio
 */
interface AudioInterval extends Interval {
  trackId?: string;
  source: string;
}

export default AudioInterval;
