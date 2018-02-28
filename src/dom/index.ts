import WaveShaper from "../core/waveshaper";
import * as Hammer from "hammerjs";

import hammerConfig from './hammerconfig';
import cut from './cut';
import drag from './drag';
import pan from './pan';
import zoom from './zoom';
import resize from './resize';
import line from './line';
import { ManagerOptions } from "../config/managerconfig";

const noop = () => { };

/**
 * @description Sets up touch and mouse interaction with the canvasses. When using this
 * you should use the registerCanvas method as it ensures the canvasses have the correct
 * classes and attributes.
 * 
 * @param manager 
 * @param container 
 */
const addInteraction = (manager: DomRenderWaveShaper, element: HTMLElement): () => void => {
    if(element == null) throw Error('Interaction container element could not be found.');

    const hammer = new Hammer(element, hammerConfig);

    const destroy = drag(manager, hammer, element);
    cut(manager, hammer);
    pan(manager, hammer);
    zoom(manager, hammer);
    resize(manager, hammer);

    return () => {
        hammer.destroy();
        destroy();
    };
}

/**
 * Extends WaveShapeManager to allow for easy canvas rendering registration.
 * 
 * @inheritDoc
 */
export default class DomRenderWaveShaper extends WaveShaper {
    private unregister: () => void = noop;

    private canvasMap = new Map<string, () => void>();

    public get scrollWidth(): number { return (this._duration * this._options.samplerate) / this._options.samplesPerPixel }

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
    registerCanvas(id: string, canvas: HTMLCanvasElement, color: string): DomRenderWaveShaper {
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

        this.unregisterCanvas(id)
        this.canvasMap.set(id, () => this.off(id, callBack));
        return this;
    }

    /**
     * Clears the callbacks associated with this canvas
     * 
     * @param id 
     * @returns Instance of WaveShaper
     */
    unregisterCanvas(id: string): DomRenderWaveShaper {
        const unregister = this.canvasMap.get(id);
        if(unregister != null) {
            unregister();
            this.canvasMap.delete(id);
        }

        return this;
    }

    /**
     * Registers event listeners to given element which handle interaction,
     * events are delegated so canvasses should be direct or indirect children
     * of given element.
     * 
     * @param element 
     * @returns Current WaveShaper instance
     */
    setInteraction(element: HTMLElement): DomRenderWaveShaper {
        this.unregister();
        this.unregister = addInteraction(this, element);

        return this;
    }

    /**
     * Removes event listeners from previously called setInteraction
     * 
     * @returns Current WaveShaper instance
     */
    clearInteraction(): DomRenderWaveShaper {
        this.unregister();
        this.unregister = noop;

        return this;
    }

    /**
     * Loads and saves a set of url's to audio files.
     * 
     * @param ctx 
     * @param data 
     */
    loadData(ctx: AudioContext, ...data: { id: string, url: string }[]): DomRenderWaveShaper {
        data.forEach(dat => {
            fetch(dat.url)
            .then(res => res.arrayBuffer())
            .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                this.setData({ id: dat.id, data: audioBuffer.getChannelData(0) }).process();
            })
            .catch(e => console.log(e));
        });
        
        return this;
    }
}