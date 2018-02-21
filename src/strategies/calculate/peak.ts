import Interval from '../../models/interval';
import { ManagerOptions } from '../../config/managerconfig';

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

    const peaks = new Float32Array(options.width * 4);
    // For each pixel we display
    for (let i = 0; i < options.width; i++) {
        const index = i * 4;

        let max = 0;
        let min = 0;

        const currentSecond = startSecond + ((i * options.samplesPerPixel) / options.samplerate);
        let currentInterval;
        for (let i = 0; i < intervals.length; i++) {
            const interval = intervals[i];
            if (interval.start <= currentSecond && interval.end >= currentSecond) {
                currentInterval = interval;
                break;
            }
        }

        if (currentInterval == null) {
            peaks.set([0, 0, 0, 0], index);
            continue;
        }

        let intervalBorder = 0;
        if (currentSecond + secondsPerPixel > currentInterval.end
            || currentSecond - secondsPerPixel < currentInterval.start) {
            intervalBorder = 1;
        }

        const buffer = dataMap.get(currentInterval.source);
        if (buffer == null) {
            peaks.set([0, 0, intervalBorder, 1], index);
            continue;
        }

        const offsetStart = currentInterval.start - currentInterval.originalStart;
        const secondsIntoInterval = currentSecond - currentInterval.start;
        const startSample = Math.floor(((secondsIntoInterval + offsetStart) * options.samplerate));

        const endSample = startSample + options.samplesPerPixel;
        const length = buffer.length;
        const loopEnd = length < endSample ? length : endSample;

        // Cycle through the data-points relevant to the pixel
        // Don't cycle through more than sampleSize frames per pixel.
        for (let j = startSample; j < loopEnd; j += sampleSize) {
            const sample = buffer[j];

            // Keep track of positive and negative values separately
            if (sample > max) max = sample;
            else if (sample < min) min = sample;
        }

        peaks.set([min, max, intervalBorder, 1], index);
    }
    return peaks;
}