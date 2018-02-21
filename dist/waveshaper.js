(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("hammerjs"));
	else if(typeof define === 'function' && define.amd)
		define(["hammerjs"], factory);
	else if(typeof exports === 'object')
		exports["WaveShaper"] = factory(require("hammerjs"));
	else
		root["WaveShaper"] = factory(root["Hammer"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
const waveshaper_1 = __webpack_require__(1);
const managerconfig_1 = __webpack_require__(7);
/**
 *
 *
 * @class
 * @export
 */
class WaveShapeManager {
    /**
     * @param {ManagerInput} [options=defaultOptions] Initial options
     * @throws {Error} Throws an error if samplerate is null or NaN
     * @constructor
     */
    constructor(options = managerconfig_1.default) {
        /**
         * Map of waveshapers managed by the manager
         *
         * @readonly
         * @memberof WaveShapeManager
         */
        this.waveShapers = new Map();
        /**
         * Map of audio data
         *
         * @readonly
         * @memberof WaveShapeManager
         */
        this.audioData = new Map();
        /**
         * @description Map of callback functions
         *
         * @readonly
         * @private
         * @memberof WaveShapeManager
         */
        this.callbackMap = new Map();
        if (!this.optionsValid(options)) {
            throw new Error(`Invalid options given: ${JSON.stringify(options)}`);
        }
        this._options = Object.assign({}, managerconfig_1.default, options);
    }
    /**
     * @description Currect settings
     *
     * @readonly
     * @memberof WaveShapeManager
     */
    get options() { return Object.assign({}, this._options); }
    /**
     * @description Last result of calling process, argument given to all callbacks
     *
     * @readonly
     * @memberof WaveShapeManager
     */
    get lastProcessResult() { return this._lastProcessResult; }
    /**
     * @description Total duration of all tracks
     *
     * @readonly
     * @memberof WaveShapeManager
     */
    get duration() { return this._duration; }
    /**
     * @description Merges the given options into the current and returns updated options
     *
     * @param options A (partial) ManagerOptions object
     * @returns A copy of the updated options
     */
    set(options) {
        if (!this.optionsValid(options)) {
            throw new Error(`Invalid options given: ${JSON.stringify(options)}`);
        }
        this._options = Object.assign({}, this.options, options);
        return this;
    }
    /**
     * Registers a callback that fires when the track with given id is processed
     *
     * @param id id of Track to register to
     * @param callBack will be invoked when the given track is processed
     */
    on(id, callBack) {
        let callbackArray = this.callbackMap.get(id);
        if (callbackArray == null) {
            this.callbackMap.set(id, [callBack]);
        }
        else {
            callbackArray.push(callBack);
        }
        ;
        return this;
    }
    /**
     * Unregisters a callback from the given track, will no longer be called
     *
     * @param id id of Track to unregister from
     * @param callBack callback to remove
     */
    off(id, callBack) {
        let callbackArray = this.callbackMap.get(id);
        if (callbackArray == null)
            return this;
        const index = callbackArray.indexOf(callBack);
        if (index < 0)
            return this;
        callbackArray = callbackArray.splice(index, 1);
        return this;
    }
    /**
     * The given id's are set as the active waveshapers, process only processes these when set,
     * call with no values to allways process all values (default)
     *
     * @param ids Waveshaper id's to set as active
     */
    setActive(...ids) {
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
    setTracks(...tracks) {
        tracks.forEach(track => {
            const foundWave = this.getTrack(track.id);
            if (foundWave == null) {
                const wave = new waveshaper_1.default(track.id, track.segments);
                this.waveShapers.set(track.id, wave);
            }
            else {
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
    removeTracks(...ids) {
        ids.forEach(id => {
            this.removeCallbacksById(id);
            this.waveShapers.delete(id);
        });
        return this;
    }
    getTrack(id) {
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
    addData(...data) {
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
    flatten(...ids) {
        this.getProcessIds(...ids).forEach(id => {
            const waveShaper = this.getTrack(id);
            if (waveShaper != null)
                waveShaper.flatten();
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
    process(...ids) {
        const toProcess = this.getProcessIds(...ids);
        const options = Object.assign({}, this.options);
        const data = [];
        for (let i = 0; i < toProcess.length; i++) {
            const id = toProcess[i];
            const wave = this.getTrack(id);
            if (wave == null)
                continue;
            const peaks = wave.calculate(options, this.audioData);
            data.push({ id, peaks });
        }
        // Invoke callbacks after returning value.
        this._lastProcessResult = { options, data };
        this.invokeCallbacks(this._lastProcessResult);
        return this;
    }
    optionsValid(options) {
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
    invokeCallbacks(result) {
        for (let i = 0; i < result.data.length; i++) {
            const trackResult = result.data[i];
            const callbacks = this.callbackMap.get(trackResult.id);
            if (callbacks == null)
                continue;
            for (let j = 0; j < callbacks.length; j++) {
                const callback = callbacks[j];
                callback(result.options, new Float32Array(trackResult.peaks));
            }
        }
    }
    getProcessIds(...ids) {
        if (ids.length > 0)
            return ids;
        if (this.activeWaveShapers && this.activeWaveShapers.length > 0)
            return this.activeWaveShapers;
        return Array.from(this.waveShapers.keys());
    }
    removeCallbacksById(id) {
        const callbackArray = this.callbackMap.get(id);
        if (callbackArray == null)
            return;
        callbackArray.splice(0, callbackArray.length);
        this.callbackMap.delete(id);
    }
    /**
     * @description Returns the maximum duration of all the waveshapers managed by this class
     *
     * @returns Maximum duration in seconds
     * @memberof WaveShapeManager
     */
    getDuration() {
        return Array.from(this.waveShapers.values()).reduce((maxDuration, waveShaper) => {
            const duration = waveShaper.getDuration();
            return duration > maxDuration ? duration : maxDuration;
        }, 0);
    }
}
exports.default = WaveShapeManager;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
const peak_1 = __webpack_require__(4);
const rms_1 = __webpack_require__(5);
const flatten_1 = __webpack_require__(6);
class WaveShaper {
    constructor(id, segments) {
        this.id = id;
        this.segments = segments;
        this.flatten();
    }
    flatten() {
        this.flattened = flatten_1.default(this.segments);
    }
    /**
     * Gets the duration of the audio in seconds
     *
     * @returns {number} Decimal value of total duration in seconds
     */
    getDuration() {
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
    calculate(options, dataMap) {
        switch (options.meterType) {
            case 'rms':
                return rms_1.default(options, this.flattened, dataMap);
            default:
                return peak_1.default(options, this.flattened, dataMap);
        }
    }
}
exports.default = WaveShaper;


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
const manager_1 = __webpack_require__(0);
exports.WaveShapeManager = manager_1.default;
const waveshaper_1 = __webpack_require__(1);
exports.WaveShaper = waveshaper_1.default;
const dom_1 = __webpack_require__(8);
exports.addInteraction = dom_1.addInteraction;
exports.DomRenderWaveShapeManager = dom_1.DomRenderWaveShapeManager;


/***/ }),
/* 4 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Calculates peak values
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
exports.default = (options, intervals, dataMap) => {
    const sampleSize = Math.ceil(options.samplesPerPixel / options.resolution);
    const start = options.scrollPosition * options.samplesPerPixel;
    const startSecond = start / options.samplerate;
    const secondsPerPixel = options.samplesPerPixel / options.samplerate;
    const peaks = new Float32Array(options.width * 4);
    // For each pixel we display
    for (let i = 0; i < options.width; i++) {
        const index = i * 4;
        let max = 0;
        let min = 0;
        const currentSecond = startSecond + ((i * options.samplesPerPixel) / options.samplerate);
        let currentInterval;
        for (let i = 0; i < intervals.length; i++) {
            const interval = intervals[i];
            if (interval.start <= currentSecond && interval.end >= currentSecond) {
                currentInterval = interval;
                break;
            }
        }
        if (currentInterval == null) {
            peaks.set([0, 0, 0, 0], index);
            continue;
        }
        let intervalBorder = 0;
        if (currentSecond + secondsPerPixel > currentInterval.end
            || currentSecond - secondsPerPixel < currentInterval.start) {
            intervalBorder = 1;
        }
        const buffer = dataMap.get(currentInterval.source);
        if (buffer == null) {
            peaks.set([0, 0, intervalBorder, 1], index);
            continue;
        }
        const offsetStart = currentInterval.start - currentInterval.originalStart;
        const secondsIntoInterval = currentSecond - currentInterval.start;
        const startSample = Math.floor(((secondsIntoInterval + offsetStart) * options.samplerate));
        const endSample = startSample + options.samplesPerPixel;
        const length = buffer.length;
        const loopEnd = length < endSample ? length : endSample;
        // Cycle through the data-points relevant to the pixel
        // Don't cycle through more than sampleSize frames per pixel.
        for (let j = startSample; j < loopEnd; j += sampleSize) {
            const sample = buffer[j];
            // Keep track of positive and negative values separately
            if (sample > max)
                max = sample;
            else if (sample < min)
                min = sample;
        }
        peaks.set([min, max, intervalBorder, 1], index);
    }
    return peaks;
};


/***/ }),
/* 5 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
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
exports.default = (options, intervals, dataMap) => {
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
        for (let i = 0; i < intervals.length; i++) {
            const s = intervals[i];
            if (s.start <= currentSecond && s.end >= currentSecond) {
                interval = s;
                break;
            }
        }
        if (interval == null) {
            peaks.set([0, 0, 0, 0], index);
            continue;
        }
        let intervalBorder = 0;
        if (currentSecond + secondsPerPixel > interval.end
            || currentSecond - secondsPerPixel < interval.start) {
            intervalBorder = 1;
        }
        const buffer = dataMap.get(interval.source);
        if (buffer == null) {
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
            }
            else {
                negSum += val * val;
            }
        }
        const samples = Math.min(options.samplesPerPixel / 2, Math.round(options.resolution / 2));
        const min = -Math.sqrt(negSum / samples);
        const max = Math.sqrt(posSum / samples);
        peaks.set([min, max, intervalBorder, 1], index);
    }
    return peaks;
};


/***/ }),
/* 6 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The algorithm first calculates real start and end times of each segment,
 * sorts them by priority, then start time.
 *
 * Finally it merges the segments by index so there are no overlapping
 * segments and those with highest index are on top.
 *
 * @export
 * @param {Segment[]} segments
 * @returns {Interval[]}
 */
exports.default = (segments) => {
    var normalized = exports.normalizeIndex(segments);
    var intervals = exports.mapToIntervals(normalized);
    var sorted = exports.sort(intervals);
    var grouped = exports.groupByIndex(sorted);
    return exports.weightedMerge(grouped);
};
/**
 * When an element is altered the index is set very high,
 * this functions normalizes to indexes back to 0
 *
 * @param {Segment[]} segments
 */
exports.normalizeIndex = (segments) => {
    let index = 0;
    let preNormalizeIndex = Number.MIN_SAFE_INTEGER;
    segments.sort((a, b) => exports.cmp(a.index, b.index)).forEach(el => {
        if (el.index > preNormalizeIndex) {
            preNormalizeIndex = el.index;
            el.index = ++index;
        }
        else {
            el.index = index;
        }
    });
    return segments;
};
/**
 * In order to preserve the original segments and allow for extra properties
 * the segments are mapped to Intervals
 *
 * @param {Segment[]} segments
 * @returns {Interval[]}
 */
exports.mapToIntervals = (segments) => {
    return segments.map(s => {
        return {
            id: s.id,
            start: s.start + s.offsetStart,
            end: s.start + s.duration - s.offsetEnd,
            index: s.index,
            originalStart: s.start,
            source: s.source
        };
    });
};
/**
 * Sorts the intervals by index, then by start
 *
 * @param {Interval[]} intervals
 * @return {Interval[]}
 */
exports.sort = (intervals) => {
    intervals.sort((a, b) => {
        return exports.cmp(a.index, b.index) || exports.cmp(a.start, b.start);
    });
    return intervals;
};
/**
 * Returns a map of intervals grouped by the key property
 *
 * @param {Interval[]} intervals
 * @param {string} key
 *
 * @returns {{[key: string] : Interval[]}}
 */
exports.groupByIndex = (intervals) => {
    return intervals.reduce((groups, interval) => {
        (groups[interval.index] = groups[interval.index] || []).push(interval);
        return groups;
    }, {});
};
/**
 * Merges all the groups by index
 *
 * @param {IntervalMap} grouped
 * @returns {Interval[]}
 */
exports.weightedMerge = (grouped) => {
    /** @type {Interval[]} */
    let flattened = null;
    for (let index of Object.keys(grouped)) {
        exports.merge(grouped[index]);
        if (flattened == null) {
            flattened = grouped[index];
        }
        else {
            flattened = exports.combine(grouped[index], flattened);
        }
    }
    return flattened;
};
/**
 * Merges a set of intervals with the same index that are
 * completely overlapped by another
 *
 * @param {Interval[]} intervals
 * @returns {Interval[]}
 */
exports.merge = (intervals) => {
    if (intervals == null || intervals.length <= 1)
        return intervals;
    const result = [];
    let prev = intervals[0];
    for (let i = 1; i < intervals.length; i++) {
        const curr = intervals[i];
        // Sanity check
        if (curr.start < prev.start || curr.index != prev.index) {
            throw Error('Interval must be sorted at this point.');
        }
        if (prev.end >= curr.end) {
            // merged case
            const merged = Object.assign({}, prev, { end: Math.max(prev.end, curr.end) });
            prev = merged;
        }
        else {
            result.push(prev);
            prev = curr;
        }
    }
    result.push(prev);
    return result;
};
/**
 * Given two sets of intervals it merges them so the highIndexes set has priority
 *
 * @param {Interval[]} highIndexes
 * @param {Interval[]} lowIndexes
 *
 * @returns {Interval[]}
 */
exports.combine = (highIndexes, lowIndexes) => {
    let highCount = 0;
    let lowCount = 0;
    const merged = [];
    while (highCount < highIndexes.length || lowCount < lowIndexes.length) {
        // Only low priority left so push it on the stack
        if (highCount === highIndexes.length) {
            merged.push(Object.assign({}, lowIndexes[lowCount]));
            lowCount++;
            // Only high priority left so push it on the stack
        }
        else if (lowCount === lowIndexes.length) {
            merged.push(Object.assign(highIndexes[highCount]));
            highCount++;
            // if high priority starts first
        }
        else if (highIndexes[highCount].start <= lowIndexes[lowCount].start) {
            lowIndexes[lowCount].start = Math.max(lowIndexes[lowCount].start, highIndexes[highCount].end);
            if (lowIndexes[lowCount].start >= lowIndexes[lowCount].end) {
                lowCount++;
            }
            merged.push(Object.assign({}, highIndexes[highCount]));
            highCount++;
        }
        else if (highIndexes[highCount].start >= lowIndexes[lowCount].start) {
            // end point of weak interval before the start of the strong
            if (lowIndexes[lowCount].end <= highIndexes[highCount].start) {
                merged.push(Object.assign({}, lowIndexes[lowCount]));
                lowCount++;
            }
            else if (highIndexes[highCount].start <= lowIndexes[lowCount].end && lowIndexes[lowCount].end <= highIndexes[highCount].end) {
                lowIndexes[lowCount].end = highIndexes[highCount].start;
                merged.push(Object.assign({}, lowIndexes[lowCount]));
                lowCount++;
            }
            else if (lowIndexes[lowCount].end >= highIndexes[highCount].end) {
                merged.push(Object.assign({}, lowIndexes[lowCount], {
                    end: highIndexes[highCount].start
                }));
                lowIndexes[lowCount].start = highIndexes[highCount].end;
            }
        }
    }
    return merged;
};
/**
 *
 * @param {number} a
 * @param {number} b
 */
exports.cmp = (a, b) => {
    if (a > b)
        return +1;
    if (a < b)
        return -1;
    return 0;
};


/***/ }),
/* 7 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const defaultOptions = {
    scrollPosition: 0,
    samplesPerPixel: 1024,
    resolution: 10,
    meterType: 'rms',
    mode: 'pan',
    width: 300,
    height: 150,
    generateId: () => Math.random.toString(),
    samplerate: 44100
};
exports.default = defaultOptions;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
const manager_1 = __webpack_require__(0);
const Hammer = __webpack_require__(2);
const hammerconfig_1 = __webpack_require__(9);
const cut_1 = __webpack_require__(10);
const drag_1 = __webpack_require__(11);
const pan_1 = __webpack_require__(12);
const zoom_1 = __webpack_require__(13);
const resize_1 = __webpack_require__(14);
const line_1 = __webpack_require__(15);
/**
 * @description Sets up touch and mouse interaction with the canvasses. When using this
 * you should use the registerCanvas method as it ensures the canvasses have the correct
 * classes and attributes.
 *
 * @param manager
 * @param container
 */
exports.addInteraction = (manager) => {
    const hammer = new Hammer(window.document.body, hammerconfig_1.default);
    drag_1.default(manager, hammer, window.document.body);
    cut_1.default(manager, hammer);
    pan_1.default(manager, hammer);
    zoom_1.default(manager, hammer);
    resize_1.default(manager, hammer);
};
/**
 * Extends WaveShapeManager to allow for easy canvas rendering registration.
 *
 * @inheritDoc
 */
class DomRenderWaveShapeManager extends manager_1.default {
    /**
     * @description When a canvas is registered through this method each time the
     * waveform is updated the canvas will be rerendered.
     *
     * It returns an unregister method, call to stop receiving callbacks.
     *
     * @param id WaveShaper id to register to.
     * @param canvas Canvas to render to
     * @param color Background color of segments
     */
    registerCanvas(id, canvas, color) {
        const ctx = canvas.getContext('2d');
        if (ctx == null)
            throw Error('Cannot get context from canvas.');
        // Add classes and data attributes
        canvas.classList.add('waveshaper');
        canvas.setAttribute('data-wave-id', id);
        canvas.style.width = this.options.width + 'px';
        canvas.style.height = this.options.height + 'px';
        const scale = (devicePixelRatio || 1) < 1 ? 1 : (devicePixelRatio || 1);
        canvas.width = this.options.width * scale;
        canvas.height = this.options.height;
        ctx.scale(scale, 1);
        const callBack = (options, data) => line_1.default(data, options, ctx, color);
        this.on(id, callBack);
        return () => this.off(id, callBack);
    }
    /**
     * Gets the duration of the audio as a date
     *
     * @returns Date containing audio length
     * @memberof WaveShapeManager
     */
    getDurationAsDate() {
        var date = new Date(0);
        date.setTime(this._duration * 1000);
        return date;
    }
    /**
     * @description Gets the width of scrollbar needed to scroll through the entire audio file
     *
     * @returns Scroll width in pixels for the entire audio file
     * @memberof WaveShapeManager
     */
    getScrollWidth() {
        return (this._duration * this._options.samplerate) / this._options.samplesPerPixel;
    }
}
exports.DomRenderWaveShapeManager = DomRenderWaveShapeManager;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
const Hammer = __webpack_require__(2);
const hammerOptions = {
    touchAction: 'pan-y',
    recognizers: [
        [Hammer.Pan, { direction: Hammer.DIRECTION_HORIZONTAL }],
        [Hammer.Pinch, { enable: true }],
        [Hammer.Tap]
    ]
};
exports.default = hammerOptions;


/***/ }),
/* 10 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Adds drag functionality to waveshaper
 *
 * @param {WaveShapeManager} manager
 * @param {HammerManager} hammer
 */
exports.default = (manager, hammer) => {
    const shouldHandle = (ev, options) => options.mode === 'cut' && ev.target.hasAttribute('data-wave-id');
    hammer.on('tap', (ev) => {
        const options = manager.options;
        if (options == null || !shouldHandle(ev, options))
            return;
        ev.srcEvent.stopPropagation();
        const id = ev.target.getAttribute('data-wave-id');
        if (id == null)
            return;
        const wave = manager.getTrack(id);
        if (wave == null)
            return;
        const bb = ev.target.getBoundingClientRect();
        const time = (options.scrollPosition + (ev.center.x - bb.left)) * options.samplesPerPixel / options.samplerate;
        const interval = wave.flattened.find(i => i.start <= time && i.end >= time);
        if (interval == null)
            return;
        const segment = wave.segments.find(s => s.id === interval.id);
        if (segment == null)
            return;
        const cutTime = time - segment.start;
        const newSegment = Object.assign({}, segment);
        newSegment.offsetStart = cutTime;
        newSegment.id = options.generateId();
        segment.offsetEnd = segment.duration - cutTime;
        wave.segments.push(newSegment);
        manager.flatten(wave.id);
        manager.process(wave.id);
    });
};


/***/ }),
/* 11 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const dragState = {
    activeSegment: null,
    activeSegmentStart: 0,
    dragWave: null,
    options: null
};
/**
 * Adds drag functionality to waveshaper
 *
 * @param {WaveShapeManager} manager Waveshape Manager
 * @param {HammerManager} hammer Hammer instance
 * @param {HTMLElement} container Container element
 */
exports.default = (manager, hammer, container) => {
    const shouldHandle = (ev, options) => options.mode === 'drag' && ev.target.hasAttribute('data-wave-id');
    /**
     * Fires when the mouse moves over the container,
     * If a segment is being dragged and the pointer moves
     * into another canvas the segment is tranfered to the
     * new canvas.
     */
    if (isTouchDevice()) {
        container.addEventListener('touchmove', ev => mouseHover(ev));
    }
    else {
        container.addEventListener('mousemove', ev => mouseHover(ev));
    }
    /**
     * Sets up the drag by finding the
     */
    hammer.on('panstart', (ev) => {
        const options = manager.options;
        if (options == null || !shouldHandle(ev, options))
            return;
        ev.srcEvent.stopPropagation();
        const id = ev.target.getAttribute('data-wave-id');
        if (id == null)
            return;
        const wave = manager.getTrack(id);
        if (wave == null)
            return;
        const bb = ev.target.getBoundingClientRect();
        const time = (options.scrollPosition + (ev.center.x - bb.left)) * (options.samplesPerPixel / options.samplerate);
        const interval = wave.flattened.find(i => i.start <= time && i.end >= time);
        if (interval == null)
            return;
        const segment = wave.segments.find(s => s.id === interval.id);
        if (segment == null)
            return;
        dragState.options = options;
        dragState.activeSegment = segment;
        dragState.activeSegmentStart = dragState.activeSegment.start;
        dragState.activeSegment.index = 1000;
        dragState.dragWave = wave;
    });
    hammer.on('panmove', (ev) => {
        if (dragState.options == null || !shouldHandle(ev, dragState.options))
            return;
        ev.srcEvent.stopPropagation();
        if (dragState.activeSegment == null || dragState.dragWave == null)
            return;
        // If the target has moved it is handled by the mouse/touch move manager
        const id = ev.target.getAttribute('data-wave-id');
        if (id !== dragState.dragWave.id)
            return;
        const change = (ev.deltaX * dragState.options.samplesPerPixel) / dragState.options.samplerate;
        let newTime = dragState.activeSegmentStart + change;
        if (newTime + dragState.activeSegment.offsetStart < 0) {
            newTime = -dragState.activeSegment.offsetStart;
        }
        dragState.activeSegment.start = newTime;
        manager.flatten(dragState.dragWave.id);
        manager.process(dragState.dragWave.id);
    });
    hammer.on('panend', (ev) => {
        if (dragState.options == null || !shouldHandle(ev, dragState.options))
            return;
        ev.srcEvent.stopPropagation();
        dragState.activeSegment = null;
        dragState.activeSegmentStart = 0;
        dragState.dragWave = null;
        dragState.options = null;
    });
    const mouseHover = (ev) => {
        if (dragState.options == null || dragState.options.mode !== 'drag')
            return;
        ev.stopPropagation();
        if (dragState.activeSegment == null || dragState.dragWave == null)
            return;
        const canvas = getTouchMouseTargetElement(ev);
        if (canvas == null || !(canvas instanceof HTMLCanvasElement))
            return;
        const id = canvas.getAttribute('data-wave-id');
        if (id == null)
            return;
        const wave = manager.getTrack(id);
        if (wave == null)
            return;
        if (dragState.dragWave.id !== id) {
            const index = dragState.dragWave.segments.indexOf(dragState.activeSegment);
            dragState.dragWave.segments.splice(index, 1);
            wave.segments.push(dragState.activeSegment);
            dragState.activeSegment.index = 1000;
            manager.flatten(wave.id, dragState.dragWave.id);
            manager.process(wave.id, dragState.dragWave.id);
            dragState.dragWave = wave;
        }
    };
    /**
     * Gets the actual target from a pointer event
     * @param {TouchEvent | MouseEvent} ev
     */
    const getTouchMouseTargetElement = (ev) => {
        if (ev instanceof TouchEvent) {
            /** @type {TouchEvent} */
            const touch = ev;
            return document.elementFromPoint(touch.touches[0].pageX, touch.touches[0].pageY);
        }
        return ev.target;
    };
    function isTouchDevice() {
        return 'ontouchstart' in window // works on most browsers 
            || navigator.maxTouchPoints; // works on IE10/11 and Surface
    }
    ;
};


/***/ }),
/* 12 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const endMargin = 500;
const panState = {
    panStart: 0,
    panMax: 0,
    options: null
};
/**
 * Adds pan functionality to waveshaper
 *
 * @param {WaveShapeManager} manager
 * @param {HammerManager} hammer
 */
function default_1(manager, hammer) {
    const shouldHandle = (ev, options) => options.mode === 'pan' && ev.target.hasAttribute('data-wave-id');
    hammer.on('panstart', (ev) => {
        const options = manager.options;
        if (!shouldHandle(ev, options))
            return;
        ev.srcEvent.stopPropagation();
        panState.options = options;
        panState.panMax = manager.getScrollWidth() + endMargin;
        panState.panStart = options.scrollPosition;
    });
    hammer.on('panmove', (ev) => {
        panState.options = manager.options;
        if (panState.options == null || !shouldHandle(ev, panState.options))
            return;
        ev.srcEvent.stopPropagation();
        const position = panState.panStart - ev.deltaX;
        const newPosition = position > 0 ? position : 0;
        // If it was and is still 0 no need to update
        if (newPosition === panState.options.scrollPosition)
            return;
        if (position > panState.panMax - panState.options.width)
            return;
        manager.set({ scrollPosition: newPosition }).process();
    });
    hammer.on('panend', (ev) => {
        if (panState.options == null || !shouldHandle(ev, panState.options))
            return;
        ev.srcEvent.stopPropagation();
        panState.options = null;
        panState.panStart = 0;
        panState.panMax = 0;
    });
}
exports.default = default_1;


/***/ }),
/* 13 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const endMargin = 500;
const zoomState = {
    maxWidth: 0,
    sppStart: 0,
    options: null
};
/**
 * Adds pinch zoom functionality to waveshaper
 *
 * @param {WaveShapeManager} manager
 * @param {HammerManager} hammer
 */
function default_1(manager, hammer) {
    const shouldHandle = (ev, options) => options.mode === 'pan' && ev.target.hasAttribute('data-wave-id');
    hammer.on('pinchstart', (ev) => {
        const options = manager.options;
        if (!shouldHandle(ev, options))
            return;
        ev.srcEvent.stopPropagation();
        zoomState.options = options;
        zoomState.sppStart = options.samplesPerPixel;
        zoomState.maxWidth = manager.getScrollWidth() + endMargin;
    });
    hammer.on('pinchmove', (ev) => {
        zoomState.options = manager.options;
        if (zoomState.options == null || !shouldHandle(ev, zoomState.options))
            return;
        ev.srcEvent.stopPropagation();
        const options = manager.options;
        const sampleAtLeft = options.scrollPosition * options.samplesPerPixel;
        const samplesInView = options.width * options.samplesPerPixel;
        const samplesToCenter = samplesInView / 2;
        const newSpp = zoomState.sppStart * ev.scale;
        const newSamplesInView = options.width * newSpp;
        const newSamplesToCenter = newSamplesInView / 2;
        const maxWidth = manager.getScrollWidth() + endMargin;
        const maxSamplesInView = maxWidth * options.samplerate;
        if (newSamplesInView >= maxSamplesInView)
            return;
        const newScroll = (sampleAtLeft + samplesToCenter - newSamplesToCenter) / newSpp;
        manager.set({
            samplesPerPixel: newSpp,
            scrollPosition: newScroll >= 0 ? newScroll : 0
        }).process();
    });
    hammer.on('pinchend', (ev) => {
        if (zoomState.options == null || !shouldHandle(ev, zoomState.options))
            return;
        ev.srcEvent.stopPropagation();
        zoomState.sppStart = 0;
        zoomState.maxWidth = 0;
        zoomState.options = null;
    });
}
exports.default = default_1;


/***/ }),
/* 14 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const resizeState = {
    activeSegment: null,
    activeSegmentSide: null,
    activeSegmentOffsetStart: 0,
    activeSegmentOffsetEnd: 0,
    dragWave: null,
    options: null
};
/**
 * Adds drag functionality to waveshaper
 *
 * @param {WaveShapeManager} manager
 * @param {HammerManager} hammer
 */
function default_1(manager, hammer) {
    const shouldHandle = (ev, options) => options.mode === 'resize' && ev != null && ev.target.hasAttribute('data-wave-id');
    hammer.on('panstart', (ev) => {
        const options = manager.options;
        if (!shouldHandle(ev, options))
            return;
        ev.srcEvent.stopPropagation();
        const id = ev.target.getAttribute('data-wave-id');
        if (id == null)
            return;
        const wave = manager.getTrack(id);
        if (wave == null)
            return;
        const bb = ev.target.getBoundingClientRect();
        const time = (options.scrollPosition + (ev.center.x - bb.left)) * options.samplesPerPixel / options.samplerate;
        const interval = wave.flattened.find(i => i.start <= time && i.end >= time);
        if (interval == null)
            return;
        resizeState.activeSegmentSide =
            time < interval.start + ((interval.end - interval.start) / 2) ?
                'left' :
                'right';
        const segment = wave.segments.find(s => s.id === interval.id);
        if (segment == null)
            return;
        resizeState.options = options;
        resizeState.activeSegment = segment;
        resizeState.activeSegmentOffsetStart = segment.offsetStart;
        resizeState.activeSegmentOffsetEnd = segment.offsetEnd;
        segment.index = 1000;
        resizeState.dragWave = wave;
    });
    hammer.on('panmove', (ev) => {
        if (resizeState.dragWave == null || resizeState.options == null || !shouldHandle(ev, resizeState.options))
            return;
        ev.srcEvent.stopPropagation();
        const options = manager.options;
        if (resizeState.activeSegment == null)
            return;
        const change = (ev.deltaX * options.samplesPerPixel) / options.samplerate;
        let newTime = resizeState.activeSegmentSide === 'left' ?
            resizeState.activeSegmentOffsetStart + change :
            resizeState.activeSegmentOffsetEnd - change;
        // Don't allow offset to become less than 0
        if (newTime < 0) {
            newTime = 0;
        }
        const active = resizeState.activeSegment;
        const newDuration = resizeState.activeSegmentSide === 'left' ?
            (active.start + active.duration) - active.start - newTime - active.offsetEnd :
            (active.start + active.duration) - active.start - active.offsetStart - newTime;
        // Do not allow resizing 
        if (newDuration <= 2) {
            return;
        }
        resizeState.activeSegmentSide === 'left' ?
            active.offsetStart = newTime :
            active.offsetEnd = newTime;
        manager.flatten(resizeState.dragWave.id);
        manager.process(resizeState.dragWave.id);
    });
    hammer.on('panend', (ev) => {
        if (resizeState.options == null || !shouldHandle(ev, resizeState.options))
            return;
        ev.srcEvent.stopPropagation();
        resizeState.activeSegment = null;
        resizeState.activeSegmentOffsetStart = 0;
        resizeState.activeSegmentOffsetEnd = 0;
        resizeState.activeSegmentSide = null;
        resizeState.dragWave = null;
        resizeState.options = null;
    });
}
exports.default = default_1;


/***/ }),
/* 15 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 *
 * @export
 * @param {number[][]} waveform Sampled data for each pixel, max at 0, min at 1
 * @param {number} height
 * @param {number} width
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} drawStyle
 * @param {string} color
 */
exports.default = (waveform, options, ctx, color) => {
    const scale = options.height / 2;
    const width = options.width;
    ctx.fillStyle = color;
    ctx.strokeStyle = 'black';
    ctx.clearRect(0, 0, width, options.height);
    for (let i = 0, inSegment = false, segmentStart = 0; i < width; i++) {
        const index = i * 4;
        const pointInSegment = waveform[index + 3] === 1;
        if (!inSegment && pointInSegment) {
            inSegment = true;
            segmentStart = i;
        }
        else if (inSegment && (!pointInSegment || i === width - 1)) {
            inSegment = false;
            ctx.fillRect(segmentStart, 0, i - segmentStart, options.height);
        }
    }
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(0, scale);
    for (let i = 0; i < width; i++) {
        const index = i * 4;
        ctx.lineTo(i, Math.round((waveform[index] * scale) + scale));
    }
    ctx.lineTo(width - 1, scale);
    ctx.moveTo(0, scale);
    for (let i = 0; i < width; i++) {
        const index = i * 4;
        ctx.lineTo(i, Math.round((waveform[index + 1] * scale) + scale));
    }
    ctx.lineTo(width - 1, scale);
    ctx.closePath();
    for (let i = 0; i < width; i++) {
        const index = i * 4;
        if (i != 0 && waveform[index - 4 + 2] === 0 && waveform[index + 2] === 1) {
            ctx.rect(i - 1, 0, 1, options.height);
        }
    }
    ctx.fill();
};


/***/ })
/******/ ]);
});
//# sourceMappingURL=waveshaper.js.map