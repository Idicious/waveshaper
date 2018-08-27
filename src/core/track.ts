import { ManagerOptions } from "../config/managerconfig";
import calculatePeaks from "../strategies/peak";
import calculateRms from "../strategies/rms";
import AudioInterval from "../models/interval";
import { weightedIntervalMerge } from "weighted-interval-merge";

export default class Track {
  public readonly id: string;

  public intervals: AudioInterval[];

  public get flattened(): AudioInterval[] {
    return [...this._flattened];
  }
  protected _flattened: AudioInterval[];

  protected _lastValue = new Float32Array(this.width * 4);

  constructor(id: string, intervals: AudioInterval[], protected width: number) {
    this.id = id;
    this.intervals = intervals || [];

    this._flattened = weightedIntervalMerge(this.intervals) as AudioInterval[];
  }

  flatten() {
    this._flattened = weightedIntervalMerge(this.intervals) as AudioInterval[];
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
  calculate(
    options: ManagerOptions,
    dataMap: Map<string, Float32Array>,
    start: number,
    width: number,
    shift: number
  ): Float32Array {
    switch (options.meterType) {
      case "peak":
        this._lastValue = calculatePeaks(
          options,
          this.flattened,
          dataMap,
          start,
          width,
          shift,
          this._lastValue
        );
        break;
      default:
        this._lastValue = calculateRms(
          options,
          this.flattened,
          dataMap,
          start,
          width,
          shift,
          this._lastValue
        );
        break;
    }

    return this._lastValue;
  }
}
