import WaveShapeManager from "../core/manager";
import * as Hammer from "hammerjs";

import hammerConfig from './hammerconfig';
import cut from './cut';
import drag from './drag';
import pan from './pan';
import zoom from './zoom';
import resize from './resize';
import line from './line';
import { ManagerOptions } from "../config/managerconfig";

/**
 * @description Sets up touch and mouse interaction with the canvasses. When using this
 * you should use the registerCanvas method as it ensures the canvasses have the correct
 * classes and attributes.
 * 
 * @param manager 
 * @param container 
 */
export const addInteraction = (manager: DomRenderWaveShapeManager, elementId: string) => {

    const element = document.getElementById(elementId);
    if(element == null) throw Error('Interaction container element could not be found.');

    const hammer = new Hammer(element, hammerConfig);

    drag(manager, hammer, window.document.body);
    cut(manager, hammer);
    pan(manager, hammer);
    zoom(manager, hammer);
    resize(manager, hammer);
}

/**
 * Extends WaveShapeManager to allow for easy canvas rendering registration.
 * 
 * @inheritDoc
 */
export class DomRenderWaveShapeManager extends WaveShapeManager {
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
    registerCanvas(id: string, canvas: HTMLCanvasElement, color: string): () => void {
        const ctx = canvas.getContext('2d');
        if(ctx == null) throw Error('Cannot get context from canvas.');

        // Add classes and data attributes
        canvas.classList.add('waveshaper');
        canvas.setAttribute('data-wave-id', id);

        canvas.style.width = this.options.width + 'px';
        canvas.style.height = this.options.height + 'px';

        const scale = (devicePixelRatio || 1) < 1 ? 1 : (devicePixelRatio || 1);

        canvas.width = this.options.width * scale;
        canvas.height = this.options.height;
        
        ctx.scale(scale, 1)

        const callBack = (options: ManagerOptions, data: Float32Array) => line(data, options, ctx, color)
        this.on(id, callBack);

        return () => this.off(id, callBack);
    }

    /**
     * Gets the duration of the audio as a date
     * 
     * @returns Date containing audio length
     * @memberof WaveShapeManager
     */
    getDurationAsDate(): Date {
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
    getScrollWidth(): number {
        return (this._duration * this._options.samplerate) / this._options.samplesPerPixel;
    }
}