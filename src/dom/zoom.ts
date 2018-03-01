import DomRenderWaveShaper from './';
import { DomOptions } from './dom-config';

const endMargin = 500;

interface ZoomState {
    maxWidth: number;
    sppStart: number;
    options: DomOptions | null;
}

const zoomState: ZoomState = {
    maxWidth: 0,
    sppStart: 0,
    options: null
}

/**
 * Adds pinch zoom functionality to waveshaper
 * 
 * @param manager
 * @param hammer
 */
export default function(manager: DomRenderWaveShaper, hammer: HammerManager) {

    const shouldHandle = (target: HTMLElement, options: DomOptions) => options.mode === 'pan' && target.hasAttribute('data-wave-id');

    hammer.on('pinchstart', (ev) => {
        const options = manager.options;
        const target = manager.options.getEventTarget(ev.srcEvent);
        if(!shouldHandle(target, options))
            return;

        zoomState.sppStart = options.samplesPerPixel;
        zoomState.maxWidth = manager.scrollWidth + endMargin;
    });

    hammer.on('pinchmove', (ev) => {
        zoomState.options = manager.options;
        const target = manager.options.getEventTarget(ev.srcEvent);
        if(zoomState.options == null || !shouldHandle(target, zoomState.options))
            return;

        const sampleAtLeft = zoomState.options.scrollPosition * zoomState.options.samplesPerPixel;
        const samplesInView = zoomState.options.width * zoomState.options.samplesPerPixel;
        const samplesToCenter = samplesInView / 2;

        const newSpp = zoomState.sppStart * ev.scale;

        const newSamplesInView = zoomState.options.width * newSpp;
        const newSamplesToCenter = newSamplesInView / 2;

        const maxWidth = manager.scrollWidth + endMargin;
        const maxSamplesInView = maxWidth  * zoomState.options.samplerate;

        if(newSamplesInView >= maxSamplesInView)
            return;

        const newScroll = (sampleAtLeft + samplesToCenter - newSamplesToCenter) / newSpp;

        manager.setOptions({
            samplesPerPixel: newSpp,
            scrollPosition: newScroll >= 0 ? newScroll : 0
        }).process();
    });

    hammer.on('pinchend', (ev) => {
        const target = manager.options.getEventTarget(ev.srcEvent);
        if(zoomState.options == null || !shouldHandle(target, zoomState.options))
            return;

        zoomState.sppStart = 0;
        zoomState.maxWidth = 0;
        zoomState.options = null;
    });
}