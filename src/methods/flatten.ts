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
 * @param {Segment[]} segments
 * @returns {Interval[]}
 */
export default (segments: Segment[]): Interval[] => {
  var normalized = normalizeIndex(segments);
  var intervals = mapToIntervals(normalized);
  var sorted = sort(intervals);
  var grouped = grouByIndex(sorted);

  return weightedMerge(grouped);
}

/**
 * When an element is altered the index is set very high,
 * this functions normalizes to indexes back to 0
 * 
 * @param {Segment[]} segments 
 */
const normalizeIndex = (segments: Segment[]): Segment[] => {
  let index = 0;
  segments.sort((a, b) => cmp(a.index, b.index)).forEach(el => {
    if (el.index > index) {
      el.index = ++index;
    }
    else {
      el.index = index;
    }
  });
  return segments;
}

/**
 * In order to preserve the original segments and allow for extra properties
 * the segments are mapped to Intervals
 * 
 * @param {Segment[]} segments 
 * @returns {Interval[]}
 */
const mapToIntervals = (segments: Segment[]): Interval[] => {
  return segments
    .map(s => {
      return {
        id: s.id,
        start: s.start + s.offsetStart,
        end: s.start + s.duration - s.offsetEnd,
        index: s.index,
        originalStart: s.start,
        source: s.source
      };
    });
}

/**
 * Sorts the intervals by index, then by start
 * 
 * @param {Interval[]} intervals 
 * @return {Interval[]}
 */
const sort = (intervals: Interval[]): Interval[] => {
  intervals.sort((a, b) => {
    return cmp(a.index, b.index) || cmp(a.start, b.start);
  });
  return intervals;
}

/**
 * Returns a map of intervals grouped by the key property
 * 
 * @param {Interval[]} intervals 
 * @param {string} key 
 * 
 * @returns {{[key: string] : Interval[]}}
 */
const grouByIndex = (intervals: Interval[]): IntervalMap => {
  return intervals.reduce((groups, interval) => {
    (groups[interval.index] = groups[interval.index] || []).push(interval);
    return groups;
  }, <IntervalMap>{});
};

/**
 * Merges all the groups by index
 * 
 * @param {IntervalMap} grouped 
 * @returns {Interval[]}
 */
const weightedMerge = (grouped: IntervalMap): Interval[] => {
  /** @type {Interval[]} */
  let flattened;
  for (let index of Object.keys(grouped)) {
    merge(grouped[index]);
    if (flattened == null) {
      flattened = grouped[index];
    }
    else {
      flattened = combine(grouped[index], flattened);
    }
  }
  return flattened;
}

/**
 * Merges a set of intervals with the same index that are 
 * completely overlapped by another
 * 
 * @param {Interval[]} intervals 
 * @returns {Interval[]}
 */
const merge = (intervals: Interval[]): Interval[] => {
  if (intervals == null || intervals.length <= 1) return intervals;

  const result: Interval[] = [];
  let prev = intervals[0];
  for (let i = 1; i < intervals.length; i++) {
    const curr = intervals[i];

    if (prev.end >= curr.end) {
      // merged case
      const merged = Object.assign({}, prev, { end: Math.max(prev.end, curr.end)});
      prev = merged;
    } else {
      result.push(prev);
      prev = curr;
    }
  }

  result.push(prev);
  return result;
}

/**
 * Given two sets of intervals it merges them so the highIndexes set has priority
 *
 * @param {Interval[]} highIndexes
 * @param {Interval[]} lowIndexes
 * 
 * @returns {Interval[]}
 */
const combine = (highIndexes: Interval[], lowIndexes: Interval[]): Interval[] => {
  let highCount = 0;
  let lowCount = 0;

  const merged: Interval[] = [];

  while (highCount < highIndexes.length || lowCount < lowIndexes.length) {
    // Only low priority left so push it on the stack
    if (highCount === highIndexes.length) {
      merged.push(Object.assign({}, lowIndexes[lowCount]));
      lowCount++;
      // Only high priority left so push it on the stack
    } else if (lowCount === lowIndexes.length) {
      merged.push(Object.assign(highIndexes[highCount]));
      highCount++;
      // if high priority starts first
    } else if (highIndexes[highCount].start <= lowIndexes[lowCount].start) {
      lowIndexes[lowCount].start = Math.max(lowIndexes[lowCount].start, highIndexes[highCount].end);
      if (lowIndexes[lowCount].start >= lowIndexes[lowCount].end) {
        lowCount++;
      }
      merged.push(Object.assign({}, highIndexes[highCount]));
      highCount++;
    } else if (highIndexes[highCount].start >= lowIndexes[lowCount].start) {
      // end point of weak interval before the start of the strong
      if (lowIndexes[lowCount].end <= highIndexes[highCount].start) {
        merged.push(Object.assign({}, lowIndexes[lowCount]));
        lowCount++;
      } else if (highIndexes[highCount].start <= lowIndexes[lowCount].end && lowIndexes[lowCount].end <= highIndexes[highCount].end) {
        lowIndexes[lowCount].end = highIndexes[highCount].start;
        merged.push(Object.assign({}, lowIndexes[lowCount]));
        lowCount++;
      } else if (lowIndexes[lowCount].end >= highIndexes[highCount].end) {
        merged.push(
          Object.assign({}, lowIndexes[lowCount], {
            end: highIndexes[highCount].start
          })
        );
        lowIndexes[lowCount].start = highIndexes[highCount].end;
      }
    }
  }

  return merged;
}

/**
 *
 * @param {number} a
 * @param {number} b
 */
const cmp = (a: number, b: number): 1 | -1 | 0 => {
  if (a > b) return +1;
  if (a < b) return -1;
  return 0;
};