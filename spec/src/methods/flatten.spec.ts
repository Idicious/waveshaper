import flatten from '../../../src/methods/flatten';
import testData from '../../assets/data/flatten';

describe('Tests the merging of intervals to a flat array.', () => {

    // There is a list of testcases with input and expected output in testData, all cases should be covered.
    testData.forEach(({ test, input, expected }) => {
        it(test, () => {
            const actual = flatten(input);
            expect(actual.length).toBe(expected.length);

            for(let i = 0; i < actual.length; i++) {
                expect(actual[i].id).toBe(expected[i].id);
                expect(actual[i].start).toBe(expected[i].start);
                expect(actual[i].end).toBe(expected[i].end);
                expect(actual[i].index).toBe(expected[i].index);
                expect(actual[i].originalStart).toBe(expected[i].originalStart);
            }
        });
    });
});