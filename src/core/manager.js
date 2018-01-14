import { WaveShaper } from './waveshaper';
import { Segment } from '../models/segment';
import { defaultOptions } from '../defaults';
import { setupDrag } from '../interaction/drag';
import { setupResize } from '../interaction/resize';
import { setupCut } from '../interaction/cut';
import { setupPan } from '../interaction/pan';

/**
 * 
 * @export
 */
export class WaveShapeManager {

    /**
     * Map of waveshapers managed by the manager
     * 
     * @type {Map<string, WaveShaper>}
     * @readonly
     * @memberof WaveShapeManager
     */
    get waveShapers(){ return this._waveShapers; }

    /**
     * 
     * @type {Map<string, AudioBuffer>}
     * @readonly
     * @memberof WaveShapeManager
     */
    get audioData() { return this._audioData; };

    /**
     * @description Audio samplerate
     * 
     * @returns {number}
     * @readonly
     * @memberof WaveShapeManager
     */
    get samplerate() { return this._samplerate; }

    /**
     * @description Sample range per pixel, zoom level
     * @example Lower value to zoom in, increase to zoom out
     * 
     * @param {number}
     * @returns {number}
     * @memberof WaveShapeManager
     */
    get samplesPerPixel() { return this._samplesPerPixel; }
    set samplesPerPixel(spp) { this._samplesPerPixel = spp; }

    /**
     * @description Sample size per pixel, determines accuracy
     * @example Lower value to decrease accuracy and increase performance
     * 
     * @param {number}
     * @returns {number}
     * @memberof WaveShapeManager
     */
    get resolution() { return this._resolution; }
    set resolution(res) { this._resolution = res; }

    /**
     * @description Virtual scrolling is used, changing this value pans the waveform
     * 
     * @param {number}
     * @returns {number}
     * @memberof WaveShapeManager
     */
    get scrollPosition() { return this._scrollPosition; }
    set scrollPosition(position) { this._scrollPosition = position; }

    /**
     * @description Draw style of waveform, either filled or stroked
     * 
     * @param {'stroke' | 'fill'}
     * @returns {'stroke' | 'fill'}
     * @memberof WaveShapeManager
     */
    get drawStyle() { return this._drawStyle; }
    set drawStyle(style) { this._drawStyle = style; }

    /**
     * @description Calculation method used to determine value of sample range
     * @example Peak get the peak values of the range, RMS is similar to average https://en.wikipedia.org/wiki/Root_mean_square
     * 
     * @param {'peak' | 'rms'}
     * @returns {'peak' | 'rms'}
     * @memberof WaveShapeManager
     */
    get meterType() { return this._meterType; }
    set meterType(type) { this._meterType = type; }

    /**
     * @description Active id's, redraws when draw is called without argument
     * @example Peak get the peak values of the range, RMS is similar to average https://en.wikipedia.org/wiki/Root_mean_square
     * 
     * @param {string[]}
     * @returns {string[]}
     * @memberof WaveShapeManager
     */
    get activeWaveShapers() { return this._activeWaveShapers; }
    set activeWaveShapers(active) { this._activeWaveShapers = active; }

    /**
     * @description Interaction mode of the the waveforms
     * 
     * @param {'pan' | 'drag' | 'cut' | 'resize'}
     * @returns {'pan' | 'drag' | 'cut' | 'resize'}
     * @memberof WaveShapeManager
     */
    get mode() { return this._mode; }
    set mode(mode) { this._mode = mode; }

    /**
     * @description Set at start of an interaction, null when interaction is complete
     * 
     * @param {Segment} segment Currently active segment
     * @returns {Segment}
     * @memberof WaveShapeManager
     */
    get activeSegment() { return this._activeSegment; }
    set activeSegment(segment) { this._activeSegment = segment; }

    /**
     * @description Set at start of an interaction, null when interaction is complete
     * 
     * @param {number} start Start time of Segment at beginning of interaction
     * @returns {number}
     * @memberof WaveShapeManager
     */
    get activeSegmentStart() { return this._activeSegmentStart; }
    set activeSegmentStart(start) { this._activeSegmentStart = start; }

    /**
     * @param {number} samplerate Audio samplerate
     * @param {HTMLElement} container
     * @param {defaultOptions} [options=defaultOptions] Initial options
     * @throws {Error} Throws an error if samplerate is null or NaN
     * @constructor 
     */
    constructor(samplerate, container, options = defaultOptions) {
        if(samplerate == null || isNaN(samplerate)) {
            throw new Error('samplerate cannot be null and must be a number');
        }

        this._waveShapers = new Map();
        this._audioData = new Map();
        
        this._samplerate = samplerate;
    
        this._resolution = options.resolution;
        this._samplesPerPixel = options.samplesPerPixel;
        this._scrollPosition = options.scrollPosition;
        this._drawStyle = options.drawStyle;
        this._meterType = options.meterType;
        this._mode = options.mode;
        this._container = container;

        /**
         * @type {string[]}
         */
        this._lastDraw = new Array();

        setupDrag(this, this._container);
        setupResize(this, this._container);
        setupCut(this, this._container);
        setupPan(this, this._container);
    }
    
    /**
     * @description Adds a waveshaper to the manager
     * 
     * @param {string} id
     * @param {HTMLCanvasElement | SVGElement} element Html draw element
     * @param {Segment[]} segments 
     * @memberof WaveShapeManager
     */
    addWave(id, element, segments) {
        if(!this.waveShapers.has(id)) {
            element.setAttribute('data-wave-id', id);
            const wave = new WaveShaper(id, element, segments);
            this.waveShapers.set(id, wave);
        }
    }

    /**
     * Adds audio data to the waveshaper and redraws waveshapers using it
     * 
     * @param {string} id 
     * @param {AudioBuffer} data 
     */
    addAudioData(id, data) {
        this.audioData.set(id, data);
        
        const ids = this._lastDraw.map(id => this.waveShapers.get(id))
            .filter(ws => ws.segments.some(s => s.data === id))
            .map(ws => ws.id);
        
        this.draw(ids, true);
    }

    /**
     * @description Removes the wave with given id from the manager
     * 
     * @param {string} id 
     * @memberof WaveShapeManager
     */
    removeWave(id) {
        this.waveShapers.delete(id);
    }

    /**
     * @description Flattens the segments of the given waveshaper id
     * 
     * @param {string} id 
     * @memberof WaveShapeManager
     */
    flatten(id) {
        this.waveShapers.get(id).flatten();
    }
}

/**
 * Gets the duration of the audio in seconds
 * 
 * @returns {number} Decimal value of total duration in seconds
 */
WaveShapeManager.prototype.getDuration = function () {
    var maxDuration = 0;
    for (var wave of this.waveShapers.values()) {
        var duration = wave.getDuration(this.samplesPerPixel);
        if (duration > maxDuration) {
            maxDuration = duration;
        }
    }
    return maxDuration;
}

/**
 * Gets the duration of the audio as a date
 * 
 * @returns {Date} Date containing audio length
 */
WaveShapeManager.prototype.getDurationAsDate = function () {
    var date = new Date(0);
    date.setTime(this.getDuration() * 1000);
    return date;
}

/**
 * Gets the width of scrollbar needed to scroll through the entire audio file
 * 
 * @returns {number} Scroll width in pixels for the entire audio file
 */
WaveShapeManager.prototype.getScrollWidth = function () {
    var maxWidth = 0;
    for (var wave of this.waveShapers.values()) {
        const width = wave.getScrollWidth(this.samplesPerPixel, this.samplerate);
        if (width > maxWidth) {
            maxWidth = width;
        }
    }

    return maxWidth;
}

/**
 * Draws the waveform to the canvas with current settings
 * 
 * @param {string[]} ids Options array of id's to draw
 * @param {boolean} forceDraw Force redraw of the given waves
 */
WaveShapeManager.prototype.draw = function (ids, forceDraw) {
    const idsToDraw = ids == null ? this.activeWaveShapers == null ? this.waveShapers.keys() : this.activeWaveShapers : ids;
    this._lastDraw = idsToDraw;
    for (var id of idsToDraw) {
        var wave = this.waveShapers.get(id);
        wave.calculate(
            this.meterType, 
            this.resolution, 
            this.samplesPerPixel, 
            this.scrollPosition,
            this.samplerate,
            forceDraw
        );
    }

    for (var id of idsToDraw) {
        var wave = this.waveShapers.get(id);
        wave.draw(this.drawStyle);
    }
}