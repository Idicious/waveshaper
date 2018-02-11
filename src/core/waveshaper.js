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
    drawCanvasLine
} from '../strategies/render/canvas/line';
import {
    Segment
} from '../models/segment';
import {
    flattenSegments
} from '../methods/flatten';
import {
    Interval
} from '../models/interval';
import { drawSvgPath } from '../strategies/render/svg/path';
import { drawCanvasRect } from '../strategies/render/canvas/rect';

/**
 * Default constructor 
 * 
 * @param {string} id
 * @param {HTMLCanvasElement} canvas
 * @param {Segment[]} segments 
 * @param {Interval[]} flattened
 * @param {number} width
 * @param {number} height
 */
export function WaveShaper(id, element, segments, width, height) {
    this.id = id;
    this.element = element;
    this.segments = segments;
    this.flatten();
    this.element.width = width;
    this.element.height = height;
    this.calculated;

    this.width = this.element.width;
    this.height = this.element.height;
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
 * @param {Map<string, Float32Array>} dataMap
 * @returns {Array} Two dimensional array, one entry for each pixel, for each pixel a min
 * and a max value.
 */
WaveShaper.prototype.calculate = function (meterType, sampleSize, samplesPerPixel, scrollPosition, samplerate, forceDraw, dataMap) {
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
                samplerate,
                dataMap
            );
            break;
        default:
            this.calculated = calculateRms(
                sampleSize,
                samplesPerPixel,
                this.width,
                this.flattened,
                scrollPosition,
                samplerate,
                dataMap
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
        drawCanvasLine(
            this.calculated,
            this.height,
            this.width,
            this.element,
            drawStyle
        );
    }
}