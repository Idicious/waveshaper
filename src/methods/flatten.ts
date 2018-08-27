import AudioInterval from "../models/interval";
//import Interval from "../models/interval";

declare type IntervalMap = { [key: string]: AudioInterval[] };
const start = (segment: AudioInterval) => segment.start + segment.offsetStart;

/**
 * The algorithm first calculates real start and end times of each segment,
 * sorts them by priority, then start time.
 *
 * Finally it merges the segments by index so there are no overlapping
 * segments and those with highest index are on top.
 *
 * @export
 * @param segments Segments to flatten
 * @returns flattened Interval array
 */
export default (segments: AudioInterval[]): AudioInterval[] => {
  if (segments == null || segments.length === 0) return [];

  const sorted = sort(segments);
  const normalized = normalizeIndex(sorted);
  const copied = copy(normalized);
  const grouped = groupByIndex(copied);

  return weightedMerge(grouped);
};

/**
 * Copies elements so original are unaltered
 *
 * @param intervals
 */
const copy = (intervals: AudioInterval[]): AudioInterval[] =>
  intervals.map(i => ({ ...i }));

/**
 * When an element is altered the index is set very high,
 * this functions normalizes to indexes back to 0
 *
 * @param segments
 */
const normalizeIndex = (segments: AudioInterval[]): AudioInterval[] => {
  let index = 0;
  let preNormalizeIndex = Number.MIN_SAFE_INTEGER;
  segments.forEach(el => {
    if (el.index > preNormalizeIndex) {
      preNormalizeIndex = el.index;
      el.index = ++index;
    } else {
      el.index = index;
    }
  });
  return segments;
};

/**
 * Sorts the intervals by index, then by start
 *
 * @param intervals
 * @return Interval array
 */
const sort = (intervals: AudioInterval[]): AudioInterval[] =>
  intervals.sort((a, b) => cmp(a.index, b.index) || cmp(start(a), start(b)));

/**
 * Returns a map of intervals grouped by the key property
 *
 * @param intervals
 * @param key
 *
 * @returns Map of index => interval[]
 */
const groupByIndex = (intervals: AudioInterval[]): IntervalMap =>
  intervals.reduce(
    (groups, interval) => {
      (groups[interval.index] = groups[interval.index] || []).push(interval);
      return groups;
    },
    <IntervalMap>{}
  );

/**
 * Merges all the groups by index
 *
 * @param grouped
 * @returns Interval array
 */
const weightedMerge = (grouped: IntervalMap): AudioInterval[] => {
  let flattened: AudioInterval[] | null = null;
  for (let index of Object.keys(grouped)) {
    const merged = merge(grouped[index]);
    if (flattened == null) {
      flattened = merged;
    } else {
      flattened = combine(merged, flattened);
    }
  }
  return <AudioInterval[]>flattened;
};

/**
 * Merges a set of intervals with the same index and remove any overlaps, left to right
 *
 * @param intervals
 * @returns Interval array
 */
const merge = (intervals: AudioInterval[]): AudioInterval[] => {
  if (intervals.length <= 1) return intervals;

  const result: AudioInterval[] = [];

  let current = intervals[0];
  for (let i = 1; i < intervals.length; i++) {
    const next = intervals[i];

    // If current is completely overlapped by second it is merged into it
    if (current.end >= next.end) {
      continue;
      // Resolves partial overlaps by setting end of current to start of next
    } else if (start(next) < current.end) {
      result.push({ ...current, end: start(next) });
      current = next;
    } else {
      // No overlap, push onto results
      result.push(current);
      current = next;
    }
  }

  result.push(current);
  return result;
};

/**
 * Given two sets of intervals it merges them so the highIndexes set has priority
 *
 * @param highIndexes
 * @param lowIndexes
 *
 * @returns Interval array
 */
const combine = (
  highIndexes: AudioInterval[],
  lowIndexes: AudioInterval[]
): AudioInterval[] => {
  let highIndex = 0;
  let lowIndex = 0;

  const merged: AudioInterval[] = [];

  while (highIndex < highIndexes.length || lowIndex < lowIndexes.length) {
    const high = highIndexes[highIndex];
    const low = lowIndexes[lowIndex];

    // Only low priority left so push low onto results
    if (highIndex === highIndexes.length) {
      merged.push({ ...low });
      lowIndex++;
      // Only high priority left so push high onto results
    } else if (lowIndex === lowIndexes.length) {
      merged.push({ ...high });
      highIndex++;
      // High priority start before or at same time as low
    } else if (start(high) <= start(low)) {
      // No overlap between low and high
      // low:                 ----------------------
      // high: ---------------
      if (high.end <= start(low)) {
        // Partial overlap where high ends after low
        // low:                 ----------------------
        // high: ----------------------
      } else if (high.end < low.end) {
        low.offsetStart = high.end - low.start;
        // Low index completely overlapped, dismiss it
        // low:               -----------
        // high: -------------------------------------
      } else {
        lowIndex++;
      }

      merged.push({ ...high });
      highIndex++;
      // Low priority starts before high
    } else {
      // No overlap between low and high intervals
      // low: ---------------
      // high                ----------------------
      if (low.end <= start(high)) {
        merged.push({ ...low });
        lowIndex++;
        // Partial overlap where high ends after low
        // low: ---------------------
        // high                ----------------------
      } else if (high.end > low.end) {
        merged.push({ ...low, end: start(high) });
        lowIndex++;
        // Partial overlap where high ends before low
        // low: -------------------------------------
        // high             -----------
      } else {
        merged.push({ ...low, end: start(high) });
        low.offsetStart = high.end - low.start;
      }
    }
  }

  return merged;
};

/**
 *
 * @param a
 * @param b
 */
const cmp = (a: number, b: number): 1 | -1 | 0 => {
  if (a > b) return +1;
  if (a < b) return -1;
  return 0;
};
