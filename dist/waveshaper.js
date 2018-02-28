(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("hammerjs"));
	else if(typeof define === 'function' && define.amd)
		define(["hammerjs"], factory);
	else if(typeof exports === 'object')
		exports["WS"] = factory(require("hammerjs"));
	else
		root["WS"] = factory(root["Hammer"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_6__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var track_1 = __webpack_require__(1);
var managerconfig_1 = __webpack_require__(5);
/**
 *
 *
 * @export
 */
var WaveShaper = /** @class */ (function () {
    /**
     * @param [options=defaultOptions] Initial options
     * @throws Throws an error if samplerate is null or NaN
     */
    function WaveShaper(options) {
        if (options === void 0) { options = managerconfig_1.default; }
        /**
         * Map of waveshapers managed by the manager
         *
         * @readonly
         * @memberof WaveShaper
         */
        this.tracks = new Map();
        /**
         * Map of audio data
         *
         * @readonly
         * @memberof WaveShaper
         */
        this.audioData = new Map();
        /**
         * @description Map of callback functions
         *
         * @readonly
         * @memberof WaveShaper
         */
        this.callbackMap = new Map();
        if (!this.optionsValid(options)) {
            throw new Error("Invalid options given: " + JSON.stringify(options));
        }
        this._options = __assign({}, managerconfig_1.default, options);
    }
    Object.defineProperty(WaveShaper.prototype, "options", {
        /**
         * @description Currect settings
         *
         * @readonly
         * @memberof WaveShaper
         */
        get: function () { return __assign({}, this._options); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WaveShaper.prototype, "lastProcessResult", {
        /**
         * @description Last result of calling process, argument given to all callbacks
         *
         * @readonly
         * @memberof WaveShaper
         */
        get: function () { return this._lastProcessResult; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WaveShaper.prototype, "duration", {
        /**
         * @description Total duration of all tracks
         *
         * @readonly
         * @memberof WaveShaper
         */
        get: function () { return this._duration; },
        enumerable: true,
        configurable: true
    });
    /**
     * @description Flattens the segments of the given waveshaper id
     *
     * @param id
     * @returns WaveShaper instance
     */
    WaveShaper.prototype.flatten = function () {
        var _this = this;
        var ids = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            ids[_i] = arguments[_i];
        }
        this.getProcessIds.apply(this, ids).forEach(function (id) {
            var waveShaper = _this.getTrack(id);
            if (waveShaper != null)
                waveShaper.flatten();
        });
        return this;
    };
    /**
     * Processes all relevant WaveShapers and invokes registered callbacks
     *
     * @param ids Options array of id's to draw
     * @param forceDraw Force redraw of the given waves
     *
     * @returns WaveShaper instance
     */
    WaveShaper.prototype.process = function () {
        var ids = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            ids[_i] = arguments[_i];
        }
        var toProcess = this.getProcessIds.apply(this, ids);
        var options = __assign({}, this.options);
        var data = [];
        for (var i = 0; i < toProcess.length; i++) {
            var id = toProcess[i];
            var wave = this.getTrack(id);
            if (wave == null)
                continue;
            var peaks = wave.calculate(options, this.audioData);
            data.push({ id: id, data: peaks });
        }
        // Invoke callbacks after returning value.
        this._lastProcessResult = { options: options, data: data };
        this.invokeCallbacks(this._lastProcessResult);
        return this;
    };
    /**
     * Registers a callback that fires when the track with given id is processed
     *
     * @param id id of Track to register to
     * @param callBack will be invoked when the given track is processed
     *
     * @returns WaveShaper instance
     */
    WaveShaper.prototype.on = function (id, callBack) {
        var callbackArray = this.callbackMap.get(id);
        if (callbackArray == null) {
            this.callbackMap.set(id, [callBack]);
        }
        else {
            callbackArray.push(callBack);
        }
        return this;
    };
    /**
     * Unregisters a callback from the given track, will no longer be called
     *
     * @param id id of Track to unregister from
     * @param callBack callback to remove
     *
     * @returns WaveShaper instance
     */
    WaveShaper.prototype.off = function (id, callBack) {
        var callbackArray = this.callbackMap.get(id);
        if (callbackArray == null)
            return this;
        var index = callbackArray.indexOf(callBack);
        if (index < 0)
            return this;
        callbackArray = callbackArray.splice(index, 1);
        return this;
    };
    /**
     * @description Merges the given options into the current and returns updated options
     *
     * @param options A (partial) ManagerOptions object
     * @returns WaveShaper instance
     */
    WaveShaper.prototype.setOptions = function (options) {
        if (!this.optionsValid(options)) {
            throw new Error("Invalid options given: " + JSON.stringify(options));
        }
        this._options = __assign({}, this.options, options);
        return this;
    };
    /**
     * @description Adds a waveshaper to the manager
     *
     * @param id id of WaveShaper
     * @param segments Segments in wave
     * @param color Background color of segments
     *
     * @returns WaveShaper instance
     */
    WaveShaper.prototype.setTracks = function () {
        var _this = this;
        var tracks = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tracks[_i] = arguments[_i];
        }
        tracks.forEach(function (track) {
            var foundWave = _this.getTrack(track.id);
            if (foundWave == null) {
                var wave = new track_1.default(track.id, track.intervals);
                _this.tracks.set(track.id, wave);
            }
            else {
                foundWave.intervals = track.intervals;
                foundWave.flatten();
            }
        });
        this._duration = this.getDuration();
        return this;
    };
    /**
     * @description Adds audio data to the waveshaper and redraws waveshapers using it
     *
     * @param id  Data id, refered to by source parameter of segments
     * @param data AudioBuffer with audio data
     *
     * @returns WaveShaper instance
     */
    WaveShaper.prototype.setData = function () {
        var _this = this;
        var data = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            data[_i] = arguments[_i];
        }
        data.forEach(function (d) {
            _this.audioData.set(d.id, d.data);
        });
        return this;
    };
    /**
     * @description The given id's are set as the active waveshapers, process only processes these when set,
     * call with no values to allways process all values (default)
     *
     * @param ids Waveshaper id's to set as active
     *
     * @returns WaveShaper instance
     */
    WaveShaper.prototype.setActive = function () {
        var ids = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            ids[_i] = arguments[_i];
        }
        this.activeWaveShapers = ids;
        return this;
    };
    /**
     * @description Removes the waves and all callbacks with given id from the manager
     *
     * @param id
     *
     * @returns WaveShaper instance
     */
    WaveShaper.prototype.clearTracks = function () {
        var _this = this;
        var ids = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            ids[_i] = arguments[_i];
        }
        ids.forEach(function (id) {
            _this.removeCallbacksById(id);
            _this.tracks.delete(id);
        });
        return this;
    };
    /**
     * @description Gets Track with given id
     *
     * @param id
     * @returns Track with given ID
     */
    WaveShaper.prototype.getTrack = function (id) {
        return this.tracks.get(id);
    };
    /**
     * Validates given options
     *
     * @param options
     * @returns true if valid, false if not
     */
    WaveShaper.prototype.optionsValid = function (options) {
        return (options.samplesPerPixel === undefined || options.samplesPerPixel > 0) &&
            (options.meterType === undefined || options.meterType) &&
            (options.resolution === undefined || options.resolution > 0) &&
            (options.width === undefined || options.width > 0) &&
            (options.scrollPosition === undefined || options.scrollPosition >= 0) &&
            (options.samplerate === undefined || options.samplerate > 0);
    };
    /**
     * Invokes all registered callbacks registered to a waveshaper id in the data list
     *
     * @param options
     * @param data
     */
    WaveShaper.prototype.invokeCallbacks = function (result) {
        for (var i = 0; i < result.data.length; i++) {
            var trackResult = result.data[i];
            var callbacks = this.callbackMap.get(trackResult.id);
            if (callbacks == null)
                continue;
            for (var j = 0; j < callbacks.length; j++) {
                var callback = callbacks[j];
                callback(result.options, new Float32Array(trackResult.data));
            }
        }
    };
    WaveShaper.prototype.getProcessIds = function () {
        var ids = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            ids[_i] = arguments[_i];
        }
        if (ids.length > 0)
            return ids;
        if (this.activeWaveShapers && this.activeWaveShapers.length > 0)
            return this.activeWaveShapers;
        return Array.from(this.tracks.keys());
    };
    WaveShaper.prototype.removeCallbacksById = function (id) {
        var callbackArray = this.callbackMap.get(id);
        if (callbackArray == null)
            return;
        callbackArray.splice(0, callbackArray.length);
        this.callbackMap.delete(id);
    };
    /**
     * @description Returns the maximum duration of all the waveshapers managed by this class
     *
     * @returns Maximum duration in seconds
     * @memberof WaveShaper
     */
    WaveShaper.prototype.getDuration = function () {
        return Array.from(this.tracks.values()).reduce(function (maxDuration, waveShaper) {
            var duration = waveShaper.getDuration();
            return duration > maxDuration ? duration : maxDuration;
        }, 0);
    };
    return WaveShaper;
}());
exports.default = WaveShaper;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var peak_1 = __webpack_require__(2);
var rms_1 = __webpack_require__(3);
var flatten_1 = __webpack_require__(4);
var Track = /** @class */ (function () {
    function Track(id, intervals) {
        var _this = this;
        this.id = id;
        this.intervals = intervals;
        /**
         * Gets the duration of the audio in seconds
         *
         * @returns Decimal value of total duration in seconds
         */
        this.getDuration = function () { return Math.max.apply(Math, _this.intervals.map(function (s) { return s.end; })); };
        this.flattened = flatten_1.default(this.intervals);
    }
    Track.prototype.flatten = function () {
        this.flattened = flatten_1.default(this.intervals);
    };
    /**
     * Gets the summerized values for the current settings
     *
     * @param options
     * @param dataMap
     * @returns Two dimensional array, one entry for each pixel, for each pixel a min
     * and a max value.
     */
    Track.prototype.calculate = function (options, dataMap) {
        switch (options.meterType) {
            case 'peak':
                return peak_1.default(options, this.flattened, dataMap);
            default:
                return rms_1.default(options, this.flattened, dataMap);
        }
    };
    return Track;
}());
exports.default = Track;


/***/ }),
/* 2 */
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
exports.default = (function (options, intervals, dataMap) {
    var sampleSize = Math.ceil(options.samplesPerPixel / options.resolution);
    var start = options.scrollPosition * options.samplesPerPixel;
    var startSecond = start / options.samplerate;
    var secondsPerPixel = options.samplesPerPixel / options.samplerate;
    var endSecond = startSecond + (options.width * secondsPerPixel);
    var peaks = new Float32Array(options.width * 4);
    var currentIntervalIndex = intervals.findIndex(function (i) { return i.end > startSecond && i.start + i.offsetStart < endSecond; });
    // There are no intervals in this range so return empty array
    if (currentIntervalIndex === -1)
        return peaks;
    var maxIntervalIncrementIndex = intervals.length - 1;
    var currentInterval = intervals[currentIntervalIndex];
    var buffer = dataMap.get(currentInterval.source);
    // For each pixel we display
    for (var i = 0; i < options.width; i++) {
        var currentSecond = startSecond + (i * secondsPerPixel);
        if (currentSecond >= currentInterval.end) {
            if (currentIntervalIndex === maxIntervalIncrementIndex) {
                return peaks;
            }
            else {
                currentInterval = intervals[++currentIntervalIndex];
                buffer = dataMap.get(currentInterval.source);
            }
        }
        if (currentInterval.start + currentInterval.offsetStart > currentSecond) {
            continue;
        }
        var startBorder = currentSecond - secondsPerPixel < currentInterval.start + currentInterval.offsetStart;
        var endBorder = currentSecond + secondsPerPixel > currentInterval.end;
        var intervalBorder = startBorder || endBorder ? 1 : 0;
        if (buffer == null) {
            peaks.set([0, 0, intervalBorder, 1], (i * 4));
            continue;
        }
        var secondsIntoInterval = currentSecond - currentInterval.start;
        var startSample = Math.floor(secondsIntoInterval * options.samplerate);
        var endSample = startSample + options.samplesPerPixel;
        var length_1 = buffer.length;
        var loopEnd = length_1 < endSample ? length_1 : endSample;
        // Cycle through the data-points relevant to the pixel
        // Don't cycle through more than sampleSize frames per pixel.
        var min = 0, max = 0;
        for (var j = startSample; j < loopEnd; j += sampleSize) {
            var sample = buffer[j];
            // Keep track of positive and negative values separately
            if (sample > max)
                max = sample;
            else if (sample < min)
                min = sample;
        }
        peaks.set([min, max, intervalBorder, 1], (i * 4));
    }
    return peaks;
});


/***/ }),
/* 3 */
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
exports.default = (function (options, intervals, dataMap) {
    var sampleSize = Math.ceil(options.samplesPerPixel / options.resolution);
    var start = options.scrollPosition * options.samplesPerPixel;
    var startSecond = start / options.samplerate;
    var secondsPerPixel = options.samplesPerPixel / options.samplerate;
    var endSecond = startSecond + (options.width * secondsPerPixel);
    var peaks = new Float32Array(options.width * 4);
    var currentIntervalIndex = intervals.findIndex(function (i) { return i.end > startSecond && i.start + i.offsetStart < endSecond; });
    // There are no intervals in this range so return empty array
    if (currentIntervalIndex === -1)
        return peaks;
    var maxIntervalIncrementIndex = intervals.length - 1;
    var currentInterval = intervals[currentIntervalIndex];
    var buffer = dataMap.get(currentInterval.source);
    // For each pixel we display
    for (var i = 0; i < options.width; i++) {
        var currentSecond = startSecond + (i * secondsPerPixel);
        if (currentSecond >= currentInterval.end) {
            if (currentIntervalIndex === maxIntervalIncrementIndex) {
                return peaks;
            }
            else {
                currentInterval = intervals[++currentIntervalIndex];
                buffer = dataMap.get(currentInterval.source);
            }
        }
        if (currentInterval.start + currentInterval.offsetStart > currentSecond) {
            continue;
        }
        var startBorder = currentSecond - secondsPerPixel < currentInterval.start + currentInterval.offsetStart;
        var endBorder = currentSecond + secondsPerPixel > currentInterval.end;
        var intervalBorder = startBorder || endBorder ? 1 : 0;
        if (buffer == null) {
            peaks.set([0, 0, intervalBorder, 1], (i * 4));
            continue;
        }
        var secondsIntoInterval = currentSecond - currentInterval.start;
        var startSample = Math.floor(secondsIntoInterval * options.samplerate);
        var endSample = startSample + options.samplesPerPixel;
        var length_1 = buffer.length;
        var loopEnd = length_1 < endSample ? length_1 : endSample;
        // Cycle through the data-points relevant to the pixel
        // Don't cycle through more than sampleSize frames per pixel.
        var posSum = 0, negSum = 0, count = 0;
        for (var j = startSample; j < loopEnd; j += sampleSize, count++) {
            var val = buffer[j];
            // Keep track of positive and negative values separately
            if (val > 0) {
                posSum += val * val;
            }
            else {
                negSum += val * val;
            }
        }
        var min = -Math.sqrt(negSum / count);
        var max = Math.sqrt(posSum / count);
        peaks.set([min, max, intervalBorder, 1], (i * 4));
    }
    return peaks;
});


/***/ }),
/* 4 */
/***/ (function(module, exports) {

var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var start = function (segment) { return segment.start + segment.offsetStart; };
/**
 * The algorithm first calculates real start and end times of each segment,
 * sorts them by priority, then start time.
 *
 * Finally it merges the segments by index so there are no overlapping
 * segments and those with highest index are on top.
 *
 * @export
 * @param segments Segments to flatten
 * @returns flattened Interval array
 */
exports.default = (function (segments) {
    var sorted = sort(segments);
    var normalized = normalizeIndex(sorted);
    var copied = copy(normalized);
    var grouped = groupByIndex(copied);
    return weightedMerge(grouped);
});
/**
 * Copies elements so original are unaltered
 *
 * @param intervals
 */
var copy = function (intervals) { return intervals.map(function (i) { return (__assign({}, i)); }); };
/**
 * When an element is altered the index is set very high,
 * this functions normalizes to indexes back to 0
 *
 * @param segments
 */
var normalizeIndex = function (segments) {
    var index = 0;
    var preNormalizeIndex = Number.MIN_SAFE_INTEGER;
    segments.forEach(function (el) {
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
 * Sorts the intervals by index, then by start
 *
 * @param intervals
 * @return Interval array
 */
var sort = function (intervals) {
    return intervals.sort(function (a, b) { return cmp(a.index, b.index) || cmp(start(a), start(b)); });
};
/**
 * Returns a map of intervals grouped by the key property
 *
 * @param intervals
 * @param key
 *
 * @returns Map of index => interval[]
 */
var groupByIndex = function (intervals) {
    return intervals.reduce(function (groups, interval) {
        (groups[interval.index] = groups[interval.index] || []).push(interval);
        return groups;
    }, {});
};
/**
 * Merges all the groups by index
 *
 * @param grouped
 * @returns Interval array
 */
var weightedMerge = function (grouped) {
    var flattened = null;
    for (var _i = 0, _a = Object.keys(grouped); _i < _a.length; _i++) {
        var index = _a[_i];
        var merged = merge(grouped[index]);
        if (flattened == null) {
            flattened = merged;
        }
        else {
            flattened = combine(merged, flattened);
        }
    }
    return flattened;
};
/**
 * Merges a set of intervals with the same index and remove any overlaps, left to right
 *
 * @param intervals
 * @returns Interval array
 */
var merge = function (intervals) {
    if (intervals.length <= 1)
        return intervals;
    var result = [];
    var current = intervals[0];
    for (var i = 1; i < intervals.length; i++) {
        var next = intervals[i];
        // If current is completely overlapped by second it is merged into it
        if (current.end >= next.end) {
            continue;
            // Resolves partial overlaps by setting end of current to start of next
        }
        else if (start(next) < current.end) {
            result.push(__assign({}, current, { end: start(next) }));
            current = next;
        }
        else {
            // No overlap, push onto results
            result.push(current);
            current = next;
        }
    }
    result.push(current);
    return result;
};
/**
 * Given two sets of intervals it merges them so the highIndexes set has priority
 *
 * @param highIndexes
 * @param lowIndexes
 *
 * @returns Interval array
 */
var combine = function (highIndexes, lowIndexes) {
    var highIndex = 0;
    var lowIndex = 0;
    var merged = [];
    while (highIndex < highIndexes.length || lowIndex < lowIndexes.length) {
        var high = highIndexes[highIndex];
        var low = lowIndexes[lowIndex];
        // Only low priority left so push low onto results
        if (highIndex === highIndexes.length) {
            merged.push(__assign({}, low));
            lowIndex++;
            // Only high priority left so push high onto results
        }
        else if (lowIndex === lowIndexes.length) {
            merged.push(__assign({}, high));
            highIndex++;
            // High priority start before or at same time as low
        }
        else if (start(high) <= start(low)) {
            // No overlap between low and high
            // low:                 ----------------------
            // high: ---------------
            if (high.end <= start(low)) {
                // Partial overlap where high ends after low
                // low:                 ----------------------
                // high: ----------------------
            }
            else if (high.end < low.end) {
                low.offsetStart = high.end - low.start;
                // Low index completely overlapped, dismiss it
                // low:               -----------
                // high: -------------------------------------
            }
            else {
                lowIndex++;
            }
            merged.push(__assign({}, high));
            highIndex++;
            // Low priority starts before high
        }
        else {
            // No overlap between low and high intervals
            // low: ---------------
            // high                ----------------------
            if (low.end <= start(high)) {
                merged.push(__assign({}, low));
                lowIndex++;
                // Partial overlap where high ends after low
                // low: ---------------------
                // high                ----------------------
            }
            else if (high.end > low.end) {
                merged.push(__assign({}, low, { end: start(high) }));
                lowIndex++;
                // Partial overlap where high ends before low
                // low: -------------------------------------
                // high             -----------
            }
            else {
                merged.push(__assign({}, low, { end: start(high) }));
                low.offsetStart = high.end - low.start;
            }
        }
    }
    return merged;
};
/**
 *
 * @param a
 * @param b
 */
var cmp = function (a, b) {
    if (a > b)
        return +1;
    if (a < b)
        return -1;
    return 0;
};


/***/ }),
/* 5 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var defaultOptions = {
    scrollPosition: 0,
    samplesPerPixel: 1024,
    resolution: 10,
    meterType: 'rms',
    mode: 'pan',
    width: 300,
    height: 150,
    generateId: function () { return Math.random.toString(); },
    samplerate: 44100,
    getEventTarget: function (ev) { return ev.target; }
};
exports.default = defaultOptions;


/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_6__;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var waveshaper_1 = __webpack_require__(0);
exports.WaveShaper = waveshaper_1.default;
var track_1 = __webpack_require__(1);
exports.Track = track_1.default;
var dom_1 = __webpack_require__(8);
exports.DomRenderWaveShaper = dom_1.default;
var managerconfig_1 = __webpack_require__(5);
exports.defaultConfig = managerconfig_1.default;
var rms_1 = __webpack_require__(3);
exports.rms = rms_1.default;
var peak_1 = __webpack_require__(2);
exports.peak = peak_1.default;
var flatten_1 = __webpack_require__(4);
exports.flatten = flatten_1.default;
exports.default = new dom_1.default();


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var waveshaper_1 = __webpack_require__(0);
var Hammer = __webpack_require__(6);
var hammerconfig_1 = __webpack_require__(9);
var cut_1 = __webpack_require__(10);
var drag_1 = __webpack_require__(11);
var pan_1 = __webpack_require__(12);
var zoom_1 = __webpack_require__(13);
var resize_1 = __webpack_require__(14);
var line_1 = __webpack_require__(15);
var noop = function () { };
/**
 * @description Sets up touch and mouse interaction with the canvasses. When using this
 * you should use the registerCanvas method as it ensures the canvasses have the correct
 * classes and attributes.
 *
 * @param manager
 * @param container
 */
var addInteraction = function (manager, element) {
    if (element == null)
        throw Error('Interaction container element could not be found.');
    var hammer = new Hammer(element, hammerconfig_1.default);
    var destroy = drag_1.default(manager, hammer, element);
    cut_1.default(manager, hammer);
    pan_1.default(manager, hammer);
    zoom_1.default(manager, hammer);
    resize_1.default(manager, hammer);
    return function () {
        hammer.destroy();
        destroy();
    };
};
/**
 * Extends WaveShapeManager to allow for easy canvas rendering registration.
 *
 * @inheritDoc
 */
var DomRenderWaveShaper = /** @class */ (function (_super) {
    __extends(DomRenderWaveShaper, _super);
    function DomRenderWaveShaper() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.unregister = noop;
        _this.canvasMap = new Map();
        return _this;
    }
    Object.defineProperty(DomRenderWaveShaper.prototype, "scrollWidth", {
        get: function () { return (this._duration * this._options.samplerate) / this._options.samplesPerPixel; },
        enumerable: true,
        configurable: true
    });
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
    DomRenderWaveShaper.prototype.registerCanvas = function (id, canvas, color) {
        var _this = this;
        var ctx = canvas.getContext('2d');
        if (ctx == null)
            throw Error('Cannot get context from canvas.');
        // Add classes and data attributes
        canvas.classList.add('waveshaper');
        canvas.setAttribute('data-wave-id', id);
        canvas.style.width = this.options.width + 'px';
        canvas.style.height = this.options.height + 'px';
        var scale = (devicePixelRatio || 1) < 1 ? 1 : (devicePixelRatio || 1);
        canvas.width = this.options.width * scale;
        canvas.height = this.options.height;
        ctx.scale(scale, 1);
        var callBack = function (options, data) { return line_1.default(data, options, ctx, color); };
        this.on(id, callBack);
        this.unregisterCanvas(id);
        this.canvasMap.set(id, function () { return _this.off(id, callBack); });
        return this;
    };
    /**
     * Clears the callbacks associated with this canvas
     *
     * @param id
     * @returns Instance of WaveShaper
     */
    DomRenderWaveShaper.prototype.unregisterCanvas = function (id) {
        var unregister = this.canvasMap.get(id);
        if (unregister != null) {
            unregister();
            this.canvasMap.delete(id);
        }
        return this;
    };
    /**
     * Registers event listeners to given element which handle interaction,
     * events are delegated so canvasses should be direct or indirect children
     * of given element.
     *
     * @param element
     * @returns Current WaveShaper instance
     */
    DomRenderWaveShaper.prototype.setInteraction = function (element) {
        this.unregister();
        this.unregister = addInteraction(this, element);
        return this;
    };
    /**
     * Removes event listeners from previously called setInteraction
     *
     * @returns Current WaveShaper instance
     */
    DomRenderWaveShaper.prototype.clearInteraction = function () {
        this.unregister();
        this.unregister = noop;
        return this;
    };
    /**
     * Loads and saves a set of url's to audio files.
     *
     * @param ctx
     * @param data
     */
    DomRenderWaveShaper.prototype.loadData = function (ctx) {
        var _this = this;
        var data = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            data[_i - 1] = arguments[_i];
        }
        data.forEach(function (dat) {
            fetch(dat.url)
                .then(function (res) { return res.arrayBuffer(); })
                .then(function (arrayBuffer) { return ctx.decodeAudioData(arrayBuffer); })
                .then(function (audioBuffer) {
                _this.setData({ id: dat.id, data: audioBuffer.getChannelData(0) }).process();
            })
                .catch(function (e) { return console.log(e); });
        });
        return this;
    };
    return DomRenderWaveShaper;
}(waveshaper_1.default));
exports.default = DomRenderWaveShaper;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var Hammer = __webpack_require__(6);
var hammerOptions = {
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

var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Adds drag functionality to waveshaper
 *
 * @param manager
 * @param hammer
 */
exports.default = (function (manager, hammer) {
    var shouldHandle = function (target, options) { return options.mode === 'cut' && target.hasAttribute('data-wave-id'); };
    hammer.on('tap', function (ev) {
        var options = manager.options;
        var target = manager.options.getEventTarget(ev.srcEvent);
        if (options == null || !shouldHandle(target, options))
            return;
        var id = target.getAttribute('data-wave-id');
        if (id == null)
            return;
        var wave = manager.getTrack(id);
        if (wave == null)
            return;
        var bb = ev.target.getBoundingClientRect();
        var time = (options.scrollPosition + (ev.center.x - bb.left)) * (options.samplesPerPixel / options.samplerate);
        var interval = wave.flattened.find(function (i) { return i.start + i.offsetStart <= time && i.end >= time; });
        if (interval == null)
            return;
        var segment = wave.intervals.find(function (s) { return s.id === interval.id; });
        if (segment == null)
            return;
        var newSegment = __assign({}, segment, { offsetStart: time - segment.start, id: options.generateId() });
        segment.end = time;
        wave.intervals.push(newSegment);
        manager.flatten(wave.id);
        manager.process(wave.id);
    });
});


/***/ }),
/* 11 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var dragState = {
    activeSegment: null,
    activeSegmentStart: 0,
    dragWave: null,
    options: null,
    duration: 0,
    dragging: false
};
/**
 * Adds drag functionality to waveshaper
 *
 * @param manager Waveshape Manager
 * @param hammer Hammer instance
 * @param container Container element
 */
exports.default = (function (manager, hammer, container) {
    var shouldHandle = function (target, options) { return options.mode === 'drag' && target.hasAttribute('data-wave-id'); };
    var listener = function (ev) { return mouseHover(ev); };
    /**
     * Fires when the mouse moves over the container,
     * If a segment is being dragged and the pointer moves
     * into another canvas the segment is tranfered to the
     * new canvas.
     */
    if (isTouchDevice()) {
        container.addEventListener('touchmove', listener);
    }
    else {
        container.addEventListener('mousemove', listener);
    }
    var destroy = function () {
        if (isTouchDevice()) {
            container.removeEventListener('touchmove', listener);
        }
        else {
            container.removeEventListener('mousemove', listener);
        }
    };
    /**
     * Sets up the drag by finding the
     */
    hammer.on('panstart', function (ev) {
        var options = manager.options;
        var target = manager.options.getEventTarget(ev.srcEvent);
        if (!shouldHandle(target, options))
            return;
        var id = target.getAttribute('data-wave-id');
        if (id == null)
            return;
        var wave = manager.getTrack(id);
        if (wave == null)
            return;
        var bb = ev.target.getBoundingClientRect();
        var time = (options.scrollPosition + (ev.center.x - bb.left)) * (options.samplesPerPixel / options.samplerate);
        var interval = wave.flattened.find(function (i) { return i.start + i.offsetStart <= time && i.end >= time; });
        if (interval == null)
            return;
        var segment = wave.intervals.find(function (s) { return s.id === interval.id; });
        if (segment == null)
            return;
        dragState.options = options;
        dragState.activeSegment = segment;
        dragState.activeSegmentStart = dragState.activeSegment.start;
        dragState.duration = segment.end - segment.start;
        dragState.activeSegment.index = 1000;
        dragState.dragWave = wave;
    });
    hammer.on('panmove', function (ev) {
        var target = manager.options.getEventTarget(ev.srcEvent);
        if (dragState.options == null || !shouldHandle(target, dragState.options))
            return;
        if (dragState.activeSegment == null || dragState.dragWave == null)
            return;
        if (dragState.dragging)
            return;
        dragState.dragging = true;
        /**
         * TODO below implementation stops all updates on touch devices on new track (tested on Samsung Galaxy s8),
         * when dragged back to original keeps working. Works on desktop, it's a small performance improvement as
         * it prevents a single track flatten + process when transferring a segment between tracks.
         */
        //// If the target has moved it is handled by the mouseHover function
        // const id = ev.target.getAttribute('data-wave-id');
        // if(id !== dragState.dragWave.id)
        //     return;
        var change = (ev.deltaX * dragState.options.samplesPerPixel) / dragState.options.samplerate;
        var newTime = dragState.activeSegmentStart + change;
        if (newTime + dragState.activeSegment.offsetStart < 0) {
            newTime = -dragState.activeSegment.offsetStart;
        }
        dragState.activeSegment.start = newTime;
        dragState.activeSegment.end = newTime + dragState.duration;
        manager.flatten(dragState.dragWave.id);
        manager.process(dragState.dragWave.id);
        dragState.dragging = false;
    });
    hammer.on('panend', function (ev) {
        var target = manager.options.getEventTarget(ev.srcEvent);
        if (dragState.options == null || !shouldHandle(target, dragState.options))
            return;
        dragState.activeSegment = null;
        dragState.activeSegmentStart = 0;
        dragState.dragWave = null;
        dragState.options = null;
        dragState.duration = 0;
    });
    var mouseHover = function (ev) {
        if (dragState.options == null || dragState.options.mode !== 'drag')
            return;
        if (dragState.activeSegment == null || dragState.dragWave == null)
            return;
        var canvas = getTouchMouseTargetElement(ev);
        if (canvas == null || !(canvas instanceof HTMLCanvasElement))
            return;
        var id = canvas.getAttribute('data-wave-id');
        if (id == null)
            return;
        var wave = manager.getTrack(id);
        if (wave == null)
            return;
        if (dragState.dragWave.id !== id) {
            var index = dragState.dragWave.intervals.indexOf(dragState.activeSegment);
            dragState.dragWave.intervals.splice(index, 1);
            wave.intervals.push(dragState.activeSegment);
            dragState.activeSegment.index = 1000;
            var currentId = dragState.dragWave.id;
            dragState.dragWave = wave;
            manager.flatten(wave.id, currentId);
            manager.process(wave.id, currentId);
        }
    };
    /**
     * Gets the actual target from a pointer event
     * @param ev
     */
    var getTouchMouseTargetElement = function (ev) {
        if (ev instanceof TouchEvent) {
            return document.elementFromPoint(ev.touches[0].pageX, ev.touches[0].pageY);
        }
        return manager.options.getEventTarget(ev);
    };
    function isTouchDevice() {
        return 'ontouchstart' in window // works on most browsers 
            || navigator.maxTouchPoints; // works on IE10/11 and Surface
    }
    ;
    return destroy;
});


/***/ }),
/* 12 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var endMargin = 500;
var panState = {
    panStart: 0,
    panMax: 0,
    options: null
};
/**
 * Adds pan functionality to waveshaper
 *
 * @param manager
 * @param hammer
 */
function default_1(manager, hammer) {
    var shouldHandle = function (target, options) { return options.mode === 'pan' && target.hasAttribute('data-wave-id'); };
    hammer.on('panstart', function (ev) {
        var options = manager.options;
        var target = manager.options.getEventTarget(ev.srcEvent);
        if (!shouldHandle(target, options))
            return;
        panState.panMax = manager.scrollWidth + endMargin;
        panState.panStart = options.scrollPosition;
    });
    hammer.on('panmove', function (ev) {
        panState.options = manager.options;
        var target = manager.options.getEventTarget(ev.srcEvent);
        if (!shouldHandle(target, panState.options))
            return;
        var position = panState.panStart - ev.deltaX;
        var newPosition = position > 0 ? position : 0;
        // If it was and is still 0 no need to update
        if (newPosition === panState.options.scrollPosition)
            return;
        if (position > panState.panMax - panState.options.width)
            return;
        manager.setOptions({ scrollPosition: newPosition }).process();
    });
    hammer.on('panend', function (ev) {
        var target = manager.options.getEventTarget(ev.srcEvent);
        if (panState.options == null || !shouldHandle(target, panState.options))
            return;
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
var endMargin = 500;
var zoomState = {
    maxWidth: 0,
    sppStart: 0,
    options: null
};
/**
 * Adds pinch zoom functionality to waveshaper
 *
 * @param manager
 * @param hammer
 */
function default_1(manager, hammer) {
    var shouldHandle = function (target, options) { return options.mode === 'pan' && target.hasAttribute('data-wave-id'); };
    hammer.on('pinchstart', function (ev) {
        var options = manager.options;
        var target = manager.options.getEventTarget(ev.srcEvent);
        if (!shouldHandle(target, options))
            return;
        zoomState.sppStart = options.samplesPerPixel;
        zoomState.maxWidth = manager.scrollWidth + endMargin;
    });
    hammer.on('pinchmove', function (ev) {
        zoomState.options = manager.options;
        var target = manager.options.getEventTarget(ev.srcEvent);
        if (zoomState.options == null || !shouldHandle(target, zoomState.options))
            return;
        var sampleAtLeft = zoomState.options.scrollPosition * zoomState.options.samplesPerPixel;
        var samplesInView = zoomState.options.width * zoomState.options.samplesPerPixel;
        var samplesToCenter = samplesInView / 2;
        var newSpp = zoomState.sppStart * ev.scale;
        var newSamplesInView = zoomState.options.width * newSpp;
        var newSamplesToCenter = newSamplesInView / 2;
        var maxWidth = manager.scrollWidth + endMargin;
        var maxSamplesInView = maxWidth * zoomState.options.samplerate;
        if (newSamplesInView >= maxSamplesInView)
            return;
        var newScroll = (sampleAtLeft + samplesToCenter - newSamplesToCenter) / newSpp;
        manager.setOptions({
            samplesPerPixel: newSpp,
            scrollPosition: newScroll >= 0 ? newScroll : 0
        }).process();
    });
    hammer.on('pinchend', function (ev) {
        var target = manager.options.getEventTarget(ev.srcEvent);
        if (zoomState.options == null || !shouldHandle(target, zoomState.options))
            return;
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
var resizeState = {
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
 * @param manager
 * @param hammer
 */
function default_1(manager, hammer) {
    var shouldHandle = function (target, options) { return options.mode === 'resize' && target != null && target.hasAttribute('data-wave-id'); };
    hammer.on('panstart', function (ev) {
        var options = manager.options;
        var target = manager.options.getEventTarget(ev.srcEvent);
        if (!shouldHandle(target, options))
            return;
        var id = target.getAttribute('data-wave-id');
        if (id == null)
            return;
        var wave = manager.getTrack(id);
        if (wave == null)
            return;
        var bb = ev.target.getBoundingClientRect();
        var time = (options.scrollPosition + (ev.center.x - bb.left)) * options.samplesPerPixel / options.samplerate;
        var interval = wave.flattened.find(function (i) { return i.start + i.offsetStart <= time && i.end >= time; });
        if (interval == null)
            return;
        resizeState.activeSegmentSide =
            time < interval.start + interval.offsetStart + ((interval.end - (interval.start + interval.offsetStart)) / 2) ?
                'left' :
                'right';
        var segment = wave.intervals.find(function (s) { return s.id === interval.id; });
        if (segment == null)
            return;
        resizeState.options = options;
        resizeState.activeSegment = segment;
        resizeState.activeSegmentOffsetStart = segment.offsetStart;
        resizeState.activeSegmentOffsetEnd = segment.end;
        segment.index = 1000;
        resizeState.dragWave = wave;
    });
    hammer.on('panmove', function (ev) {
        var target = manager.options.getEventTarget(ev.srcEvent);
        if (resizeState.dragWave == null || resizeState.options == null || !shouldHandle(target, resizeState.options))
            return;
        var options = manager.options;
        if (resizeState.activeSegment == null)
            return;
        var change = (ev.deltaX * options.samplesPerPixel) / options.samplerate;
        var newTime = resizeState.activeSegmentSide === 'left' ?
            resizeState.activeSegmentOffsetStart + change :
            resizeState.activeSegmentOffsetEnd + change;
        // Don't allow offset to become less than 0
        if (newTime < 0) {
            newTime = 0;
        }
        var active = resizeState.activeSegment;
        var newDuration = resizeState.activeSegmentSide === 'left' ?
            active.end - active.start - newTime :
            newTime - active.start - active.offsetStart;
        // Do not allow resizing 
        if (newDuration <= 2) {
            return;
        }
        resizeState.activeSegmentSide === 'left' ?
            active.offsetStart = newTime :
            active.end = newTime;
        manager.flatten(resizeState.dragWave.id);
        manager.process(resizeState.dragWave.id);
    });
    hammer.on('panend', function (ev) {
        var target = manager.options.getEventTarget(ev.srcEvent);
        if (resizeState.options == null || !shouldHandle(target, resizeState.options))
            return;
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
 * @param waveform Sampled data for each pixel, max at 0, min at 1
 * @param options
 * @param ctx
 * @param color
 */
exports.default = (function (waveform, options, ctx, color) {
    var scale = options.height / 2;
    var width = options.width;
    ctx.fillStyle = color;
    ctx.clearRect(0, 0, width, options.height);
    for (var i = 0, inSegment = false, segmentStart = 0; i < width; i++) {
        var index = i * 4;
        var pointInSegment = waveform[index + 3] === 1;
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
    for (var i = 0; i < width; i++) {
        var index = i * 4;
        ctx.lineTo(i, Math.round((waveform[index] * scale) + scale));
    }
    ctx.lineTo(width - 1, scale);
    ctx.moveTo(0, scale);
    for (var i = 0; i < width; i++) {
        var index = i * 4;
        ctx.lineTo(i, Math.round((waveform[index + 1] * scale) + scale));
    }
    ctx.lineTo(width - 1, scale);
    ctx.closePath();
    for (var i = 0; i < width; i++) {
        var index = i * 4;
        if (waveform[index - 4 + 2] === 0 && waveform[index + 2] === 1) {
            ctx.rect(i, 0, 1, options.height);
        }
    }
    ctx.fill();
});


/***/ })
/******/ ])["default"];
});
//# sourceMappingURL=waveshaper.js.map