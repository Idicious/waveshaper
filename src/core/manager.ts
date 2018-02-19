import WaveShaper from './waveshaper';
import Segment from '../models/segment';
import setupDrag from '../interaction/drag';
import setupResize from '../interaction/resize';
import setupCut from '../interaction/cut';
import setupPan from '../interaction/pan';
import setupZoom from '../interaction/zoom';
import * as Hammer from 'hammerjs';
import hammerconfig from '../config/hammerconfig';
import defaultOptions, { ManagerOptions, InteractionMode, MeterType, GenerateId } from '../config/managerconfig';

/**
 * 
 * 
 * @class
 * @export
 */
export default class WaveShapeManager {

    /**
     * Map of waveshapers managed by the manager
     * 
     * @readonly
     * @memberof WaveShapeManager
     */
    public readonly waveShapers = new Map<string, WaveShaper>();

    /**
     * Map of audio data
     * 
     * @readonly
     * @memberof WaveShapeManager
     */
    public readonly audioData = new Map<string, Float32Array>();

    /**
     * @description Audio samplerate
     * 
     * @readonly
     * @memberof WaveShapeManager
     */
    public readonly samplerate: number;

    /**
     * @description Gesture recogniser
     * 
     * @memberof WaveShapeManager
     */
    public readonly hammer: HammerManager;

    /**
     * @description Width of draw area in pixels
     * 
     * @readonly
     * @memberof WaveShapeManager
     */
    public readonly width: number;

     /**
     * @description Height of draw area in pixels
     * 
     * @readonly
     * @memberof WaveShapeManager
     */
    public readonly height: number;


    /**
     * @description Sample range per pixel, zoom level
     * @example Lower value to zoom in, increase to zoom out
     * 
     * @memberof WaveShapeManager
     */
    public samplesPerPixel: number;

    /**
     * @description Sample size per pixel, determines accuracy
     * @example Lower value to decrease accuracy and increase performance
     * 
     * @memberof WaveShapeManager
     */
    public resolution: number;

    /**
     * @description Virtual scrolling is used, changing this value pans the waveform
     * @example Lower value to pan left, increase to pan right
     * 
     * @memberof WaveShapeManager
     */
    public scrollPosition: number;

    /**
     * @description Calculation method used to determine value of sample range
     * @example Peak get the peak values of the range, RMS is similar to average https://en.wikipedia.org/wiki/Root_mean_square
     * 
     * @memberof WaveShapeManager
     */
    public meterType: MeterType;

    /**
     * @description Active id's, redraws when draw is called without argument
     * 
     * @memberof WaveShapeManager
     */
    public activeWaveShapers: string[] | null;

    /**
     * @description Interaction mode of the the waveforms
     * 
     * @memberof WaveShapeManager
     */
    public mode: InteractionMode;

    /**
     * @description Method used to generate new id's
     * 
     * @memberof WaveShapeManager
     */
    public generateId: GenerateId;

    /**
     * @param {number} samplerate Audio samplerate
     * @param {HTMLElement} container Container element
     * @param {ManagerOptions} [options=defaultOptions] Initial options
     * @throws {Error} Throws an error if samplerate is null or NaN
     * @constructor 
     */
    constructor(samplerate: number, container: HTMLElement, options: ManagerOptions = defaultOptions) {
        if(samplerate == null || isNaN(samplerate)) {
            throw new Error('samplerate cannot be null and must be a number');
        }

        // Merge options and default options so ommited properties are set
        options = { ...defaultOptions, ...options };
        
        // Setup readonly properties
        this.samplerate = samplerate;
        this.width = options.width;
        this.height = options.height;
        
        // Setup variable properties
        this.resolution = options.resolution;
        this.samplesPerPixel = options.samplesPerPixel;
        this.scrollPosition = options.scrollPosition;
        this.meterType = options.meterType;
        this.mode = options.mode;
        this.generateId = options.generateId;

        //Setup interaction
        this.hammer = new Hammer(container, hammerconfig);

        setupDrag(this, this.hammer, container);
        setupResize(this, this.hammer);
        setupCut(this, this.hammer);
        setupPan(this, this.hammer);
        setupZoom(this, this.hammer);
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
    addWaveShaper(id: string, segments: Segment[], color: string): WaveShaper {
        const foundWave = this.waveShapers.get('id');
        if(foundWave == null) {
            const wave = new WaveShaper(id, segments, this.width, this.height, color);
            this.waveShapers.set(id, wave);

            return wave;
        } 
        
        return foundWave;
    }

    getWaveShaper(id: string): WaveShaper | undefined {
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
    addAudioData(id: string, data: AudioBuffer) {
        if(!this.audioData.has(id)) {
            this.audioData.set(id, data.getChannelData(0));
            this.draw(this.activeWaveShapers, true);
        }
    }

    /**
     * @description Removes the wave with given id from the manager
     * 
     * @param id 
     * 
     * @memberof WaveShapeManager
     */
    removeWave(id: string) {
        this.waveShapers.delete(id);
    }

    /**
     * @description Flattens the segments of the given waveshaper id
     * 
     * @param id 
     * @memberof WaveShapeManager
     */
    flatten(ids: string[]) {
        for(let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const waveShaper = this.waveShapers.get(id)
            if(waveShaper != null) waveShaper.flatten();
        }
    }

    /**
     * @description Returns the maximum duration of all the waveshapers managed by this class
     * 
     * @returns Maximum duration in seconds
     * @memberof WaveShapeManager
     */
    getDuration(): number {
        var maxDuration = 0;
        for (var wave of Array.from(this.waveShapers.values())) {
            var duration = wave.getDuration();
            if (duration > maxDuration) {
                maxDuration = duration;
            }
        }
        return maxDuration;
    }

    /**
     * Gets the duration of the audio as a date
     * 
     * @returns Date containing audio length
     * @memberof WaveShapeManager
     */
    getDurationAsDate(): Date {
        var date = new Date(0);
        date.setTime(this.getDuration() * 1000);
        return date;
    }

    /**
     * @description Gets the width of scrollbar needed to scroll through the entire audio file
     * 
     * @returns Scroll width in pixels for the entire audio file
     * @memberof WaveShapeManager
     */
    getScrollWidth(): number {
        var maxWidth = 0;
        for (var wave of Array.from(this.waveShapers.values())) {
            const width = wave.getScrollWidth(this.samplesPerPixel, this.samplerate);
            if (width > maxWidth) {
                maxWidth = width;
            }
        }
    
        return maxWidth;
    }

    /**
     * Draws the waveform to the canvas with current settings, defaults to drawing all activeWaveShapers
     * 
     * @param ids Options array of id's to draw
     * @param forceDraw Force redraw of the given waves
     * 
     * @memberof WaveShapeManager
     */
    draw(ids: string[] | null, forceDraw: boolean) {
        const idsToDraw = ids == null ? this.activeWaveShapers == null ? Array.from(this.waveShapers.keys()) : this.activeWaveShapers : ids;
        for (var i = 0; i < idsToDraw.length; i++) {
            var wave = this.waveShapers.get(idsToDraw[i]);
            if(wave == null) continue;

            wave.calculate(
                this.meterType, 
                this.resolution, 
                this.samplesPerPixel, 
                this.scrollPosition,
                this.samplerate,
                forceDraw,
                this.audioData
            );
        }
    
        for (var i = 0; i < idsToDraw.length; i++) {
            var wave = this.waveShapers.get(idsToDraw[i]);
            if(wave == null) continue;

            wave.draw();
        }
    }
}