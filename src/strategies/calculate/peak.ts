import Interval from '../../models/interval';

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
export const calculatePeaks = (resolution: number, samplesPerPixel: number, width: number, intervals: Interval[], 
    scrollPosition: number, sampleRate: number, dataMap: Map<string, Float32Array>): number[][] => {
        
    const sampleSize = Math.ceil(samplesPerPixel / resolution);

    const start = scrollPosition * samplesPerPixel;
    const startSecond = start / sampleRate;

    const secondsPerPixel = samplesPerPixel / sampleRate;

    const peaks: number[][] = [];
    // For each pixel we display
    for (let i = 0; i < width; i++) {
        let max = 0;
        let min = 0;

        const currentSecond = startSecond + ((i * samplesPerPixel) / sampleRate);
        let currentInterval;
        for (let i = 0; i < intervals.length; i++) {
            const interval = intervals[i];
            if (interval.start <= currentSecond && interval.end >= currentSecond) {
                currentInterval = interval;
                break;
            }
        }

        if (currentInterval == null) {
            peaks.push([0, 0, 0, 0]);
            continue;
        }

        let endOfInterval = false;
        if (currentSecond + secondsPerPixel > currentInterval.end
            || currentSecond - secondsPerPixel < currentInterval.start) {
            endOfInterval = true;
        }

        const buffer = dataMap.get(currentInterval.source);
        if (buffer == null) {
            peaks.push([0, 0, endOfInterval ? 1 : 0, 1]);
            continue;
        }

        const offsetStart = currentInterval.start - currentInterval.originalStart;
        const secondsIntoInterval = currentSecond - currentInterval.start;
        const startSample = Math.floor(((secondsIntoInterval + offsetStart) * sampleRate));

        const endSample = startSample + samplesPerPixel;
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

        peaks.push([min, max, endOfInterval ? 1 : 0, 1]);
    }
    return peaks;
}