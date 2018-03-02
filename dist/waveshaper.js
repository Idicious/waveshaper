(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["waveshaper"] = factory();
	else
		root["waveshaper"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var peak_1 = __webpack_require__(1);
var rms_1 = __webpack_require__(2);
var flatten_1 = __webpack_require__(3);
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
/* 1 */
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
/* 2 */
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
/* 3 */
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
/* 4 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var defaultOptions = {
    scrollPosition: 0,
    samplesPerPixel: 1024,
    resolution: 10,
    meterType: 'rms',
    width: 300,
    samplerate: 44100
};
exports.default = defaultOptions;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var waveshaper_1 = __webpack_require__(6);
exports.WaveShaper = waveshaper_1.default;
var track_1 = __webpack_require__(0);
exports.Track = track_1.default;
var managerconfig_1 = __webpack_require__(4);
exports.defaultConfig = managerconfig_1.default;
var rms_1 = __webpack_require__(2);
exports.rms = rms_1.default;
var peak_1 = __webpack_require__(1);
exports.peak = peak_1.default;
var flatten_1 = __webpack_require__(3);
exports.flatten = flatten_1.default;


/***/ }),
/* 6 */
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
var track_1 = __webpack_require__(0);
var managerconfig_1 = __webpack_require__(4);
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
         * @description Active id's, redraws when draw is called without argument
         *
         * @memberof WaveShaper
         */
        this.activeWaveShapers = [];
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


/***/ })
/******/ ]);
});
//# sourceMappingURL=waveshaper.js.map