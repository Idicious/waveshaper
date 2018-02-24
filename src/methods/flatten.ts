import Segment from "../models/segment";
import Interval from "../models/interval";

declare type IntervalMap = {[key: string] : Interval[]};

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
export default (segments: Segment[]): Interval[] => {
  const normalized = normalizeIndex(segments);
  const intervals = mapToIntervals(normalized);
  const sorted = sort(intervals);
  const grouped = groupByIndex(sorted);

  return weightedMerge(grouped);
}

/**
 * When an element is altered the index is set very high,
 * this functions normalizes to indexes back to 0
 * 
 * @param segments 
 */
const normalizeIndex = (segments: Segment[]): Segment[] => {
  let index = 0;
  let preNormalizeIndex = Number.MIN_SAFE_INTEGER;
  segments.sort((a, b) => cmp(a.index, b.index)).forEach(el => {
    if (el.index > preNormalizeIndex) {
      preNormalizeIndex = el.index;
      el.index = ++index;
    } else {
      el.index = index;
    }
  });
  return segments;
}

/**
 * In order to preserve the original segments and allow for extra properties
 * the segments are mapped to Intervals
 * 
 * @param segments 
 * @returns Interval array
 */
const mapToIntervals = (segments: Segment[]): Interval[] => 
  segments.map(s => ({
    id: s.id,
    start: s.start + s.offsetStart,
    end: s.start + s.duration - s.offsetEnd,
    index: s.index,
    originalStart: s.start,
    source: s.source
  }));

/**
 * Sorts the intervals by index, then by start
 * 
 * @param intervals 
 * @return Interval array
 */
const sort = (intervals: Interval[]): Interval[] => 
  intervals.sort((a, b) => cmp(a.index, b.index) || cmp(a.start, b.start));

/**
 * Returns a map of intervals grouped by the key property
 * 
 * @param intervals 
 * @param key 
 * 
 * @returns Map of index => interval[]
 */
const groupByIndex = (intervals: Interval[]): IntervalMap =>
  intervals.reduce((groups, interval) => {
    (groups[interval.index] = groups[interval.index] || []).push(interval);
    return groups;
  }, <IntervalMap>{});


/**
 * Merges all the groups by index
 * 
 * @param grouped 
 * @returns Interval array
 */
const weightedMerge = (grouped: IntervalMap): Interval[] => {
  let flattened: Interval[] | null = null;
  for (let index of Object.keys(grouped)) {
    const merged = merge(grouped[index]);
    if (flattened == null) {
      flattened = merged;
    } else {
      flattened = combine(merged, flattened);
    }
  }
  return <Interval[]>flattened;
}

/**
 * Merges a set of intervals with the same index and remove any overlaps, left to right
 * 
 * @param intervals 
 * @returns Interval array
 */
const merge = (intervals: Interval[]): Interval[] => {
  if (intervals.length <= 1) 
    return intervals;

  const result: Interval[] = [];

  let current = intervals[0];
  for (let i = 1; i < intervals.length; i++) {
    const next = intervals[i];

    // If current is completely overlapped by second it is merged into it
    if (current.end >= next.end) {
      continue;
    // Resolves partial overlaps by setting end of current to start of next
    } else if(next.start < current.end) {
      result.push({ ...current, end: next.start });
      current = next;
    } else {
      // No overlap, push onto results
      result.push(current);
      current = next;
    }
  }

  result.push(current);
  return result;
}

/**
 * Given two sets of intervals it merges them so the highIndexes set has priority
 *
 * @param highIndexes
 * @param lowIndexes
 * 
 * @returns Interval array
 */
const combine = (highIndexes: Interval[], lowIndexes: Interval[]): Interval[] => {
  let highIndex = 0;
  let lowIndex = 0;

  const merged: Interval[] = [];

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
    } else if (high.start <= low.start) {
      // No overlap between low and high
      // low:                 ----------------------
      // high: ---------------
      if(high.end <= low.start) {
      // Partial overlap where high ends after low
      // low:                 ----------------------
      // high: ----------------------
      } else if(high.end < low.end) {
        low.start = high.end;
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
      if (low.end <= high.start) {
        merged.push({ ...low });
        lowIndex++;
      // Partial overlap where high ends after low
      // low: ---------------------
      // high                ----------------------
      } else if (high.end > low.end) {
        merged.push({ ...low, end: high.start });
        lowIndex++;
      // Partial overlap where high ends before low
      // low: -------------------------------------
      // high             -----------
      } else {
        merged.push({ ...low, end: high.start });
        low.start = high.end;
      } 
    }
  }

  return merged;
}

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