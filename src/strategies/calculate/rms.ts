import Interval from '../../models/interval';
import { ManagerOptions } from '../../config/managerconfig';

/**
 * Calculate rms values
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
        let posSum = 0;
        let negSum = 0;

        const currentSecond = startSecond + ((i * options.samplesPerPixel) / options.samplerate);
        let interval;
        for(let i = 0; i < intervals.length; i++) {
            const s = intervals[i];
            if(s.start <= currentSecond && s.end >= currentSecond) {
                interval = s;
                break;
            }
        }

        if(interval == null) {
            peaks.set([0, 0, 0, 0], index);
            continue;
        }
        
        let intervalBorder = 0;
        if(currentSecond + secondsPerPixel > interval.end 
            || currentSecond - secondsPerPixel < interval.start) {
            intervalBorder = 1;
        }

        const buffer = dataMap.get(interval.source);
        if(buffer == null) {
            peaks.set([0, 0, intervalBorder, 1], index);
            continue;
        }

        const offsetStart = interval.start - interval.originalStart;
        const secondsIntoInterval = currentSecond - interval.start;
        const startSample = Math.floor(((secondsIntoInterval + offsetStart) * options.samplerate));
        const length = buffer.length;
        const loopEnd = startSample + options.samplesPerPixel;
        const end = length < loopEnd ? length : loopEnd;

        // Cycle through the data-points relevant to the pixel
        // Don't cycle through more than sampleSize frames per pixel.
        for (let j = startSample; j < end; j += sampleSize) {
            const val = buffer[j];

            // Keep track of positive and negative values separately
            if (val > 0) {
                posSum += val * val;
            } else {
                negSum += val * val;
            }
        }

        const samples = Math.min(options.samplesPerPixel / 2, Math.round(options.resolution / 2));

        const min = -Math.sqrt(negSum / samples);
        const max = Math.sqrt(posSum / samples);

        peaks.set([min, max, intervalBorder, 1], index);
    }
    return peaks;
}