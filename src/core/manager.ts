import WaveShaper from './waveshaper';
import Segment from '../models/segment';
import defaultOptions, { ManagerOptions, ManagerInput } from '../config/managerconfig';

export declare type WaveShaperCallback = (options: ManagerOptions, data: Float32Array) => void;
export declare type ProcessResult = { options: ManagerOptions, data: { id: string, peaks: Float32Array }[] };

/**
 * 
 * 
 * @export
 */
export default class WaveShapeManager {
    
    /**
     * Map of waveshapers managed by the manager
     * 
     * @readonly
     * @memberof WaveShapeManager
     */
    protected readonly waveShapers = new Map<string, WaveShaper>();

    /**
     * Map of audio data
     * 
     * @readonly
     * @memberof WaveShapeManager
     */
    protected readonly audioData = new Map<string, Float32Array>();
    
    /**
     * @description Active id's, redraws when draw is called without argument
     * 
     * @memberof WaveShapeManager
     */
    protected activeWaveShapers: string[] | null;

    /**
     * @description Map of callback functions
     * 
     * @readonly
     * @memberof WaveShapeManager
     */
    protected readonly callbackMap = new Map<string, WaveShaperCallback[]>();
    
    /**
     * @description Currect settings
     * 
     * @readonly
     * @memberof WaveShapeManager
     */
    public get options(): ManagerOptions { return {...this._options} }
    protected _options: ManagerOptions;

    
    /**
     * @description Last result of calling process, argument given to all callbacks
     * 
     * @readonly
     * @memberof WaveShapeManager
     */
    public get lastProcessResult(): ProcessResult | null { return this._lastProcessResult; }
    protected _lastProcessResult: ProcessResult | null

    
    /**
     * @description Total duration of all tracks
     * 
     * @readonly
     * @memberof WaveShapeManager
     */
    public get duration() { return this._duration; }
    protected _duration: number;

    /**
     * @param [options=defaultOptions] Initial options
     * @throws Throws an error if samplerate is null or NaN
     */
    constructor(options: ManagerInput = defaultOptions) {
        if(!this.optionsValid(options)) {
            throw new Error(`Invalid options given: ${JSON.stringify(options)}`);
        }

        this._options = { ...defaultOptions, ...options };
    }

    /**
     * @description Merges the given options into the current and returns updated options
     * 
     * @param options A (partial) ManagerOptions object
     * @returns A copy of the updated options
     */
    set(options: ManagerInput): WaveShapeManager {
        if(!this.optionsValid(options)) {
            throw new Error(`Invalid options given: ${JSON.stringify(options)}`);
        }

        this._options = { ...this.options, ...options };

        return this;
    }
    
    /**
     * Registers a callback that fires when the track with given id is processed
     * 
     * @param id id of Track to register to
     * @param callBack will be invoked when the given track is processed
     */
    on(id: string, callBack: WaveShaperCallback): WaveShapeManager {
        let callbackArray = this.callbackMap.get(id);
        if(callbackArray == null) {
            this.callbackMap.set(id, [callBack]);
        } else {
            callbackArray.push(callBack)
        }

        return this;
    }

    /**
     * Unregisters a callback from the given track, will no longer be called
     * 
     * @param id id of Track to unregister from
     * @param callBack callback to remove
     */
    off(id: string, callBack: WaveShaperCallback): WaveShapeManager {
        let callbackArray = this.callbackMap.get(id);
        if(callbackArray == null) return this;

        const index = callbackArray.indexOf(callBack);
        if(index < 0) return this;

        callbackArray = callbackArray.splice(index, 1);

        return this;
    }

    /**
     * The given id's are set as the active waveshapers, process only processes these when set,
     * call with no values to allways process all values (default)
     * 
     * @param ids Waveshaper id's to set as active
     */
    setActive(...ids: string[]): WaveShapeManager {
        this.activeWaveShapers = ids;

        return this;
    }
    
    /**
     * @description Adds a waveshaper to the manager
     * 
     * @param id id of WaveShaper
     * @param segments Segments in wave
     * @param color Background color of segments
     * 
     * @memberof WaveShapeManager
     */
    setTracks(...tracks: {id: string, segments: Segment[]}[]): WaveShapeManager {
        tracks.forEach(track => {
            const foundWave = this.getTrack(track.id);
            if(foundWave == null) {
                const wave = new WaveShaper(track.id, track.segments);
                this.waveShapers.set(track.id, wave);
            } else {
                foundWave.segments = track.segments;
                foundWave.flatten();
            }
        });
        this._duration = this.getDuration();
        return this;
    }

    /**
     * @description Removes the waves and all callbacks with given id from the manager
     * 
     * @param id 
     * 
     * @memberof WaveShapeManager
     */
    removeTracks(...ids: string[]): WaveShapeManager {
        ids.forEach(id => {
            this.removeCallbacksById(id);
            this.waveShapers.delete(id);
        });

        return this;
    }

    getTrack(id: string): WaveShaper | undefined {
        return this.waveShapers.get(id);
    }

    /**
     * @description Adds audio data to the waveshaper and redraws waveshapers using it
     * 
     * @param id  Data id, refered to by source parameter of segments
     * @param data AudioBuffer with audio data
     * 
     * @memberof WaveShapeManager
     */
    addData(...data: {id: string, data: AudioBuffer}[]) {
        data.forEach(d => {
            this.audioData.set(d.id, d.data.getChannelData(0));
        });
        
        return this;
    }

    /**
     * @description Flattens the segments of the given waveshaper id
     * 
     * @param id 
     * @memberof WaveShapeManager
     */
    flatten(...ids: string[]): WaveShapeManager {
        this.getProcessIds(...ids).forEach(id => {
            const waveShaper = this.getTrack(id);
            if(waveShaper != null) waveShaper.flatten();
        });

        return this;
    }

    /**
     * Processes all relevant WaveShapers and invokes registered callbacks
     * 
     * @param ids Options array of id's to draw
     * @param forceDraw Force redraw of the given waves
     * 
     * @memberof WaveShapeManager
     */
    process(...ids: string[]): WaveShapeManager {
        const toProcess = this.getProcessIds(...ids);
        const options: ManagerOptions = { ...this.options };

        const data: { id: string, peaks: Float32Array }[] = [];
        for(let i = 0; i < toProcess.length; i++) {
            const id = toProcess[i];

            const wave = this.getTrack(id);
            if(wave == null) continue;

            const peaks = wave.calculate(options, this.audioData);
            data.push({ id, peaks });
        }

        // Invoke callbacks after returning value.
        this._lastProcessResult = { options, data };
        this.invokeCallbacks(this._lastProcessResult);

        return this;
    }

    protected optionsValid(options: ManagerInput) {
        return (options.samplesPerPixel === undefined || options.samplesPerPixel > 0) &&
            (options.meterType === undefined || options.meterType) &&
            (options.resolution === undefined || options.resolution > 0) &&
            (options.width === undefined || options.width > 0) &&
            (options.scrollPosition === undefined || options.scrollPosition >= 0) &&
            (options.samplerate === undefined || options.samplerate > 0);
    }

    /**
     * Invokes all registered callbacks registered to a waveshaper id in the data list
     * 
     * @param options 
     * @param data 
     */
    protected invokeCallbacks(result: ProcessResult) {
        for(let i = 0; i < result.data.length; i++) {
            const trackResult = result.data[i];

            const callbacks = this.callbackMap.get(trackResult.id);
            if(callbacks == null) continue;

            for(let j = 0; j < callbacks.length; j++) {
                const callback = callbacks[j];
                callback(result.options, new Float32Array(trackResult.peaks));
            }
        }
    }

    protected getProcessIds(...ids: string[]) : string[] {
        if(ids.length > 0) 
            return ids;

        if(this.activeWaveShapers && this.activeWaveShapers.length > 0) 
            return this.activeWaveShapers;

        return Array.from(this.waveShapers.keys());
    }

    protected removeCallbacksById(id: string) {
        const callbackArray = this.callbackMap.get(id);
        if(callbackArray == null) return;

        callbackArray.splice(0, callbackArray.length);
        this.callbackMap.delete(id);
    }

    /**
     * @description Returns the maximum duration of all the waveshapers managed by this class
     * 
     * @returns Maximum duration in seconds
     * @memberof WaveShapeManager
     */
    protected getDuration(): number {
        return Array.from(this.waveShapers.values()).reduce((maxDuration, waveShaper) => {
            const duration = waveShaper.getDuration();
            return duration > maxDuration ? duration : maxDuration;
        }, 0);
    }
}