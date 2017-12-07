import {
    defaultOptions
} from '../defaults';
import {
    calculatePeaks
} from '../strategies/calculate/peak'
import {
    calculateRms
} from '../strategies/calculate/rms'
import {
    drawDoubleLoop
} from '../strategies/render/double-loop';
import {
    Segment
} from '../models/segment';
import {
    flattenSegments
} from '../methods/flatten';
import {
    Interval
} from '../models/interval';

/**
 * Default constructor 
 * 
 * @param {string} id
 * @param {HTMLCanvasElement} canvas
 * @param {Segment[]} segments 
 * @param {Interval[]} flattened
 */
export function WaveShaper(id, canvas, segments) {
    this.id = id;
    this.canvas = canvas;
    this.segments = segments;
    this.flatten();
    this.canvas.width = canvas.clientWidth;
    this.canvas.height = canvas.clientHeight;
    this.calculated;

    this.offScreenCanvas = document.createElement('canvas');
    this.offScreenCanvas.width = this.canvas.width;
    this.offScreenCanvas.height = this.canvas.height;

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.ctx = canvas.getContext('2d');
    this.offScreenCtx = this.offScreenCanvas.getContext('2d');
}

WaveShaper.prototype.flatten = function () {
    this.flattened = flattenSegments(this.segments);
}

/**
 * Gets the duration of the audio in seconds
 * 
 * @param {number} samplesPerPixel 
 * @returns {number} Decimal value of total duration in seconds
 */
WaveShaper.prototype.getDuration = function () {
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
 * Gets the duration of the audio as a date
 * 
 * @param {number} samplesPerPixel 
 * @returns {Date} Date containing audio length
 */
WaveShaper.prototype.getDurationAsDate = function (samplesPerPixel) {
    var date = new Date(0);
    date.setTime(this.getDuration(samplerate) * 1000);
    return date;
}

/**
 * Gets the width of scrollbar needed to scroll through the entire audio file
 * 
 * @param {number} samplesPerPixel 
 * @param {number} samplerate 
 * @returns {number} Scroll width in pixels for the entire audio file
 */
WaveShaper.prototype.getScrollWidth = function (samplesPerPixel, samplerate) {
    let maxLength = this.getDuration();
    return maxLength * samplerate / samplesPerPixel;
}

WaveShaper.prototype.lastValues = {
    meterType: null,
    sampleSize: null,
    samplesPerPixel: null,
    scrollPosition: null,
    samplerate: null
}

WaveShaper.prototype.skipDraw = false;

/**
 * Gets the summerized values for the current settings
 * 
 * @param {string} meterType
 * @param {number} sampleSize
 * @param {number} samplesPerPixel
 * @param {number} scrollPosition
 * @param {boolean} forceDraw
 * @returns {Array} Two dimensional array, one entry for each pixel, for each pixel a min
 * and a max value.
 */
WaveShaper.prototype.calculate = function (meterType, sampleSize, samplesPerPixel, scrollPosition, samplerate, forceDraw) {
    if (!forceDraw && this.lastValues.meterType === meterType && this.lastValues.sampleSize === sampleSize &&
        this.lastValues.samplesPerPixel === samplesPerPixel && this.lastValues.scrollPosition === scrollPosition &&
        this.lastValues.samplerate === samplerate) {

        this.skipDraw = true;
        return this.calculated;
    } else {
        this.skipDraw = false;
        this.lastValues = {
            meterType,
            sampleSize,
            samplesPerPixel,
            scrollPosition,
            samplerate
        }
    }

    
    switch (meterType) {
        case 'peak':
            this.calculated = calculatePeaks(
                sampleSize,
                samplesPerPixel,
                this.width,
                this.flattened,
                scrollPosition,
                samplerate
            );
            break;
        default:
            this.calculated = calculateRms(
                sampleSize,
                samplesPerPixel,
                this.width,
                this.height,
                this.flattened,
                scrollPosition,
                samplerate,
                this.ctx,
                this.offScreenCtx
            );
    }
    
    return this.calculated;
}

/**
 * Draws the waveform to the canvas with current settings
 * 
 * @param {string} drawStyle
 */
WaveShaper.prototype.draw = function (drawStyle) {
    if (!this.skipDraw) {
        drawDoubleLoop(
            this.calculated,
            this.height,
            this.width,
            this.ctx,
            this.offScreenCtx,
            drawStyle
        );
    }
}