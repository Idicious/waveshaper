import flatten, { normalizeIndex, mapToIntervals, cmp, sort, groupByIndex, merge } from '../../../src/methods/flatten';
import { Segment } from '../../../src';
import Interval from '../../../src/models/interval';

describe('Tests of the flatten methods', () => {
    it('Gives back segments', () => {
        const segments: Segment[] = [
            { id: 'abc', start: 0, duration: 30, index: 1, offsetEnd: 0, offsetStart: 0, source: '1' }
        ];

        const intervals = flatten(segments);
        expect(intervals.length).toBe(1);
    });

    it('Compares correctly.', () => {
        expect(cmp(2, 2)).toBe(0);
        expect(cmp(1, 2)).toBe(-1);
        expect(cmp(2, 1)).toBe(1);
    });

    it('Normalizes indexes correctly', () => {
        const segments: Segment[] = [
            { id: '1', start: 5, duration: 20, index: 500, offsetEnd: 0, offsetStart: 0, source: '1' },
            { id: '2', start: 0, duration: 30, index: 1000, offsetEnd: 0, offsetStart: 0, source: '1' },
            { id: '3', start: 5, duration: 20, index: 500, offsetEnd: 0, offsetStart: 0, source: '1' }
        ];

        let normalized = normalizeIndex(segments);
        expect(normalized.length).toBe(3);
        expect(normalized[0].id).toBe('1');
        expect(normalized[0].index).toBe(1);
        expect(normalized[1].id).toBe('3');
        expect(normalized[1].index).toBe(1);
        expect(normalized[2].id).toBe('2');
        expect(normalized[2].index).toBe(2);
    });

    it('Maps to intervals correctly', () => {
        const segments: Segment[] = [
            { id: 'abc', start: 0, duration: 30, index: 1, offsetEnd: 10, offsetStart: 5, source: '1' }
        ];

        const intervals = mapToIntervals(segments);
        expect(intervals.length).toBe(1);

        const interval = intervals[0];
        expect(interval.start).toBe(5);
        expect(interval.end).toBe(20);
        expect(interval.originalStart).toBe(0);
        expect(interval.index).toBe(1);
        expect(interval.id).toBe('abc');
        expect(interval.source).toBe('1');
    });

    it('Sorts intervals correctly', () => {
        const intervals: Interval[] = [
            { id: '1', start: 7, end: 25, index: 1, originalStart: 7, source: '1' },
            { id: '2', start: 0, end: 30, index: 2, originalStart: 0, source: '1' },
            { id: '3', start: 5, end: 35, index: 1, originalStart: 5, source: '1' }
        ];

        const sorted = sort(intervals);

        expect(sorted.length).toBe(3);

        expect(sorted[0].id).toBe('3')
        expect(sorted[1].id).toBe('1');
        expect(sorted[2].id).toBe('2')
    });

    it('Groups by index correctly', () => {
        const intervals: Interval[] = [
            { id: '1', start: 7, end: 25, index: 1, originalStart: 7, source: '1' },
            { id: '2', start: 0, end: 30, index: 2, originalStart: 0, source: '1' },
            { id: '3', start: 5, end: 35, index: 1, originalStart: 5, source: '1' }
        ];

        const grouped = groupByIndex(intervals);
        const keys = Object.keys(grouped);
        expect(keys.length).toBe(2);

        expect(grouped['1'].length).toBe(2);
        expect(grouped['2'].length).toBe(1);
    });

    it('Merges completely overlapping intervals.', () => {
        const intervals: Interval[] = [
            { id: '1', start: 0, end: 30, index: 1, originalStart: 7, source: '1' },
            { id: '2', start: 5, end: 25, index: 1, originalStart: 0, source: '1' }
        ];

        const merged = merge(intervals);
        expect(merged.length).toBe(1);
        expect(merged[0].id).toBe('1');
    });

    it('Merge throws if not sorted.', () => {
        const intervals: Interval[] = [
            { id: '1', start: 5, end: 25, index: 1, originalStart: 0, source: '1' },
            { id: '2', start: 0, end: 30, index: 1, originalStart: 7, source: '1' }
        ];

        expect(() => merge(intervals)).toThrow();
    });

    it('Merge throws if not same index.', () => {
        const intervals: Interval[] = [
            { id: '1', start: 0, end: 30, index: 1, originalStart: 0, source: '1' },
            { id: '2', start: 5, end: 20, index: 2, originalStart: 7, source: '1' }
        ];

        expect(() => merge(intervals)).toThrow();
    });
});