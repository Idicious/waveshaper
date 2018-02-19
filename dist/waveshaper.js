(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("hammerjs"));
	else if(typeof define === 'function' && define.amd)
		define(["hammerjs"], factory);
	else if(typeof exports === 'object')
		exports["WaveShaper"] = factory(require("hammerjs"));
	else
		root["WaveShaper"] = factory(root["Hammer"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var peak_1 = __webpack_require__(4);
var rms_1 = __webpack_require__(5);
var line_1 = __webpack_require__(6);
var flatten_1 = __webpack_require__(7);
var WaveShaper = /** @class */ (function () {
    function WaveShaper(id, segments, width, height, color) {
        this.skipDraw = false;
        this.element = document.createElement('canvas');
        this.element.setAttribute('data-wave-id', id);
        this.id = id;
        this.color = color;
        this.segments = segments;
        this.width = width;
        this.height = height;
        this.flatten();
        this.element.style.width = width + 'px';
        this.element.style.height = height + 'px';
        this.element.classList.add('waveshaper');
        this.element.width = width * devicePixelRatio;
        this.element.height = height;
        this.ctx = this.element.getContext('2d');
        var scale = (devicePixelRatio || 1) < 1 ? 1 : (devicePixelRatio || 1);
        this.ctx.scale(scale, 1);
    }
    WaveShaper.prototype.flatten = function () {
        this.flattened = flatten_1.default(this.segments);
    };
    /**
     * Gets the duration of the audio in seconds
     *
     * @returns {number} Decimal value of total duration in seconds
     */
    WaveShaper.prototype.getDuration = function () {
        var maxLength = 0;
        for (var _i = 0, _a = this.segments; _i < _a.length; _i++) {
            var segment = _a[_i];
            var end = segment.start + segment.duration;
            if (end > maxLength) {
                maxLength = end;
            }
        }
        return maxLength;
    };
    /**
     * Gets the duration of the audio as a date
     *
     * @returns {Date} Date containing audio length
     */
    WaveShaper.prototype.getDurationAsDate = function () {
        var date = new Date(0);
        date.setTime(this.getDuration() * 1000);
        return date;
    };
    /**
     * Gets the width of scrollbar needed to scroll through the entire audio file
     *
     * @param {number} samplesPerPixel
     * @param {number} samplerate
     * @returns {number} Scroll width in pixels for the entire audio file
     */
    WaveShaper.prototype.getScrollWidth = function (samplesPerPixel, samplerate) {
        var maxLength = this.getDuration();
        return maxLength * samplerate / samplesPerPixel;
    };
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
    WaveShaper.prototype.calculate = function (meterType, sampleSize, samplesPerPixel, scrollPosition, samplerate, forceDraw, dataMap) {
        if (!forceDraw && this.lastValues != null && this.lastValues.meterType === meterType && this.lastValues.sampleSize === sampleSize &&
            this.lastValues.samplesPerPixel === samplesPerPixel && this.lastValues.scrollPosition === scrollPosition &&
            this.lastValues.samplerate === samplerate) {
            this.skipDraw = true;
            return this.calculated;
        }
        else {
            this.skipDraw = false;
            this.lastValues = {
                meterType: meterType,
                sampleSize: sampleSize,
                samplesPerPixel: samplesPerPixel,
                scrollPosition: scrollPosition,
                samplerate: samplerate
            };
        }
        switch (meterType) {
            case 'peak':
                this.calculated = peak_1.default(sampleSize, samplesPerPixel, this.width, this.flattened, scrollPosition, samplerate, dataMap);
                break;
            default:
                this.calculated = rms_1.default(sampleSize, samplesPerPixel, this.width, this.flattened, scrollPosition, samplerate, dataMap);
        }
        return this.calculated;
    };
    /**
     * Draws the waveform to the canvas with current settings
     *
     * @param {string} drawStyle
     */
    WaveShaper.prototype.draw = function () {
        if (!this.skipDraw) {
            line_1.default(this.calculated, this.height, this.width, this.ctx, this.color);
        }
    };
    return WaveShaper;
}());
exports.default = WaveShaper;


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var manager_1 = __webpack_require__(3);
exports.WaveShapeManager = manager_1.default;
var waveshaper_1 = __webpack_require__(0);
exports.WaveShaper = waveshaper_1.default;


/***/ }),
/* 3 */
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
var waveshaper_1 = __webpack_require__(0);
var drag_1 = __webpack_require__(8);
var resize_1 = __webpack_require__(9);
var cut_1 = __webpack_require__(10);
var pan_1 = __webpack_require__(11);
var zoom_1 = __webpack_require__(12);
var Hammer = __webpack_require__(1);
var hammerconfig_1 = __webpack_require__(13);
var managerconfig_1 = __webpack_require__(14);
/**
 *
 *
 * @class
 * @export
 */
var WaveShapeManager = /** @class */ (function () {
    /**
     * @param {number} samplerate Audio samplerate
     * @param {HTMLElement} container Container element
     * @param {ManagerOptions} [options=defaultOptions] Initial options
     * @throws {Error} Throws an error if samplerate is null or NaN
     * @constructor
     */
    function WaveShapeManager(samplerate, container, options) {
        if (options === void 0) { options = managerconfig_1.default; }
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
        if (samplerate == null || isNaN(samplerate)) {
            throw new Error('samplerate cannot be null and must be a number');
        }
        // Merge options and default options so ommited properties are set
        options = __assign({}, managerconfig_1.default, options);
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
        this.hammer = new Hammer(container, hammerconfig_1.default);
        drag_1.default(this, this.hammer, container);
        resize_1.default(this, this.hammer);
        cut_1.default(this, this.hammer);
        pan_1.default(this, this.hammer);
        zoom_1.default(this, this.hammer);
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
    WaveShapeManager.prototype.addWaveShaper = function (id, segments, color) {
        var foundWave = this.waveShapers.get('id');
        if (foundWave == null) {
            var wave = new waveshaper_1.default(id, segments, this.width, this.height, color);
            this.waveShapers.set(id, wave);
            return wave;
        }
        return foundWave;
    };
    WaveShapeManager.prototype.getWaveShaper = function (id) {
        return this.waveShapers.get(id);
    };
    /**
     * @description Adds audio data to the waveshaper and redraws waveshapers using it
     *
     * @param id  Data id, refered to by source parameter of segments
     * @param data AudioBuffer with audio data
     *
     * @memberof WaveShapeManager
     */
    WaveShapeManager.prototype.addAudioData = function (id, data) {
        if (!this.audioData.has(id)) {
            this.audioData.set(id, data.getChannelData(0));
            this.draw(this.activeWaveShapers, true);
        }
    };
    /**
     * @description Removes the wave with given id from the manager
     *
     * @param id
     *
     * @memberof WaveShapeManager
     */
    WaveShapeManager.prototype.removeWave = function (id) {
        this.waveShapers.delete(id);
    };
    /**
     * @description Flattens the segments of the given waveshaper id
     *
     * @param id
     * @memberof WaveShapeManager
     */
    WaveShapeManager.prototype.flatten = function (ids) {
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            var waveShaper = this.waveShapers.get(id);
            if (waveShaper != null)
                waveShaper.flatten();
        }
    };
    /**
     * @description Returns the maximum duration of all the waveshapers managed by this class
     *
     * @returns Maximum duration in seconds
     * @memberof WaveShapeManager
     */
    WaveShapeManager.prototype.getDuration = function () {
        var maxDuration = 0;
        for (var _i = 0, _a = Array.from(this.waveShapers.values()); _i < _a.length; _i++) {
            var wave = _a[_i];
            var duration = wave.getDuration();
            if (duration > maxDuration) {
                maxDuration = duration;
            }
        }
        return maxDuration;
    };
    /**
     * Gets the duration of the audio as a date
     *
     * @returns Date containing audio length
     * @memberof WaveShapeManager
     */
    WaveShapeManager.prototype.getDurationAsDate = function () {
        var date = new Date(0);
        date.setTime(this.getDuration() * 1000);
        return date;
    };
    /**
     * @description Gets the width of scrollbar needed to scroll through the entire audio file
     *
     * @returns Scroll width in pixels for the entire audio file
     * @memberof WaveShapeManager
     */
    WaveShapeManager.prototype.getScrollWidth = function () {
        var maxWidth = 0;
        for (var _i = 0, _a = Array.from(this.waveShapers.values()); _i < _a.length; _i++) {
            var wave = _a[_i];
            var width = wave.getScrollWidth(this.samplesPerPixel, this.samplerate);
            if (width > maxWidth) {
                maxWidth = width;
            }
        }
        return maxWidth;
    };
    /**
     * Draws the waveform to the canvas with current settings, defaults to drawing all activeWaveShapers
     *
     * @param ids Options array of id's to draw
     * @param forceDraw Force redraw of the given waves
     *
     * @memberof WaveShapeManager
     */
    WaveShapeManager.prototype.draw = function (ids, forceDraw) {
        var idsToDraw = ids == null ? this.activeWaveShapers == null ? Array.from(this.waveShapers.keys()) : this.activeWaveShapers : ids;
        for (var i = 0; i < idsToDraw.length; i++) {
            var wave = this.waveShapers.get(idsToDraw[i]);
            if (wave == null)
                continue;
            wave.calculate(this.meterType, this.resolution, this.samplesPerPixel, this.scrollPosition, this.samplerate, forceDraw, this.audioData);
        }
        for (var i = 0; i < idsToDraw.length; i++) {
            var wave = this.waveShapers.get(idsToDraw[i]);
            if (wave == null)
                continue;
            wave.draw();
        }
    };
    return WaveShapeManager;
}());
exports.default = WaveShapeManager;


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
exports.default = (function (resolution, samplesPerPixel, width, intervals, scrollPosition, sampleRate, dataMap) {
    var sampleSize = Math.ceil(samplesPerPixel / resolution);
    var start = scrollPosition * samplesPerPixel;
    var startSecond = start / sampleRate;
    var secondsPerPixel = samplesPerPixel / sampleRate;
    var peaks = [];
    // For each pixel we display
    for (var i = 0; i < width; i++) {
        var max = 0;
        var min = 0;
        var currentSecond = startSecond + ((i * samplesPerPixel) / sampleRate);
        var currentInterval = void 0;
        for (var i_1 = 0; i_1 < intervals.length; i_1++) {
            var interval = intervals[i_1];
            if (interval.start <= currentSecond && interval.end >= currentSecond) {
                currentInterval = interval;
                break;
            }
        }
        if (currentInterval == null) {
            peaks.push([0, 0, 0, 0]);
            continue;
        }
        var intervalBorder = 0;
        if (currentSecond + secondsPerPixel > currentInterval.end
            || currentSecond - secondsPerPixel < currentInterval.start) {
            intervalBorder = 1;
        }
        var buffer = dataMap.get(currentInterval.source);
        if (buffer == null) {
            peaks.push([0, 0, intervalBorder, 1]);
            continue;
        }
        var offsetStart = currentInterval.start - currentInterval.originalStart;
        var secondsIntoInterval = currentSecond - currentInterval.start;
        var startSample = Math.floor(((secondsIntoInterval + offsetStart) * sampleRate));
        var endSample = startSample + samplesPerPixel;
        var length_1 = buffer.length;
        var loopEnd = length_1 < endSample ? length_1 : endSample;
        // Cycle through the data-points relevant to the pixel
        // Don't cycle through more than sampleSize frames per pixel.
        for (var j = startSample; j < loopEnd; j += sampleSize) {
            var sample = buffer[j];
            // Keep track of positive and negative values separately
            if (sample > max)
                max = sample;
            else if (sample < min)
                min = sample;
        }
        peaks.push([min, max, intervalBorder, 1]);
    }
    return peaks;
});


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
exports.default = (function (resolution, samplesPerPixel, width, intervals, scrollPosition, sampleRate, dataMap) {
    var sampleSize = Math.ceil(samplesPerPixel / resolution);
    var start = scrollPosition * samplesPerPixel;
    var startSecond = start / sampleRate;
    var secondsPerPixel = samplesPerPixel / sampleRate;
    var vals = [];
    // For each pixel we display
    for (var i = 0; i < width; i++) {
        var posSum = 0;
        var negSum = 0;
        var currentSecond = startSecond + ((i * samplesPerPixel) / sampleRate);
        var interval = void 0;
        for (var i_1 = 0; i_1 < intervals.length; i_1++) {
            var s = intervals[i_1];
            if (s.start <= currentSecond && s.end >= currentSecond) {
                interval = s;
                break;
            }
        }
        if (interval == null) {
            vals.push([0, 0, 0, 0]);
            continue;
        }
        var intervalBorder = 0;
        if (currentSecond + secondsPerPixel > interval.end
            || currentSecond - secondsPerPixel < interval.start) {
            intervalBorder = 1;
        }
        var buffer = dataMap.get(interval.source);
        if (buffer == null) {
            vals.push([0, 0, intervalBorder, 1]);
            continue;
        }
        var offsetStart = interval.start - interval.originalStart;
        var secondsIntoInterval = currentSecond - interval.start;
        var startSample = Math.floor(((secondsIntoInterval + offsetStart) * sampleRate));
        var length_1 = buffer.length;
        var loopEnd = startSample + samplesPerPixel;
        var end = length_1 < loopEnd ? length_1 : loopEnd;
        // Cycle through the data-points relevant to the pixel
        // Don't cycle through more than sampleSize frames per pixel.
        for (var j = startSample; j < end; j += sampleSize) {
            var val = buffer[j];
            // Keep track of positive and negative values separately
            if (val > 0) {
                posSum += val * val;
            }
            else {
                negSum += val * val;
            }
        }
        var samples = Math.min(samplesPerPixel / 2, Math.round(resolution / 2));
        var min = -Math.sqrt(negSum / samples);
        var max = Math.sqrt(posSum / samples);
        vals.push([min, max, intervalBorder, 1]);
    }
    return vals;
});


/***/ }),
/* 6 */
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
exports.default = (function (waveform, height, width, ctx, color) {
    var scale = height / 2;
    ctx.fillStyle = color;
    ctx.strokeStyle = 'black';
    var length = waveform.length;
    ctx.clearRect(0, 0, width, height);
    for (var i = 0, inSegment = false, segmentStart = 0; i < length; i++) {
        var pointInSegment = waveform[i][3] === 1;
        if (!inSegment && pointInSegment) {
            inSegment = true;
            segmentStart = i;
        }
        else if (inSegment && (!pointInSegment || i === length - 1)) {
            inSegment = false;
            ctx.fillRect(segmentStart, 0, i - segmentStart, height);
        }
    }
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(0, scale);
    for (var i = 0; i < length; i++) {
        ctx.lineTo(i, Math.round((waveform[i][0] * scale) + scale));
    }
    ctx.lineTo(length - 1, scale);
    ctx.moveTo(0, scale);
    for (var i = 0; i < length; i++) {
        ctx.lineTo(i, Math.round((waveform[i][1] * scale) + scale));
    }
    ctx.lineTo(length - 1, scale);
    ctx.closePath();
    for (var i = 0; i < length; i++) {
        if (i != 0 && waveform[i - 1][2] === 0 && waveform[i][2] === 1) {
            ctx.rect(i - 1, 0, 1, height);
        }
    }
    ctx.fill();
});


/***/ }),
/* 7 */
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
exports.default = (function (segments) {
    var normalized = normalizeIndex(segments);
    var intervals = mapToIntervals(normalized);
    var sorted = sort(intervals);
    var grouped = grouByIndex(sorted);
    return weightedMerge(grouped);
});
/**
 * When an element is altered the index is set very high,
 * this functions normalizes to indexes back to 0
 *
 * @param {Segment[]} segments
 */
var normalizeIndex = function (segments) {
    var index = 0;
    segments.sort(function (a, b) { return cmp(a.index, b.index); }).forEach(function (el) {
        if (el.index > index) {
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
var mapToIntervals = function (segments) {
    return segments
        .map(function (s) {
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
var sort = function (intervals) {
    intervals.sort(function (a, b) {
        return cmp(a.index, b.index) || cmp(a.start, b.start);
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
var grouByIndex = function (intervals) {
    return intervals.reduce(function (groups, interval) {
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
var weightedMerge = function (grouped) {
    /** @type {Interval[]} */
    var flattened = null;
    for (var _i = 0, _a = Object.keys(grouped); _i < _a.length; _i++) {
        var index = _a[_i];
        merge(grouped[index]);
        if (flattened == null) {
            flattened = grouped[index];
        }
        else {
            flattened = combine(grouped[index], flattened);
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
var merge = function (intervals) {
    if (intervals == null || intervals.length <= 1)
        return intervals;
    var result = [];
    var prev = intervals[0];
    for (var i = 1; i < intervals.length; i++) {
        var curr = intervals[i];
        if (prev.end >= curr.end) {
            // merged case
            var merged = Object.assign({}, prev, { end: Math.max(prev.end, curr.end) });
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
var combine = function (highIndexes, lowIndexes) {
    var highCount = 0;
    var lowCount = 0;
    var merged = [];
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
var cmp = function (a, b) {
    if (a > b)
        return +1;
    if (a < b)
        return -1;
    return 0;
};


/***/ }),
/* 8 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var dragState = {
    activeSegment: null,
    activeSegmentStart: 0,
    dragWave: null
};
/**
 * Adds drag functionality to waveshaper
 *
 * @param {WaveShapeManager} manager Waveshape Manager
 * @param {HammerManager} hammer Hammer instance
 * @param {HTMLElement} container Container element
 */
exports.default = (function (manager, hammer, container) {
    /** @param {HammerInput} ev - Hammer event */
    var shouldHandle = function (ev) { return manager.mode === 'drag' && ev.target.classList.contains('waveshaper'); };
    /**
     * Fires when the mouse moves over the container,
     * If a segment is being dragged and the pointer moves
     * into another canvas the segment is tranfered to the
     * new canvas.
     */
    if (isTouchDevice()) {
        container.addEventListener('touchmove', function (ev) { return mouseHover(ev); });
    }
    else {
        container.addEventListener('mousemove', function (ev) { return mouseHover(ev); });
    }
    /**
     * Sets up the drag by finding the
     */
    hammer.on('panstart', function (ev) {
        if (!shouldHandle(ev))
            return;
        var id = ev.target.getAttribute('data-wave-id');
        if (id == null)
            return;
        var wave = manager.waveShapers.get(id);
        if (wave == null)
            return;
        var bb = ev.target.getBoundingClientRect();
        var time = (manager.scrollPosition + (ev.center.x - bb.left)) * manager.samplesPerPixel / manager.samplerate;
        var interval = wave.flattened.find(function (i) { return i.start <= time && i.end >= time; });
        if (interval == null)
            return;
        var segment = wave.segments.find(function (s) { return s.id === interval.id; });
        if (segment == null)
            return;
        dragState.activeSegment = segment;
        dragState.activeSegmentStart = dragState.activeSegment.start;
        dragState.activeSegment.index = 1000;
        dragState.dragWave = wave;
    });
    hammer.on('panmove', function (ev) {
        if (!shouldHandle(ev))
            return;
        if (dragState.activeSegment == null || dragState.dragWave == null)
            return;
        // If the target has moved it is handled by the mouse/touch move manager
        var id = ev.target.getAttribute('data-wave-id');
        if (id !== dragState.dragWave.id)
            return;
        var change = (ev.deltaX * manager.samplesPerPixel) / manager.samplerate;
        var newTime = dragState.activeSegmentStart + change;
        if (newTime + dragState.activeSegment.offsetStart < 0) {
            newTime = -dragState.activeSegment.offsetStart;
        }
        dragState.activeSegment.start = newTime;
        dragState.dragWave.flatten();
        manager.draw([dragState.dragWave.id], true);
    });
    hammer.on('panend', function (ev) {
        if (!shouldHandle(ev))
            return;
        dragState.activeSegment = null;
        dragState.activeSegmentStart = 0;
        dragState.dragWave = null;
    });
    var mouseHover = function (ev) {
        if (manager.mode !== 'drag')
            return;
        if (dragState.activeSegment == null || dragState.dragWave == null)
            return;
        var canvas = getTouchMouseTargetElement(ev);
        if (canvas == null || !(canvas instanceof HTMLCanvasElement))
            return;
        var id = canvas.getAttribute('data-wave-id');
        if (id == null)
            return;
        var wave = manager.waveShapers.get(id);
        if (wave == null)
            return;
        if (dragState.dragWave.id !== id) {
            var index = dragState.dragWave.segments.indexOf(dragState.activeSegment);
            dragState.dragWave.segments.splice(index, 1);
            wave.segments.push(dragState.activeSegment);
            dragState.activeSegment.index = 1000;
            manager.flatten([wave.id, dragState.dragWave.id]);
            manager.draw([wave.id, dragState.dragWave.id], true);
            dragState.dragWave = wave;
        }
    };
    /**
     * Gets the actual target from a pointer event
     * @param {TouchEvent | MouseEvent} ev
     */
    var getTouchMouseTargetElement = function (ev) {
        if (ev instanceof TouchEvent) {
            /** @type {TouchEvent} */
            var touch = ev;
            return document.elementFromPoint(touch.touches[0].pageX, touch.touches[0].pageY);
        }
        return ev.target;
    };
    function isTouchDevice() {
        return 'ontouchstart' in window // works on most browsers 
            || navigator.maxTouchPoints; // works on IE10/11 and Surface
    }
    ;
});


/***/ }),
/* 9 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var resizeState = {
    activeSegment: null,
    activeSegmentSide: null,
    activeSegmentOffsetStart: 0,
    activeSegmentOffsetEnd: 0,
    dragWave: null
};
/**
 * Adds drag functionality to waveshaper
 *
 * @param {WaveShapeManager} manager
 * @param {HammerManager} hammer
 */
function default_1(manager, hammer) {
    /** @param {HammerInput} ev */
    var shouldHandle = function (ev) { return manager.mode === 'resize' && ev != null && ev.target.classList.contains('waveshaper'); };
    hammer.on('panstart', function (ev) {
        if (!shouldHandle(ev))
            return;
        var id = ev.target.getAttribute('data-wave-id');
        if (id == null)
            return;
        var wave = manager.waveShapers.get(id);
        if (wave == null)
            return;
        var bb = ev.target.getBoundingClientRect();
        var time = (manager.scrollPosition + (ev.center.x - bb.left)) * manager.samplesPerPixel / manager.samplerate;
        var interval = wave.flattened.find(function (i) { return i.start <= time && i.end >= time; });
        if (interval == null)
            return;
        resizeState.activeSegmentSide =
            time < interval.start + ((interval.end - interval.start) / 2) ?
                'left' :
                'right';
        var segment = wave.segments.find(function (s) { return s.id === interval.id; });
        if (segment == null)
            return;
        resizeState.activeSegment = segment;
        resizeState.activeSegmentOffsetStart = segment.offsetStart;
        resizeState.activeSegmentOffsetEnd = segment.offsetEnd;
        segment.index = 1000;
        resizeState.dragWave = wave;
    });
    hammer.on('panmove', function (ev) {
        if (!shouldHandle(ev) || resizeState.dragWave == null)
            return;
        if (resizeState.activeSegment == null)
            return;
        var change = (ev.deltaX * manager.samplesPerPixel) / manager.samplerate;
        var newTime = resizeState.activeSegmentSide === 'left' ?
            resizeState.activeSegmentOffsetStart + change :
            resizeState.activeSegmentOffsetEnd - change;
        // Don't allow offset to become less than 0
        if (newTime < 0) {
            newTime = 0;
        }
        var active = resizeState.activeSegment;
        var newDuration = resizeState.activeSegmentSide === 'left' ?
            (active.start + active.duration) - active.start - newTime - active.offsetEnd :
            (active.start + active.duration) - active.start - active.offsetStart - newTime;
        // Do not allow resizing 
        if (newDuration <= 2) {
            return;
        }
        resizeState.activeSegmentSide === 'left' ?
            active.offsetStart = newTime :
            active.offsetEnd = newTime;
        resizeState.dragWave.flatten();
        manager.draw([resizeState.dragWave.id], true);
    });
    hammer.on('panend', function (ev) {
        if (!shouldHandle(ev))
            return;
        resizeState.activeSegment = null;
        resizeState.activeSegmentOffsetStart = 0;
        resizeState.activeSegmentOffsetEnd = 0;
        resizeState.activeSegmentSide = null;
        resizeState.dragWave = null;
    });
}
exports.default = default_1;


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
 * @param {WaveShapeManager} manager
 * @param {HammerManager} hammer
 */
exports.default = (function (manager, hammer) {
    var shouldHandle = function (ev) { return manager.mode === 'cut' && ev.target.classList.contains('waveshaper'); };
    hammer.on('tap', function (ev) {
        if (!shouldHandle(ev))
            return;
        var id = ev.target.getAttribute('data-wave-id');
        if (id == null)
            return;
        var wave = manager.waveShapers.get(id);
        if (wave == null)
            return;
        var bb = ev.target.getBoundingClientRect();
        var time = (manager.scrollPosition + (ev.center.x - bb.left)) * manager.samplesPerPixel / manager.samplerate;
        var interval = wave.flattened.find(function (i) { return i.start <= time && i.end >= time; });
        if (interval == null)
            return;
        var segment = wave.segments.find(function (s) { return s.id === interval.id; });
        if (segment == null)
            return;
        var cutTime = time - segment.start;
        var newSegment = __assign({}, segment);
        newSegment.offsetStart = cutTime;
        newSegment.id = manager.generateId();
        segment.offsetEnd = segment.duration - cutTime;
        wave.segments.push(newSegment);
        wave.flatten();
        manager.draw([wave.id], true);
    });
});


/***/ }),
/* 11 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var endMargin = 500;
var panState = {
    panStart: 0,
    panMax: 0
};
/**
 * Adds pan functionality to waveshaper
 *
 * @param {WaveShapeManager} manager
 * @param {HammerManager} hammer
 */
function default_1(manager, hammer) {
    /** @param {HammerInput} ev */
    var shouldHandle = function (ev) { return manager.mode === 'pan' && ev.target.classList.contains('waveshaper'); };
    hammer.on('panstart', function (ev) {
        if (!shouldHandle(ev))
            return;
        panState.panMax = manager.getScrollWidth() + endMargin;
        panState.panStart = manager.scrollPosition;
    });
    hammer.on('panmove', function (ev) {
        if (!shouldHandle(ev))
            return;
        var newPosition = panState.panStart - ev.deltaX;
        if (newPosition < 0)
            return;
        if (newPosition > panState.panMax - manager.width)
            return;
        manager.scrollPosition = newPosition;
        manager.draw(null, false);
    });
    hammer.on('panend', function (ev) {
        if (!shouldHandle(ev))
            return;
        panState.panStart = 0;
        panState.panMax = 0;
    });
}
exports.default = default_1;


/***/ }),
/* 12 */
/***/ (function(module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var endMargin = 500;
var zoomState = {
    maxWidth: 0,
    sppStart: 0
};
/**
 * Adds pinch zoom functionality to waveshaper
 *
 * @param {WaveShapeManager} manager
 * @param {HammerManager} hammer
 */
function default_1(manager, hammer) {
    var shouldHandle = function (ev) { return manager.mode === 'pan' && ev.target.classList.contains('waveshaper'); };
    hammer.on('pinchstart', function (ev) {
        if (!shouldHandle(ev))
            return;
        zoomState.sppStart = manager.samplesPerPixel;
        zoomState.maxWidth = manager.getScrollWidth() + endMargin;
    });
    hammer.on('pinchmove', function (ev) {
        if (!shouldHandle(ev))
            return;
        var sampleAtLeft = manager.scrollPosition * manager.samplesPerPixel;
        var samplesInView = manager.width * manager.samplesPerPixel;
        var samplesToCenter = samplesInView / 2;
        var newSpp = zoomState.sppStart * ev.scale;
        var newSamplesInView = manager.width * newSpp;
        var newSamplesToCenter = newSamplesInView / 2;
        var maxWidth = manager.getScrollWidth() + endMargin;
        var maxSamplesInView = maxWidth * manager.samplerate;
        if (newSamplesInView >= maxSamplesInView)
            return;
        var newScroll = (sampleAtLeft + samplesToCenter - newSamplesToCenter) / newSpp;
        manager.samplesPerPixel = newSpp;
        manager.scrollPosition = newScroll >= 0 ? newScroll : 0;
        manager.draw(null, false);
    });
    hammer.on('pinchend', function (ev) {
        if (!shouldHandle(ev))
            return;
        zoomState.sppStart = 0;
        zoomState.maxWidth = 0;
    });
}
exports.default = default_1;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var Hammer = __webpack_require__(1);
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
/* 14 */
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
    generateId: function () { return Math.random.toString(); }
};
exports.default = defaultOptions;


/***/ })
/******/ ]);
});
//# sourceMappingURL=waveshaper.js.map