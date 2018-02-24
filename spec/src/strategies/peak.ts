import peak from '../../../src/strategies/peak';
import defaultSettings from '../../../src/config/managerconfig';

describe('Peak calculation tests.', () => {
    it('Calculates peak values.', () => {
        const data = new Map();
        data.set('1', GenerateArray(50, 100));
        data.set('2', GenerateArray(100, 200));

        const result = peak({ ...defaultSettings,
            samplerate: 1,
            scrollPosition: 0,
            samplesPerPixel: 1,
            width: 2,
            resolution: 1
        }, [
            {start: 0, end: 1, originalStart: 0, source: '1', id: '1', index: 1},
            {start: 1, end: 2, originalStart: 1, source: '2', id: '1', index: 1}
        ], data);

        expect(result.length).toBe(8);
        expect(result[1]).toBe(50);
        expect(result[5]).toBe(100);
    });
});

const GenerateArray = (start: number, n: number): Float32Array => {
    const arr = [];
    for(let i = start; i < n; i++) {
        arr.push(i)
    }

    return new Float32Array(arr);
}