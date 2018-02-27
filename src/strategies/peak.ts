//import Interval from '../models/interval';
import { ManagerOptions } from '../config/managerconfig';
import Interval from '../models/interval';

/**
 * Calculates peak values
 * 
 * @export
 * @param resolution 
 * @param samplesPerPixel 
 * @param width 
 * @param intervals 
 * @param scrollPosition 
 * @param sampleRate
 * @param dataMap
 * @returns 
 */
export default (options: ManagerOptions, intervals: Interval[], dataMap: Map<string, Float32Array>): Float32Array => {
    
    const sampleSize = Math.ceil(options.samplesPerPixel / options.resolution);
    const start = options.scrollPosition * options.samplesPerPixel;
    const startSecond = start / options.samplerate;
    const secondsPerPixel = options.samplesPerPixel / options.samplerate;
    const endSecond = startSecond + (options.width * secondsPerPixel);

    const peaks = new Float32Array(options.width * 4);

    let currentIntervalIndex = intervals.findIndex(i => i.end > startSecond && i.start + i.offsetStart < endSecond);

    // There are no intervals in this range so return empty array
    if(currentIntervalIndex === -1)
        return peaks;

    const maxIntervalIncrementIndex = intervals.length - 1;

    let currentInterval = intervals[currentIntervalIndex];
    let buffer = dataMap.get(currentInterval.source);
    
    // For each pixel we display
    for (let i = 0; i < options.width; i++) {
        const currentSecond = startSecond + (i * secondsPerPixel);
        if (currentInterval.start + currentInterval.offsetStart > currentSecond) {
            continue;
        }

        const startBorder = currentSecond - secondsPerPixel <= currentInterval.start + currentInterval.offsetStart;
        const endBorder = currentSecond + secondsPerPixel >= currentInterval.end;
        const intervalBorder = startBorder || endBorder ? 1 : 0;

        if (buffer == null) {
            peaks.set([0, 0, intervalBorder, 1], (i * 4));
            continue;
        }

        const secondsIntoInterval = currentSecond - currentInterval.start;
        const startSample = Math.floor(secondsIntoInterval * options.samplerate);

        const endSample = startSample + options.samplesPerPixel;
        const length = buffer.length;
        const loopEnd = length < endSample ? length : endSample;

        // Cycle through the data-points relevant to the pixel
        // Don't cycle through more than sampleSize frames per pixel.
        let min = 0, max = 0;
        for (let j = startSample; j < loopEnd; j += sampleSize) {
            const sample = buffer[j];

            // Keep track of positive and negative values separately
            if (sample > max) max = sample;
            else if (sample < min) min = sample;
        }

        peaks.set([min, max, intervalBorder, 1], (i * 4));

        if(currentSecond + secondsPerPixel >= currentInterval.end) {
            if(currentIntervalIndex === maxIntervalIncrementIndex) {
                return peaks;
            } else {
                currentInterval = intervals[++currentIntervalIndex];
                buffer = dataMap.get(currentInterval.source);
            }
        }
    }
    return peaks;
}