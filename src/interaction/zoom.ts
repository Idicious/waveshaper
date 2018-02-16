import WaveShaper from '../core/waveshaper';
import { WaveShapeManager } from '../core/manager';

const endMargin = 500;

const zoomState = {
    maxWidth: 0,
    sppStart: 0
}

/**
 * Adds pinch zoom functionality to waveshaper
 * 
 * @param {WaveShapeManager} manager
 * @param {HammerManager} hammer
 */
export default function(manager: WaveShapeManager, hammer: HammerManager) {

    const shouldHandle = (ev: HammerInput) => manager.mode === 'pan' && ev.target.classList.contains('waveshaper');

    hammer.on('pinchstart', (ev) => {
        if(!shouldHandle(ev))
            return;

        zoomState.sppStart = manager.samplesPerPixel;
        zoomState.maxWidth = manager.getScrollWidth() + endMargin;
    });

    hammer.on('pinchmove', (ev) => {
        if(!shouldHandle(ev))
            return;

        const sampleAtLeft = manager.scrollPosition * manager.samplesPerPixel;
        const samplesInView = manager.width * manager.samplesPerPixel;
        const samplesToCenter = samplesInView / 2;

        const newSpp = zoomState.sppStart * ev.scale;
        const newSamplesInView = manager.width * newSpp;
        const newSamplesToCenter = newSamplesInView / 2;

        const maxWidth = manager.getScrollWidth() + endMargin;
        const maxSamplesInView = maxWidth  * manager.samplerate;

        if(newSamplesInView >= maxSamplesInView)
            return;

        const newScroll = (sampleAtLeft + samplesToCenter - newSamplesToCenter) / newSpp;

        manager.samplesPerPixel = newSpp;
        manager.scrollPosition = newScroll >= 0 ? newScroll : 0;

        manager.draw(null, false);
    });

    hammer.on('pinchend', (ev) => {
        if(!shouldHandle(ev))
            return;

        zoomState.sppStart = 0;
        zoomState.maxWidth = 0;
    });
}