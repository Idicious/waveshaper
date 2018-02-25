import { MeterType, ManagerOptions } from '../config/managerconfig';
import calculatePeaks from '../strategies/peak'
import calculateRms from '../strategies/rms'
import Interval from '../models/interval';
import flattenSegments from '../methods/flatten';

export interface LastDrawValues {
    meterType: MeterType;
    sampleSize: number;
    samplesPerPixel: number,
    scrollPosition: number,
    samplerate: number
}

export default class WaveShaper {
    flattened: Interval[];

    constructor(public readonly id: string, public segments: Interval[]) {
        this.flatten();
    }

    flatten() {
        this.flattened = flattenSegments(this.segments);
    }

    /**
     * Gets the duration of the audio in seconds
     * 
     * @returns Decimal value of total duration in seconds
     */
    getDuration = (): number => Math.max(...this.segments.map(s => s.end));

    /**
     * Gets the summerized values for the current settings
     * 
     * @param options
     * @param dataMap
     * @returns Two dimensional array, one entry for each pixel, for each pixel a min
     * and a max value.
     */
    calculate(options: ManagerOptions, dataMap: Map<string, Float32Array>): Float32Array {
        switch (options.meterType) {
            case 'peak':
                return calculatePeaks(options, this.flattened, dataMap);
            default:
                return calculateRms(options, this.flattened, dataMap);
        }
    }
}