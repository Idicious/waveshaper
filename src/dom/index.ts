import WaveShaper from "../core/waveshaper";
import * as Hammer from "hammerjs";

import hammerConfig from './hammerconfig';
import cut from './cut';
import drag from './drag';
import pan from './pan';
import zoom from './zoom';
import resize from './resize';
import line from './line';
import defaultDomOptions, { DomInput, DomOptions } from "./dom-config";

/**
 * Extends WaveShapeManager to allow for easy canvas rendering registration.
 * 
 * @inheritDoc
 */
export default class DomRenderWaveShaper extends WaveShaper {
    private unregisterMap = new Map<string, () => void>();

    private canvasMap = new Map<string, () => void>();

    public get scrollWidth(): number { return (this._duration * this._options.samplerate) / this._options.samplesPerPixel }

    public get options(): DomOptions { return { ...this._options }; }
    protected _options: DomOptions;

    constructor(options: DomInput = defaultDomOptions) {
        super(options);

        this._options = { ...defaultDomOptions, ...this._options };
    }

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

        const callBack = (options: DomOptions, data: Float32Array) => line(data, options, ctx, color)
        this.on(id, callBack);

        this.unregisterCanvas(id)
        this.canvasMap.set(id, () => this.off(id, callBack));

        const unregister = this.addInteraction(canvas);
        this.unregisterMap.set(id, unregister);

        // If registerSetsActive is true 
        if(this._options.registerSetsActive) {
            if(this.activeWaveShapers) this.setActive(...this.activeWaveShapers.concat(id));
            else this.setActive(id);
        }

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

        const unregisterEvents = this.unregisterMap.get(id);
        if(unregisterEvents != null) {
            unregisterEvents();
            this.unregisterMap.delete(id);
        }

        if(this._options.registerSetsActive) {
            if(this.activeWaveShapers) {
                const index = this.activeWaveShapers.indexOf(id);
                if(index != -1) this.setActive(...this.activeWaveShapers.splice(index, 1))
            }
        }

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

    addInteraction (element: HTMLCanvasElement): () => void {
        if(element == null) throw Error('Interaction container element could not be found.');
    
        element.setAttribute('touch-action', 'none');
        const hammer = new Hammer(element, hammerConfig);
    
        const destroy = drag(this, hammer, element);
        cut(this, hammer);
        pan(this, hammer);
        zoom(this, hammer);
        resize(this, hammer);
    
        return () => {
            hammer.destroy();
            destroy();
        };
    }
}