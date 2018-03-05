import { ManagerOptions } from '../config/managerconfig';
import calculatePeaks from '../strategies/peak'
import calculateRms from '../strategies/rms'
import Interval from '../models/interval';
import flattenSegments from '../methods/flatten';

export default class Track {
    public readonly id: string;

    public intervals: Interval[];

    public get flattened(): Interval[] { return [ ...this._flattened ] }
    protected _flattened: Interval[];

    constructor(id: string, intervals: Interval[]) {
        this.id = id;
        this.intervals = intervals || [];

        this._flattened = flattenSegments(this.intervals);
    }

    flatten() {
        this._flattened = flattenSegments(this.intervals);
    }

    /**
     * Gets the duration of the audio in seconds
     * 
     * @returns Decimal value of total duration in seconds
     */
    getDuration() {
        return Math.max(...this.intervals.map(s => s.end));
    } 

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