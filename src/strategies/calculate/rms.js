import { Interval } from '../../models/interval';
const savedValues = [];

/**
 * 
 * 
 * @export
 * @param {number} sampleRatio 
 * @param {number} samplesPerPixel 
 * @param {number} width 
 * @param {Interval[]} segments 
 * @param {number} scrollPosition 
 * @param {number} sampleRate
 * @param {Map<string, Float32Array} dataMap
 * @returns 
 */
export function calculateRms(sampleRatio, samplesPerPixel, width, segments, scrollPosition, sampleRate, dataMap) {
    const sampleSize = Math.ceil(samplesPerPixel / sampleRatio);
    const start = scrollPosition * samplesPerPixel;
    const startSecond = start / sampleRate;
    const secondsPerPixel = samplesPerPixel / sampleRate;

    const vals = [];
    // For each pixel we display
    for (let i = 0; i < width; i++) {
        let posSum = 0;
        let negSum = 0;

        const currentSecond = startSecond + ((i * samplesPerPixel) / sampleRate);
        let interval;
        for(let i = 0; i < segments.length; i++) {
            const s = segments[i];
            if(s.start <= currentSecond && s.end >= currentSecond) {
                interval = s;
                break;
            }
        }

        if(interval == null) {
            vals.push([posSum, negSum, false]);
            continue;
        }

        const buffer = dataMap.get(interval.source);
        let endOfInterval = false;
        if((currentSecond + secondsPerPixel) > interval.end 
            || currentSecond - secondsPerPixel < interval.start) {
            endOfInterval = true;
        }

        const offsetStart = interval.start - interval.originalStart;
        const secondsIntoInterval = currentSecond - interval.start;
        const startSample = Math.floor(((secondsIntoInterval + offsetStart) * sampleRate));

        // Cycle through the data-points relevant to the pixel
        // Don't cycle through more than sampleSize frames per pixel.
        for (let j = 0; j < samplesPerPixel; j += sampleSize) {
            const index = j + startSample;
            if (index < buffer.length) {
                const val = buffer[index];

                // Keep track of positive and negative values separately
                if (val > 0) {
                    posSum += val * val;
                } else {
                    negSum += val * val;
                }
            }
        }

        const samples = Math.round(samplesPerPixel / sampleSize);
        const min = -Math.sqrt(negSum / samples * 2);
        const max = Math.sqrt(posSum / samples * 2);

        vals.push([min, max, endOfInterval]);
    }
    return vals;
}