import Interval from "../models/interval";
//import Interval from "../models/interval";

declare type IntervalMap = {[key: string] : Interval[]};
const start = (segment: Interval) => segment.start + segment.offsetStart;

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
export default (segments: Interval[]): Interval[] => {
  const sorted = sort(segments);
  const normalized = normalizeIndex(sorted);
  const copied = copy(normalized);
  const grouped = groupByIndex(copied);

  return weightedMerge(grouped);
}

/**
 * Copies elements so original are unaltered
 * 
 * @param intervals 
 */
const copy = (intervals: Interval[]): Interval[] => intervals.map(i => ({ ...i }));
  

/**
 * When an element is altered the index is set very high,
 * this functions normalizes to indexes back to 0
 * 
 * @param segments 
 */
const normalizeIndex = (segments: Interval[]): Interval[] => {
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
}

/**
 * Sorts the intervals by index, then by start
 * 
 * @param intervals 
 * @return Interval array
 */
const sort = (intervals: Interval[]): Interval[] => 
  intervals.sort((a, b) => cmp(a.index, b.index) || cmp(start(a), start(b)));

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
    } else if(start(next) < current.end) {
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
    } else if (start(high) <= start(low)) {
      // No overlap between low and high
      // low:                 ----------------------
      // high: ---------------
      if(high.end <= start(low)) {
      // Partial overlap where high ends after low
      // low:                 ----------------------
      // high: ----------------------
      } else if(high.end < low.end) {
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