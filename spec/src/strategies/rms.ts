import {defaultConfig, rms} from '../../../src';

describe('Rms calculation tests.', () => {
    it('Calculates rms values.', () => {
        const data = new Map();
        data.set('1', GenerateArray(50, 100));
        data.set('2', GenerateArray(100, 200));

        const result = rms({ ...defaultConfig,
            samplerate: 1,
            scrollPosition: 0,
            samplesPerPixel: 1,
            width: 2,
            resolution: 1
        }, [
            {start: 0, end: 1, offsetStart: 0, source: '1', id: '1', index: 1},
            {start: 1, end: 2, offsetStart: 0, source: '2', id: '1', index: 1}
        ], data);

        expect(result.length).toBe(8);
        expect(result[1]).toBe(50);
        expect(result[5]).toBe(100);
    });

    it('Returns emediatly when there are no intervals in range', () => {
        const data = new Map();
        data.set('1', GenerateArray(50, 100));
        data.set('2', GenerateArray(100, 200));

        const result = rms({ ...defaultConfig,
            samplerate: 1,
            scrollPosition: 2,
            samplesPerPixel: 1,
            width: 2,
            resolution: 1
        }, [
            {start: 0, end: 1, offsetStart: 0, source: '1', id: '1', index: 1},
            {start: 1, end: 2, offsetStart: 0, source: '2', id: '1', index: 1}
        ], data);

        expect(result.length).toBe(8);
        expect(result[1]).toBe(0);
        expect(result[5]).toBe(0);
    });

    it('Does not overflow when data array is shorter than sample length.', () => {
        const data = new Map();
        data.set('1', [50]);
        data.set('2', [30]);

        const result = rms({ ...defaultConfig,
            samplerate: 2,
            scrollPosition: 0,
            samplesPerPixel: 2,
            width: 2,
            resolution: 2
        }, [
            {start: 0, end: 1, offsetStart: 0, source: '1', id: '1', index: 1},
            {start: 1, end: 2, offsetStart: 0, source: '2', id: '1', index: 1}
        ], data);

        expect(result.length).toBe(8);
        expect(result[1]).toBe(50);
        expect(result[5]).toBe(30);
    });
});

const GenerateArray = (start: number, n: number): Float32Array => {
    const arr = [];
    for(let i = start; i < n; i++) {
        arr.push(i)
    }

    return new Float32Array(arr);
}