import defaultoptions, { DrawStyle, MeterType } from '../config/managerconfig';
import { calculatePeaks } from '../strategies/calculate/peak'
import { calculateRms } from '../strategies/calculate/rms'
import { drawCanvasLine } from '../strategies/render/canvas/line';
import Segment from '../models/segment';
import { flattenSegments } from '../methods/flatten';
import Interval from '../models/interval';
import { drawCanvasRect } from '../strategies/render/canvas/rect';

interface LastDrawValues {
    meterType: MeterType;
    sampleSize: number;
    samplesPerPixel: number,
    scrollPosition: number,
    samplerate: number
}

class WaveShaper {
    id: string;
    color: string;
    element: HTMLCanvasElement;
    segments: Segment[];
    flattened: Interval[];
    ctx: CanvasRenderingContext2D;
    calculated: number[][];
    width: number;
    height: number;
    skipDraw: boolean = false;
    lastValues: LastDrawValues;

    constructor(id: string, element: HTMLCanvasElement, segments: Segment[], width: number, height: number, color: string) {
        this.id = id;
        this.color = color;
        this.element = element;
        this.segments = segments;
        this.width = width;
        this.height = height;

        this.flattened = flattenSegments(this.segments);

        element.style.width = width + 'px';
        element.style.height = height + 'px';
        element.classList.add('waveshaper');

        element.width = width * devicePixelRatio;
        element.height = height;

        this.ctx = element.getContext('2d');

        const scale = (devicePixelRatio || 1) < 1 ? 1 : (devicePixelRatio || 1);
        this.ctx.scale(scale, 1);


    }

    flatten() {
        this.flattened = flattenSegments(this.segments);
    }

    /**
     * Gets the duration of the audio in seconds
     * 
     * @returns {number} Decimal value of total duration in seconds
     */
    getDuration(): number {
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
     * @returns {Date} Date containing audio length
     */
    getDurationAsDate(): Date {
        var date = new Date(0);
        date.setTime(this.getDuration() * 1000);
        return date;
    }

    /**
     * Gets the width of scrollbar needed to scroll through the entire audio file
     * 
     * @param {number} samplesPerPixel 
     * @param {number} samplerate 
     * @returns {number} Scroll width in pixels for the entire audio file
     */
    getScrollWidth(samplesPerPixel: number, samplerate: number) {
        let maxLength = this.getDuration();
        return maxLength * samplerate / samplesPerPixel;
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
    calculate(meterType: MeterType, sampleSize: number, samplesPerPixel: number, scrollPosition: number, 
        samplerate: number, forceDraw: boolean, dataMap: Map<string, Float32Array>): number[][] {
        if (!forceDraw && this.lastValues != null && this.lastValues.meterType === meterType && this.lastValues.sampleSize === sampleSize &&
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
    draw(drawStyle: DrawStyle) {
        if (!this.skipDraw) {
            drawCanvasLine(
                this.calculated,
                this.height,
                this.width,
                this.ctx,
                drawStyle,
                this.color
            );
        }
    }

}

export default WaveShaper;
export {
    WaveShaper,
    LastDrawValues
}