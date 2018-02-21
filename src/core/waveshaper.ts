import { MeterType, ManagerOptions } from '../config/managerconfig';
import calculatePeaks from '../strategies/calculate/peak'
import calculateRms from '../strategies/calculate/rms'
import Segment from '../models/segment';
import flattenSegments from '../methods/flatten';
import Interval from '../models/interval';

export interface LastDrawValues {
    meterType: MeterType;
    sampleSize: number;
    samplesPerPixel: number,
    scrollPosition: number,
    samplerate: number
}

export default class WaveShaper {
    flattened: Interval[];

    constructor(public readonly id: string, public segments: Segment[]) {
        this.flatten();
    }

    flatten() {
        this.flattened = flattenSegments(this.segments);
    }

    /**
     * Gets the duration of the audio in seconds
     * 
     * @returns {number} Decimal value of total duration in seconds
     */
    getDuration(): number {
        let maxLength = 0;
        for (let segment of this.segments) {
            const end = segment.start + segment.duration;
            if (end > maxLength) {
                maxLength = end;
            }
        }
        return maxLength;
    }

    /**
     * Gets the summerized values for the current settings
     * 
     * @param {string} meterType
     * @param {number} sampleSize
     * @param {number} samplesPerPixel
     * @param {number} scrollPosition
     * @param {boolean} forceDraw
     * @param {Map<string, Float32Array>} dataMap
     * @returns {Array} Two dimensional array, one entry for each pixel, for each pixel a min
     * and a max value.
     */
    calculate(options: ManagerOptions, dataMap: Map<string, Float32Array>): Float32Array {
        switch (options.meterType) {
            case 'rms':
                return calculateRms(options, this.flattened, dataMap);
            default:
                return calculatePeaks(options, this.flattened, dataMap);
        }
    }
}