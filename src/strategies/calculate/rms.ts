import Interval from '../../models/interval';

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
export default (resolution: number, samplesPerPixel: number, width: number, intervals: Interval[], 
    scrollPosition: number, sampleRate: number, dataMap: Map<string, Float32Array>): number[][] => {

    const sampleSize = Math.ceil(samplesPerPixel / resolution);
    const start = scrollPosition * samplesPerPixel;
    const startSecond = start / sampleRate;
    const secondsPerPixel = samplesPerPixel / sampleRate;

    const vals : number[][] = [];
    // For each pixel we display
    for (let i = 0; i < width; i++) {
        let posSum = 0;
        let negSum = 0;

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
        
        let intervalBorder = 0;
        if(currentSecond + secondsPerPixel > interval.end 
            || currentSecond - secondsPerPixel < interval.start) {
            intervalBorder = 1;
        }

        const buffer = dataMap.get(interval.source);
        if(buffer == null) {
            vals.push([0, 0, intervalBorder, 1]);
            continue;
        }

        const offsetStart = interval.start - interval.originalStart;
        const secondsIntoInterval = currentSecond - interval.start;
        const startSample = Math.floor(((secondsIntoInterval + offsetStart) * sampleRate));
        const length = buffer.length;
        const loopEnd = startSample + samplesPerPixel;
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

        const samples = Math.min(samplesPerPixel / 2, Math.round(resolution / 2));
        const min = -Math.sqrt(negSum / samples);
        const max = Math.sqrt(posSum / samples);

        vals.push([min, max, intervalBorder, 1]);
    }
    return vals;
}