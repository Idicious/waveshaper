import { Segment, Interval } from "../../../src";

export interface TestCase {
    test: string;
    input: Segment[],
    expected: Interval[]
}

const testdata: TestCase[] = [
    {
        test: "Flatten returns intervals.",
        input: [
            { id: "1", start: 0, duration: 30, index: 1, offsetStart: 0, offsetEnd: 0, source: "1" }
        ],
        expected: [
            { id: "1", start: 0, end: 30, index: 1, originalStart: 0, source: "1" }
        ]
    },
    {
        test: "Normalizes indexes correctly.",
        input: [
            { id: "3", start: 10, duration: 5, index: 36, offsetStart: 0, offsetEnd: 0, source: "1" },
            { id: "4", start: 15, duration: 5, index: 10, offsetStart: 0, offsetEnd: 0, source: "1" },
            { id: "1", start: 0, duration: 5, index: 50, offsetStart: 0, offsetEnd: 0, source: "1" },
            { id: "2", start: 5, duration: 5, index: 23, offsetStart: 0, offsetEnd: 0, source: "1" },
        ],
        expected: [
            { id: "1", start: 0, end: 5, index: 4, originalStart: 0, source: "1" },
            { id: "2", start: 5, end: 10, index: 2, originalStart: 5, source: "1" },
            { id: "3", start: 10, end: 15, index: 3, originalStart: 10, source: "1" },
            { id: "4", start: 15, end: 20, index: 1, originalStart: 15, source: "1" },
        ]
    },
    {
        test: "Sorts correctly.",
        input: [
            { id: "3", start: 10, duration: 5, index: 1, offsetStart: 0, offsetEnd: 0, source: "1" },
            { id: "4", start: 15, duration: 5, index: 1, offsetStart: 0, offsetEnd: 0, source: "1" },
            { id: "2", start: 5, duration: 5, index: 1, offsetStart: 0, offsetEnd: 0, source: "1" },
            { id: "1", start: 0, duration: 5, index: 1, offsetStart: 0, offsetEnd: 0, source: "1" }
        ],
        expected: [
            { id: "1", start: 0, end: 5, index: 1, originalStart: 0, source: "1" },
            { id: "2", start: 5, end: 10, index: 1, originalStart: 5, source: "1" },
            { id: "3", start: 10, end: 15, index: 1, originalStart: 10, source: "1" },
            { id: "4", start: 15, end: 20, index: 1, originalStart: 15, source: "1" },
        ]
    },
    {
        test: "Maps to intervals correctly (calculating interval start and end).",
        input: [
            { id: "1", start: 0, duration: 10, index: 1, offsetStart: 5, offsetEnd: 0, source: "1" },
            { id: "2", start: 10, duration: 10, index: 1, offsetStart: 0, offsetEnd: 5, source: "1" },
            { id: "3", start: 20, duration: 10, index: 1, offsetStart: 2, offsetEnd: 3, source: "1" }
        ],
        expected: [
            { id: "1", start: 5, end: 10, index: 1, originalStart: 0, source: "1" },
            { id: "2", start: 10, end: 15, index: 1, originalStart: 10, source: "1" },
            { id: "3", start: 22, end: 27, index: 1, originalStart: 20, source: "1" }
        ]
    },

    /**
     * Tests all cases of merging within the same index
     */

    {
        test: "Drops intervals with the same index that are completely overlapped by another.",
        input: [
            { id: "1", start: 0, duration: 30, index: 1, offsetStart: 0, offsetEnd: 0, source: "1" },
            { id: "2", start: 5, duration: 10, index: 1, offsetStart: 0, offsetEnd: 0, source: "1" }
        ],
        expected: [
            { id: "1", start: 0, end: 30, index: 1, originalStart: 0, source: "1" }
        ]
    },
    {
        test: "Merges partially overlapping interval with the same index by setting end of first to start of second.",
        input: [
            { id: "1", start: 0, duration: 30, index: 1, offsetStart: 0, offsetEnd: 0, source: "1" },
            { id: "2", start: 15, duration: 30, index: 1, offsetStart: 0, offsetEnd: 0, source: "1" }
        ],
        expected: [
            { id: "1", start: 0, end: 15, index: 1, originalStart: 0, source: "1" },
            { id: "2", start: 15, end: 45, index: 1, originalStart: 15, source: "1" }
        ]
    },

    /**
     * Tests all cases when high index starts first
     */

    {
        test: "Keeps both intervals if high index interval starts first without overlap.",
        input: [
            { id: "1", start: 0, duration: 5, index: 2, offsetStart: 0, offsetEnd: 0, source: "1" },
            { id: "2", start: 5, duration: 5, index: 1, offsetStart: 0, offsetEnd: 0, source: "1" }
        ],
        expected: [
            { id: "1", start: 0, end: 5, index: 2, originalStart: 0, source: "1" },
            { id: "2", start: 5, end: 10, index: 1, originalStart: 5, source: "1" }
        ]
    },
    {
        test: "Changes low index start if high index starts first and partially overlaps.",
        input: [
            { id: "1", start: 0, duration: 7, index: 2, offsetStart: 0, offsetEnd: 0, source: "1" },
            { id: "2", start: 5, duration: 5, index: 1, offsetStart: 0, offsetEnd: 0, source: "1" }
        ],
        expected: [
            { id: "1", start: 0, end: 7, index: 2, originalStart: 0, source: "1" },
            { id: "2", start: 7, end: 10, index: 1, originalStart: 5, source: "1" }
        ]
    },
    {
        test: "Drops low index if completely overlapped by high index.",
        input: [
            { id: "1", start: 10, duration: 5, index: 1, offsetStart: 0, offsetEnd: 0, source: "1" },
            { id: "2", start: 0, duration: 30, index: 2, offsetStart: 0, offsetEnd: 0, source: "1" }
        ],
        expected: [
            { id: "2", start: 0, end: 30, index: 2, originalStart: 0, source: "1" }
        ]
    },

    /**
     * Tests all cases where low index starts first
     */
    {
        test: "Keeps both if low index starts first without overlap.",
        input: [
            { id: "1", start: 0, duration: 5, index: 1, offsetStart: 0, offsetEnd: 0, source: "1" },
            { id: "2", start: 5, duration: 5, index: 2, offsetStart: 0, offsetEnd: 0, source: "1" }
        ],
        expected: [
            { id: "1", start: 0, end: 5, index: 1, originalStart: 0, source: "1" },
            { id: "2", start: 5, end: 10, index: 2, originalStart: 5, source: "1" }
        ]
    },
    {
        test: "Changes low index end if low index starts first and is partially overlapped by high which ends after low.",
        input: [
            { id: "1", start: 0, duration: 7, index: 1, offsetStart: 0, offsetEnd: 0, source: "1" },
            { id: "2", start: 5, duration: 5, index: 2, offsetStart: 0, offsetEnd: 0, source: "1" }
        ],
        expected: [
            { id: "1", start: 0, end: 5, index: 1, originalStart: 0, source: "1" },
            { id: "2", start: 5, end: 10, index: 2, originalStart: 5, source: "1" }
        ]
    },
    {
        test: "Splits lower index with higher index.",
        input: [
            { id: "1", start: 0, duration: 30, index: 1, offsetStart: 0, offsetEnd: 0, source: "1" },
            { id: "2", start: 7, duration: 30, index: 2, offsetStart: 0, offsetEnd: 27, source: "1" }
        ],
        expected: [
            { id: "1", start: 0, end: 7, index: 1, originalStart: 0, source: "1" },
            { id: "2", start: 7, end: 10, index: 2, originalStart: 7, source: "1" },
            { id: "1", start: 10, end: 30, index: 1, originalStart: 0, source: "1" }
        ]
    },

    /**
     * A couple more complex test cases (several overlapping indexes, overlapped at multiple points etc.)
     */
    {
        test: "Splits lower index with higher index at multiple points taking offsets into account.",
        input: [
            { id: "1", start: 0, duration: 30, index: 1, offsetStart: 1, offsetEnd: 1.5, source: "1" },
            { id: "2", start: 5, duration: 5, index: 2, offsetStart: 2, offsetEnd: 0, source: "1" },
            { id: "3", start: 20, duration: 15, index: 2, offsetStart: 0, offsetEnd: 12, source: "1" }
        ],
        expected: [
            { id: "1", start: 1, end: 7, index: 1, originalStart: 0, source: "1" },
            { id: "2", start: 7, end: 10, index: 2, originalStart: 5, source: "1" },
            { id: "1", start: 10, end: 20, index: 1, originalStart: 0, source: "1" },
            { id: "3", start: 20, end: 23, index: 2, originalStart: 20, source: "1" },
            { id: "1", start: 23, end: 28.5, index: 1, originalStart: 0, source: "1" }
        ]
    },
    {
        test: "Splits lower index with higher index when 3 indexes overlap.",
        input: [
            { id: "1", start: 0, duration: 30, index: 1, offsetStart: 0, offsetEnd: 0, source: "1" },
            { id: "2", start: 10, duration: 10, index: 2, offsetStart: 0, offsetEnd: 0, source: "1" },
            { id: "3", start: 12, duration: 6, index: 3, offsetStart: 0, offsetEnd: 0, source: "1" }
        ],
        expected: [
            { id: "1", start: 0, end: 10, index: 1, originalStart: 0, source: "1" },
            { id: "2", start: 10, end: 12, index: 2, originalStart: 10, source: "1" },
            { id: "3", start: 12, end: 18, index: 3, originalStart: 12, source: "1" },
            { id: "2", start: 18, end: 20, index: 2, originalStart: 10, source: "1" },
            { id: "1", start: 20, end: 30, index: 1, originalStart: 0, source: "1" }
        ]
    },
    {
        test: "Drops lowest index when completely overlapped due to offset + splits 2 overlapping higher indexes.",
        input: [
            { id: "1", start: 0, duration: 30, index: 1, offsetStart: 10, offsetEnd: 10, source: "1" },
            { id: "2", start: 10, duration: 10, index: 2, offsetStart: 0, offsetEnd: 0, source: "1" },
            { id: "3", start: 12, duration: 6, index: 3, offsetStart: 0, offsetEnd: 0, source: "1" }
        ],
        expected: [
            { id: "2", start: 10, end: 12, index: 2, originalStart: 10, source: "1" },
            { id: "3", start: 12, end: 18, index: 3, originalStart: 12, source: "1" },
            { id: "2", start: 18, end: 20, index: 2, originalStart: 10, source: "1" }
        ]
    },
]

export default testdata;