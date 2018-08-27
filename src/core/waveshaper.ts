import Track from "./track";
import Data from "../models/data";
import defaultOptions, {
  ManagerOptions,
  ManagerInput
} from "../config/managerconfig";
import TrackInput from "../models/track-input";
import ProcessResult from "../models/process-result";
import {
  WaveShaperCallback,
  SegmentCallback,
  OptionsCallback
} from "../models/callback";
import { AudioInterval } from "..";

/**
 *
 *
 * @export
 */
export default class WaveShaper {
  /**
   * Map of waveshapers managed by the manager
   *
   * @readonly
   * @memberof WaveShaper
   */
  protected readonly tracks = new Map<string, Track>();

  /**
   * Map of audio data
   *
   * @readonly
   * @memberof WaveShaper
   */
  protected readonly audioData = new Map<string, Float32Array>();

  /**
   * @description Map of callback functions
   *
   * @readonly
   * @memberof WaveShaper
   */
  protected readonly callbackMap = new Map<string, WaveShaperCallback[]>();

  /**
   * @description Segment callback functions
   *
   * @readonly
   * @memberof WaveShaper
   */
  protected readonly segmentCallbackMap = new Array<SegmentCallback>();

  /**
   * @description Options callbacks
   *
   * @readonly
   * @memberof WaveShaper
   */
  protected readonly optionsCallbacks = new Array<OptionsCallback>();

  /**
   * @description Currect settings
   *
   * @readonly
   * @memberof WaveShaper
   */
  public get options(): ManagerOptions {
    return { ...this._options };
  }
  protected _options: ManagerOptions;

  /**
   * @description Active id's, redraws when draw is called without argument
   *
   * @readonly
   * @unused
   * @memberof WaveShaper
   */
  public get activeWaveShapers(): string[] {
    return [...this._activeWaveShapers];
  }
  protected _activeWaveShapers: string[] = [];

  /**
   * @description Last result of calling process, argument given to all callbacks
   *
   * @readonly
   * @memberof WaveShaper
   */
  public get lastProcessResult(): ProcessResult | null {
    return this._lastProcessResult;
  }
  protected _lastProcessResult: ProcessResult | null;

  /**
   * @description Total duration of all tracks
   *
   * @readonly
   * @memberof WaveShaper
   */
  public get duration() {
    return this._duration;
  }
  protected _duration: number;

  /**
   * @param [options=defaultOptions] Initial options
   * @throws Throws an error if samplerate is null or NaN
   */
  constructor(options: ManagerInput = defaultOptions) {
    this.validateOptions(options);
    this._options = { ...defaultOptions, ...options };
  }

  /**
   * Gives the position corresponding to a given time
   *
   * @param time
   */
  timeToPosition(time: number) {
    return (time * this._options.samplerate) / this._options.samplesPerPixel;
  }

  /**
   * Gives the time corresponding to a given position
   * @param position
   */
  positionToTime(position: number) {
    return (
      (position * this._options.samplesPerPixel) / this._options.samplerate
    );
  }

  /**
   * @description Flattens the segments of the given waveshaper id
   *
   * @param id
   * @returns WaveShaper instance
   */
  flatten(ids: string[] = []): WaveShaper {
    this.getProcessIds(ids).forEach(id => {
      const waveShaper = this.getTrack(id);
      if (waveShaper != null) waveShaper.flatten();
    });

    return this;
  }

  /**
   * Processes all relevant WaveShapers and invokes registered callbacks
   *
   * @param ids Options array of id's to draw
   * @param start Start position
   * @param width Width to process
   * @param shift Units to shift current data
   *
   * @returns WaveShaper instance
   */
  process(
    ids: string[] = [],
    start = 0,
    width = this.options.width,
    shift = 0
  ): WaveShaper {
    const toProcess = this.getProcessIds(ids);
    const options: ManagerOptions = { ...this.options };

    const data: Data[] = [];
    for (let i = 0; i < toProcess.length; i++) {
      const id = toProcess[i];

      const wave = this.getTrack(id);
      if (wave == null) continue;

      const peaks = wave.calculate(
        options,
        this.audioData,
        start,
        width,
        shift
      );
      data.push({ id, data: peaks });
    }

    // Invoke callbacks after returning value.
    this._lastProcessResult = { options, data };
    this.invokeCallbacks(this._lastProcessResult, start, width, shift);

    return this;
  }

  /**
   * Registers a callback that fires when the track with given id is processed
   *
   * @param id id of Track to register to
   * @param callBack will be invoked when the given track is processed
   *
   * @returns WaveShaper instance
   */
  on(id: string, callBack: WaveShaperCallback): WaveShaper {
    let callbackArray = this.callbackMap.get(id);
    if (callbackArray == null) {
      this.callbackMap.set(id, [callBack]);
    } else {
      callbackArray.push(callBack);
    }

    return this;
  }

  /**
   * Unregisters a callback from the given track, will no longer be called
   *
   * @param id id of Track to unregister from
   * @param callBack callback to remove
   *
   * @returns WaveShaper instance
   */
  off(id: string, callBack: WaveShaperCallback): WaveShaper {
    let callbackArray = this.callbackMap.get(id);
    if (callbackArray == null) return this;

    const index = callbackArray.indexOf(callBack);
    if (index < 0) return this;

    callbackArray = callbackArray.splice(index, 1);

    return this;
  }

  /**
   * Adds a callback that is triggered when an Interval is updated
   *
   * @param cb Callback function
   */
  onSegment(cb: SegmentCallback) {
    this.segmentCallbackMap.push(cb);
  }

  /**
   * Removes a previously added callback for the Interval update callback
   *
   * @param cb Callback function
   */
  offSegment(cb: SegmentCallback) {
    const index = this.segmentCallbackMap.indexOf(cb);
    if (index !== -1) {
      this.segmentCallbackMap.splice(index, 1);
    }
  }

  /**
   * Emits a segment update
   *
   * @param old Old interval
   * @param changed Updated interval
   */
  emitSegment(old: AudioInterval | null, changed: AudioInterval | null) {
    this.segmentCallbackMap.forEach(cb => cb(old, changed));
  }

  /**
   * Adds a callback that is fired when options are updated
   *
   * @param cb Callback function
   */
  onOptions(cb: OptionsCallback) {
    this.optionsCallbacks.push(cb);
  }

  /**
   * Removes a previously added callback
   * @param cb Callback function
   */
  offOptions(cb: OptionsCallback) {
    const index = this.optionsCallbacks.indexOf(cb);
    if (index !== -1) {
      this.optionsCallbacks.splice(index, 1);
    }
  }

  /**
   * Emits an options update
   *
   * @param old Old options
   * @param updated New options
   */
  protected emitOptions(old: ManagerOptions, updated: ManagerOptions) {
    this.optionsCallbacks.forEach(cb => cb(old, updated));
  }

  /**
   * @description Merges the given options into the current and returns updated options
   *
   * @param options A (partial) ManagerOptions object
   * @returns WaveShaper instance
   */
  setOptions(options: ManagerInput): WaveShaper {
    this.validateOptions(options);

    const oldOptions = { ...this.options };

    this._options = { ...oldOptions, ...options };
    this.emitOptions(oldOptions, this.options);

    return this;
  }

  /**
   * @description Adds a waveshaper to the manager
   *
   * @param id id of WaveShaper
   * @param segments Segments in wave
   * @param color Background color of segments
   *
   * @returns WaveShaper instance
   */
  setTracks(...tracks: TrackInput[]): WaveShaper {
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      const foundWave = this.getTrack(track.id);
      if (foundWave == null) {
        const wave = new Track(track.id, track.intervals, this._options.width);
        this.tracks.set(track.id, wave);
      } else {
        foundWave.intervals = track.intervals || [];
        foundWave.flatten();
      }
    }

    this._duration = this.getDuration();
    return this;
  }

  /**
   * @description Adds audio data to the waveshaper and redraws waveshapers using it
   *
   * @param id  Data id, refered to by source parameter of segments
   * @param data AudioBuffer with audio data
   *
   * @returns WaveShaper instance
   */
  setData(...data: Data[]) {
    data.forEach(d => {
      this.audioData.set(d.id, d.data);
    });

    return this;
  }

  /**
   * @description The given id's are set as the active waveshapers, process only processes these when set,
   * call with no values to allways process all values (default)
   *
   * @param ids Waveshaper id's to set as active
   *
   * @returns WaveShaper instance
   */
  setActive(...ids: string[]): WaveShaper {
    this._activeWaveShapers = ids;

    return this;
  }

  /**
   * @description Removes the waves and all callbacks with given id from the manager
   *
   * @param id
   *
   * @returns WaveShaper instance
   */
  clearTracks(...ids: string[]): WaveShaper {
    ids.forEach(id => {
      this.removeCallbacksById(id);
      this.tracks.delete(id);
    });

    return this;
  }

  /**
   * @description Gets Track with given id
   *
   * @param id
   * @returns Track with given ID
   */
  getTrack(id: string): Track | undefined {
    return this.tracks.get(id);
  }

  /**
   * Validates given options
   *
   * @param options
   * @returns true if valid, false if not
   */
  protected validateOptions(options: ManagerInput) {
    const currentOptions = this._options || defaultOptions;

    if (!options.samplesPerPixel || options.samplesPerPixel <= 0) {
      options.samplesPerPixel = currentOptions.samplesPerPixel;
    }
    if (!options.meterType) {
      options.meterType = currentOptions.meterType;
    }
    if (!options.resolution || options.resolution <= 0) {
      options.resolution = currentOptions.resolution;
    }
    if (!options.width || this.options.width <= 0) {
      options.width = currentOptions.width;
    }
    if (!options.scrollPosition || this.options.scrollPosition <= 0) {
      options.scrollPosition = currentOptions.scrollPosition;
    }
    if (!options.samplerate || this.options.samplerate <= 0) {
      options.samplerate = currentOptions.samplerate;
    }
  }

  /**
   * Invokes all registered callbacks registered to a waveshaper id in the data list
   *
   * @param options
   * @param data
   */
  protected invokeCallbacks(
    result: ProcessResult,
    start: number,
    width: number,
    shift: number
  ) {
    for (let i = 0; i < result.data.length; i++) {
      const trackResult = result.data[i];

      const callbacks = this.callbackMap.get(trackResult.id);
      if (callbacks == null) continue;

      for (let j = 0; j < callbacks.length; j++) {
        const callback = callbacks[j];
        callback(
          result.options,
          new Float32Array(trackResult.data),
          start,
          width,
          shift
        );
      }
    }
  }

  protected getProcessIds(ids: string[]): string[] {
    if (ids.length > 0) return ids;

    if (this._activeWaveShapers.length > 0) return this._activeWaveShapers;

    return Array.from(this.tracks.keys());
  }

  protected removeCallbacksById(id: string) {
    const callbackArray = this.callbackMap.get(id);
    if (callbackArray == null) return;

    callbackArray.splice(0, callbackArray.length);
    this.callbackMap.delete(id);
  }

  /**
   * @description Returns the maximum duration of all the waveshapers managed by this class
   *
   * @returns Maximum duration in seconds
   * @memberof WaveShaper
   */
  protected getDuration(): number {
    return Array.from(this.tracks.values()).reduce(
      (maxDuration, waveShaper) => {
        const duration = waveShaper.getDuration();
        return duration > maxDuration ? duration : maxDuration;
      },
      0
    );
  }
}
