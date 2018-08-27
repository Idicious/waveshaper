(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["waveshaper"] = factory();
	else
		root["waveshaper"] = factory();
})(window, function() {
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
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/weighted-interval-merge/dist/weighted-interval-merge.js":
/*!******************************************************************************!*\
  !*** ./node_modules/weighted-interval-merge/dist/weighted-interval-merge.js ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

(function (global, factory) {
   true ? factory(exports) :
  undefined;
}(this, (function (exports) { 'use strict';

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  /**
   * @typedef {Object} Interval
   * 
   * @property {number} start
   * @property {number} offsetStart
   * @property {number} end
   * @property {number} index
   */

  /**
   * @typedef {{[key: string]: Interval}} IntervalMap
   */

  /**
   * @param {Interval} interval
   */
  var calcStart = function calcStart(interval) {
    return interval.start + interval.offsetStart;
  };

  /**
   * The algorithm first calculates real start and end times of each segment,
   * sorts them by priority, then start time.
   *
   * Finally it merges the segments by index so there are no overlapping
   * segments and those with highest index are on top.
   *
   * @export
   * @param {Interval[]} intervals Segments to flatten
   * @returns {Interval[]} flattened Interval array
   */
  var weightedIntervalMerge = function weightedIntervalMerge(intervals) {
    if (intervals == null || intervals.length === 0) return [];

    var sorted = sort(intervals);
    var normalized = normalizeIndex(sorted);
    var copied = copy(normalized);
    var grouped = groupByIndex(copied);

    return weightedMerge(grouped);
  };

  /**
   * Copies elements so original are unaltered
   * 
   * @param {Interval[]} intervals 
   */
  var copy = function copy(intervals) {
    return intervals.map(function (i) {
      return _extends({}, i, {
        offsetStart: i.offsetStart || 0,
        index: i.index || 1
      });
    });
  };

  /**
   * When an element is altered the index is set very high,
   * this functions normalizes to indexes back to 0
   * 
   * @param {Intervalp[]} intervals 
   */
  var normalizeIndex = function normalizeIndex(intervals) {
    var index = 0;
    var preNormalizeIndex = Number.MIN_SAFE_INTEGER;
    intervals.forEach(function (el) {
      if (el.index > preNormalizeIndex) {
        preNormalizeIndex = el.index;
        el.index = ++index;
      } else {
        el.index = index;
      }
    });
    return intervals;
  };

  /**
   * Sorts the intervals by index, then by start
   * 
   * @param {Interval[]} intervals 
   * @return {Interval[]} Interval array
   */
  var sort = function sort(intervals) {
    return intervals.sort(function (a, b) {
      return cmp(a.index, b.index) || cmp(calcStart(a), calcStart(b));
    });
  };

  /**
   * Returns a map of intervals grouped by the key property
   * 
   * @param {Interval[]} intervals 
   * @returns {IntervalMap} Map of index => interval[]
   */
  var groupByIndex = function groupByIndex(intervals) {
    return intervals.reduce(function (groups, interval) {
      (groups[interval.index] = groups[interval.index] || []).push(interval);
      return groups;
    }, {});
  };

  /**
   * Merges all the groups by index
   * 
   * @param {IntervalMap} grouped 
   * @returns {Interval[]} Interval array
   */
  var weightedMerge = function weightedMerge(grouped) {
    var flattened = null;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = Object.keys(grouped)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var index = _step.value;

        var merged = merge(grouped[index]);
        if (flattened == null) {
          flattened = merged;
        } else {
          flattened = combine(merged, flattened);
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return flattened;
  };

  /**
   * Merges a set of intervals with the same index and remove any overlaps, left to right
   * 
   * @param {Interval[]} intervals 
   * @returns {Interval[]} Interval array
   */
  var merge = function merge(intervals) {
    if (intervals.length <= 1) return intervals;

    var result = [];

    var current = intervals[0];
    for (var i = 1; i < intervals.length; i++) {
      var next = intervals[i];

      // If current is completely overlapped by second it is merged into it
      if (current.end >= next.end) {
        continue;
        // Resolves partial overlaps by setting end of current to start of next
      } else if (calcStart(next) < current.end) {
        result.push(_extends({}, current, { end: calcStart(next) }));
        current = next;
      } else {
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
   * @param {Interval[]} highIndexes
   * @param {Interval[]} lowIndexes
   * 
   * @returns {Interval[]} Interval array
   */
  var combine = function combine(highIndexes, lowIndexes) {
    var highIndex = 0;
    var lowIndex = 0;

    var merged = [];

    while (highIndex < highIndexes.length || lowIndex < lowIndexes.length) {

      var high = highIndexes[highIndex];
      var low = lowIndexes[lowIndex];

      // Only low priority left so push low onto results
      if (highIndex === highIndexes.length) {
        merged.push(_extends({}, low));
        lowIndex++;
        // Only high priority left so push high onto results
      } else if (lowIndex === lowIndexes.length) {
        merged.push(_extends({}, high));
        highIndex++;
        // High priority start before or at same time as low
      } else if (calcStart(high) <= calcStart(low)) {
        // No overlap between low and high
        // low:                 ----------------------
        // high: ---------------
        if (high.end <= calcStart(low)) ; else if (high.end < low.end) {
          low.offsetStart = high.end - low.start;
          // Low index completely overlapped, dismiss it
          // low:               -----------
          // high: -------------------------------------
        } else {
          lowIndex++;
        }

        merged.push(_extends({}, high));
        highIndex++;
        // Low priority starts before high
      } else {
        // No overlap between low and high intervals
        // low: ---------------
        // high                ----------------------
        if (low.end <= calcStart(high)) {
          merged.push(_extends({}, low));
          lowIndex++;
          // Partial overlap where high ends after low
          // low: ---------------------
          // high                ----------------------
        } else if (high.end > low.end) {
          merged.push(_extends({}, low, { end: calcStart(high) }));
          lowIndex++;
          // Partial overlap where high ends before low
          // low: -------------------------------------
          // high             -----------
        } else {
          merged.push(_extends({}, low, { end: calcStart(high) }));
          low.offsetStart = high.end - low.start;
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
  var cmp = function cmp(a, b) {
    if (a > b) return +1;
    if (a < b) return -1;
    return 0;
  };

  exports.weightedIntervalMerge = weightedIntervalMerge;

  Object.defineProperty(exports, '__esModule', { value: true });

})));


/***/ }),

/***/ "./src/config/managerconfig.ts":
/*!*************************************!*\
  !*** ./src/config/managerconfig.ts ***!
  \*************************************/
/*! no static exports found */
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

/***/ "./src/core/track.ts":
/*!***************************!*\
  !*** ./src/core/track.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var peak_1 = __webpack_require__(/*! ../strategies/peak */ "./src/strategies/peak.ts");
var rms_1 = __webpack_require__(/*! ../strategies/rms */ "./src/strategies/rms.ts");
var weighted_interval_merge_1 = __webpack_require__(/*! weighted-interval-merge */ "./node_modules/weighted-interval-merge/dist/weighted-interval-merge.js");
var Track = /** @class */ (function () {
    function Track(id, intervals, width) {
        this.width = width;
        this._lastValue = new Float32Array(this.width * 4);
        this.id = id;
        this.intervals = intervals || [];
        this._flattened = weighted_interval_merge_1.weightedIntervalMerge(this.intervals);
    }
    Object.defineProperty(Track.prototype, "flattened", {
        get: function () {
            return this._flattened.slice();
        },
        enumerable: true,
        configurable: true
    });
    Track.prototype.flatten = function () {
        this._flattened = weighted_interval_merge_1.weightedIntervalMerge(this.intervals);
    };
    /**
     * Gets the duration of the audio in seconds
     *
     * @returns Decimal value of total duration in seconds
     */
    Track.prototype.getDuration = function () {
        return Math.max.apply(Math, this.intervals.map(function (s) { return s.end; }));
    };
    /**
     * Gets the summerized values for the current settings
     *
     * @param options
     * @param dataMap
     * @returns Two dimensional array, one entry for each pixel, for each pixel a min
     * and a max value.
     */
    Track.prototype.calculate = function (options, dataMap, start, width, shift) {
        switch (options.meterType) {
            case "peak":
                this._lastValue = peak_1.default(options, this.flattened, dataMap, start, width, shift, this._lastValue);
                break;
            default:
                this._lastValue = rms_1.default(options, this.flattened, dataMap, start, width, shift, this._lastValue);
                break;
        }
        return this._lastValue;
    };
    return Track;
}());
exports.default = Track;


/***/ }),

/***/ "./src/core/waveshaper.ts":
/*!********************************!*\
  !*** ./src/core/waveshaper.ts ***!
  \********************************/
/*! no static exports found */
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
var track_1 = __webpack_require__(/*! ./track */ "./src/core/track.ts");
var managerconfig_1 = __webpack_require__(/*! ../config/managerconfig */ "./src/config/managerconfig.ts");
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
        /**
         * @description Segment callback functions
         *
         * @readonly
         * @memberof WaveShaper
         */
        this.segmentCallbackMap = new Array();
        /**
         * @description Options callbacks
         *
         * @readonly
         * @memberof WaveShaper
         */
        this.optionsCallbacks = new Array();
        this._activeWaveShapers = [];
        this.validateOptions(options);
        this._options = __assign({}, managerconfig_1.default, options);
    }
    Object.defineProperty(WaveShaper.prototype, "options", {
        /**
         * @description Currect settings
         *
         * @readonly
         * @memberof WaveShaper
         */
        get: function () {
            return __assign({}, this._options);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WaveShaper.prototype, "activeWaveShapers", {
        /**
         * @description Active id's, redraws when draw is called without argument
         *
         * @readonly
         * @unused
         * @memberof WaveShaper
         */
        get: function () {
            return this._activeWaveShapers.slice();
        },
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
        get: function () {
            return this._lastProcessResult;
        },
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
        get: function () {
            return this._duration;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gives the position corresponding to a given time
     *
     * @param time
     */
    WaveShaper.prototype.timeToPosition = function (time) {
        return (time * this._options.samplerate) / this._options.samplesPerPixel;
    };
    /**
     * Gives the time corresponding to a given position
     * @param position
     */
    WaveShaper.prototype.positionToTime = function (position) {
        return ((position * this._options.samplesPerPixel) / this._options.samplerate);
    };
    /**
     * @description Flattens the segments of the given waveshaper id
     *
     * @param id
     * @returns WaveShaper instance
     */
    WaveShaper.prototype.flatten = function (ids) {
        var _this = this;
        if (ids === void 0) { ids = []; }
        this.getProcessIds(ids).forEach(function (id) {
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
     * @param start Start position
     * @param width Width to process
     * @param shift Units to shift current data
     *
     * @returns WaveShaper instance
     */
    WaveShaper.prototype.process = function (ids, start, width, shift) {
        if (ids === void 0) { ids = []; }
        if (start === void 0) { start = 0; }
        if (width === void 0) { width = this.options.width; }
        if (shift === void 0) { shift = 0; }
        var toProcess = this.getProcessIds(ids);
        var options = __assign({}, this.options);
        var data = [];
        for (var i = 0; i < toProcess.length; i++) {
            var id = toProcess[i];
            var wave = this.getTrack(id);
            if (wave == null)
                continue;
            var peaks = wave.calculate(options, this.audioData, start, width, shift);
            data.push({ id: id, data: peaks });
        }
        // Invoke callbacks after returning value.
        this._lastProcessResult = { options: options, data: data };
        this.invokeCallbacks(this._lastProcessResult, start, width, shift);
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
     * Adds a callback that is triggered when an Interval is updated
     *
     * @param cb Callback function
     */
    WaveShaper.prototype.onSegment = function (cb) {
        this.segmentCallbackMap.push(cb);
    };
    /**
     * Removes a previously added callback for the Interval update callback
     *
     * @param cb Callback function
     */
    WaveShaper.prototype.offSegment = function (cb) {
        var index = this.segmentCallbackMap.indexOf(cb);
        if (index !== -1) {
            this.segmentCallbackMap.splice(index, 1);
        }
    };
    /**
     * Emits a segment update
     *
     * @param old Old interval
     * @param changed Updated interval
     */
    WaveShaper.prototype.emitSegment = function (old, changed) {
        this.segmentCallbackMap.forEach(function (cb) { return cb(old, changed); });
    };
    /**
     * Adds a callback that is fired when options are updated
     *
     * @param cb Callback function
     */
    WaveShaper.prototype.onOptions = function (cb) {
        this.optionsCallbacks.push(cb);
    };
    /**
     * Removes a previously added callback
     * @param cb Callback function
     */
    WaveShaper.prototype.offOptions = function (cb) {
        var index = this.optionsCallbacks.indexOf(cb);
        if (index !== -1) {
            this.optionsCallbacks.splice(index, 1);
        }
    };
    /**
     * Emits an options update
     *
     * @param old Old options
     * @param updated New options
     */
    WaveShaper.prototype.emitOptions = function (old, updated) {
        this.optionsCallbacks.forEach(function (cb) { return cb(old, updated); });
    };
    /**
     * @description Merges the given options into the current and returns updated options
     *
     * @param options A (partial) ManagerOptions object
     * @returns WaveShaper instance
     */
    WaveShaper.prototype.setOptions = function (options) {
        this.validateOptions(options);
        var oldOptions = __assign({}, this.options);
        this._options = __assign({}, oldOptions, options);
        this.emitOptions(oldOptions, this.options);
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
        var tracks = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tracks[_i] = arguments[_i];
        }
        for (var i = 0; i < tracks.length; i++) {
            var track = tracks[i];
            var foundWave = this.getTrack(track.id);
            if (foundWave == null) {
                var wave = new track_1.default(track.id, track.intervals, this._options.width);
                this.tracks.set(track.id, wave);
            }
            else {
                foundWave.intervals = track.intervals || [];
                foundWave.flatten();
            }
        }
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
        this._activeWaveShapers = ids;
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
    WaveShaper.prototype.validateOptions = function (options) {
        var currentOptions = this._options || managerconfig_1.default;
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
    };
    /**
     * Invokes all registered callbacks registered to a waveshaper id in the data list
     *
     * @param options
     * @param data
     */
    WaveShaper.prototype.invokeCallbacks = function (result, start, width, shift) {
        for (var i = 0; i < result.data.length; i++) {
            var trackResult = result.data[i];
            var callbacks = this.callbackMap.get(trackResult.id);
            if (callbacks == null)
                continue;
            for (var j = 0; j < callbacks.length; j++) {
                var callback = callbacks[j];
                callback(result.options, new Float32Array(trackResult.data), start, width, shift);
            }
        }
    };
    WaveShaper.prototype.getProcessIds = function (ids) {
        if (ids.length > 0)
            return ids;
        if (this._activeWaveShapers.length > 0)
            return this._activeWaveShapers;
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

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var waveshaper_1 = __webpack_require__(/*! ./core/waveshaper */ "./src/core/waveshaper.ts");
exports.WaveShaper = waveshaper_1.default;
var track_1 = __webpack_require__(/*! ./core/track */ "./src/core/track.ts");
exports.Track = track_1.default;
var managerconfig_1 = __webpack_require__(/*! ./config/managerconfig */ "./src/config/managerconfig.ts");
exports.defaultConfig = managerconfig_1.default;
var rms_1 = __webpack_require__(/*! ./strategies/rms */ "./src/strategies/rms.ts");
exports.rms = rms_1.default;
var peak_1 = __webpack_require__(/*! ./strategies/peak */ "./src/strategies/peak.ts");
exports.peak = peak_1.default;


/***/ }),

/***/ "./src/strategies/peak.ts":
/*!********************************!*\
  !*** ./src/strategies/peak.ts ***!
  \********************************/
/*! no static exports found */
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
exports.default = (function (options, intervals, dataMap, startPosition, width, shift, lastValue) {
    var sampleSize = Math.ceil(options.samplesPerPixel / options.resolution);
    var start = options.scrollPosition * options.samplesPerPixel;
    var startSecond = start / options.samplerate;
    var secondsPerPixel = options.samplesPerPixel / options.samplerate;
    var calcStartSecond = startSecond + startPosition * secondsPerPixel;
    var calcEndSecond = calcStartSecond + width * secondsPerPixel;
    var absShift = Math.abs(shift) * 4;
    var shiftTarget = shift > 0 ? 0 : absShift;
    var shiftStart = shift > 0 ? absShift : 0;
    var peaks = new Float32Array(lastValue.buffer)
        .copyWithin(shiftTarget, shiftStart)
        .fill(0, startPosition * 4, (startPosition + width) * 4);
    var currentIntervalIndex = intervals.findIndex(function (i) { return i.end > calcStartSecond && i.start + i.offsetStart < calcEndSecond; });
    // There are no intervals in this range so return empty array
    if (currentIntervalIndex === -1)
        return peaks;
    var maxIntervalIncrementIndex = intervals.length - 1;
    var currentInterval = intervals[currentIntervalIndex];
    var buffer = dataMap.get(currentInterval.source);
    // For each pixel we display
    for (var i = startPosition; i < startPosition + width; i++) {
        var currentSecond = startSecond + i * secondsPerPixel;
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
            peaks.set([0, 0, 0, 0], i * 4);
            continue;
        }
        var startBorder = currentSecond - secondsPerPixel <
            currentInterval.start + currentInterval.offsetStart;
        var endBorder = currentSecond + secondsPerPixel > currentInterval.end;
        var intervalBorder = startBorder || endBorder ? 1 : 0;
        if (buffer == null) {
            peaks.set([0, 0, intervalBorder, 1], i * 4);
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
        peaks.set([min, max, intervalBorder, 1], i * 4);
    }
    return peaks;
});


/***/ }),

/***/ "./src/strategies/rms.ts":
/*!*******************************!*\
  !*** ./src/strategies/rms.ts ***!
  \*******************************/
/*! no static exports found */
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
exports.default = (function (options, intervals, dataMap, startPosition, width, shift, lastValue) {
    var sampleSize = Math.ceil(options.samplesPerPixel / options.resolution);
    var start = options.scrollPosition * options.samplesPerPixel;
    var startSecond = start / options.samplerate;
    var secondsPerPixel = options.samplesPerPixel / options.samplerate;
    var calcStartSecond = startSecond + startPosition * secondsPerPixel;
    var calcEndSecond = calcStartSecond + width * secondsPerPixel;
    var absShift = Math.abs(shift) * 4;
    var shiftTarget = shift > 0 ? 0 : absShift;
    var shiftStart = shift > 0 ? absShift : 0;
    var peaks = new Float32Array(lastValue.buffer)
        .copyWithin(shiftTarget, shiftStart)
        .fill(0, startPosition * 4, (startPosition + width) * 4);
    var currentIntervalIndex = intervals.findIndex(function (i) { return i.end > calcStartSecond && i.start + i.offsetStart < calcEndSecond; });
    // There are no intervals in this range so return empty array
    if (currentIntervalIndex === -1) {
        return peaks;
    }
    var maxIntervalIncrementIndex = intervals.length - 1;
    var currentInterval = intervals[currentIntervalIndex];
    var buffer = dataMap.get(currentInterval.source);
    // For each pixel we display
    for (var i = startPosition; i < startPosition + width; i++) {
        var currentSecond = startSecond + i * secondsPerPixel;
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
            peaks.set([0, 0, 0, 0], i * 4);
            continue;
        }
        var startBorder = currentSecond - secondsPerPixel <
            currentInterval.start + currentInterval.offsetStart;
        var endBorder = currentSecond + secondsPerPixel > currentInterval.end;
        var intervalBorder = startBorder || endBorder ? 1 : 0;
        if (buffer == null) {
            peaks.set([0, 0, intervalBorder, 1], i * 4);
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
        peaks.set([min, max, intervalBorder, 1], i * 4);
    }
    return peaks;
});


/***/ })

/******/ });
});
//# sourceMappingURL=waveshaper.js.map