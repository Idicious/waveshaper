import { Interval } from '../../models/interval';

/**
 * 
 * 
 * @export
 * @param {number} sampleRatio 
 * @param {number} samplesPerPixel 
 * @param {number} width 
 * @param {Interval[]} intervals 
 * @param {number} scrollPosition 
 * @param {number} sampleRate
 * @param {Map<string, Float32Array>} dataMap
 * @returns 
 */
export function calculatePeaks(sampleRatio, samplesPerPixel, width, intervals, scrollPosition, sampleRate, dataMap) {
    const sampleSize = Math.ceil(samplesPerPixel / sampleRatio);
    const start = scrollPosition * samplesPerPixel;
    const startSecond = start / sampleRate;
    const secondsPerPixel = samplesPerPixel / sampleRate;

    const vals = [];
    // For each pixel we display
    for (let i = 0; i < width; i++) {
        let posMax = 0;
        let negMax = 0;

        const currentSecond = startSecond + ((i * samplesPerPixel) / sampleRate);
        let interval;
        for(let i = 0; i < intervals.length; i++) {
            const s = intervals[i];
            if(s.start <= currentSecond && s.end >= currentSecond) {
                interval = s;
                break;
            }
        }
        
        if(interval == null) {
            vals.push([0, 0, 0, 0]);
            continue;
        }
        
        let endOfInterval = false;
        if(currentSecond + secondsPerPixel > interval.end 
            || currentSecond - secondsPerPixel < interval.start) {
            endOfInterval = true;
        }

        const buffer = dataMap.get(interval.source);
        if(buffer == null) {
            vals.push([0, 0, endOfInterval ? 1 : 0, 1]);
            continue;
        }

        const offsetStart = interval.start - interval.originalStart;
        const secondsIntoInterval = currentSecond - interval.start;
        const startSample = Math.floor(((secondsIntoInterval + offsetStart) * sampleRate));
        const loopEnd = startSample + samplesPerPixel;
        const length = buffer.length;
        const end = length < loopEnd ? length : loopEnd;

        // Cycle through the data-points relevant to the pixel
        // Don't cycle through more than sampleSize frames per pixel.
        for (let j = startSample; j < end; j += sampleSize) {
            const val = buffer[j];

            // Keep track of positive and negative values separately
            if (val > posMax) posMax = val;
            else if (val < negMax) negMax = val;
        }

        vals.push([negMax, posMax, endOfInterval ? 1 : 0, 1]);
    }
    return vals;
}