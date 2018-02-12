import { WaveShaper } from '../core/waveshaper';
import { WaveShapeManager } from '../core/manager';
import * as Hammer from 'hammerjs';

/**
 * Adds drag functionality to waveshaper
 * 
 * @param {WaveShapeManager} manager
 * @param {Hammer} hammer
 */
export const setupPan = function(manager, hammer) {
    hammer.on('panstart', (ev) => { 
        if(manager.mode !== 'pan')
            return;

        manager.panStart = manager.scrollPosition;
    });

    hammer.on('pan', (ev) =>  {
        if(manager.mode !== 'pan')
            return;

        const newPosition = manager.panStart - ev.deltaX;
        if(newPosition < 0)
            return;
        
        manager.scrollPosition = newPosition;
        manager.draw();
    });

    hammer.on('panend', (ev) => {
        if(manager.mode !== 'pan')
            return;

        manager.panStart = null;
    });

    hammer.on('pinchstart', (ev) => {
        if(manager.mode !== 'pan')
            return;

        manager.sppStart = manager.samplesPerPixel;
    });

    hammer.on('pinchmove', (ev) => {
        if(manager.mode !== 'pan')
            return;

        const sampleAtLeft = (manager.scrollPosition * manager.samplesPerPixel);
        const samplesToCenter = ((manager._width / 2) * manager.samplesPerPixel);

        const newSpp = manager.sppStart * ev.scale;
        const newSamplesToCenter = ((manager._width / 2) * newSpp);
        const newScroll = (sampleAtLeft + samplesToCenter - newSamplesToCenter) / newSpp;

        manager.samplesPerPixel = newSpp;
        manager.scrollPosition = newScroll < 0 ? 0 : newScroll;

        manager.draw();
    });

    hammer.on('pinchend', (ev) => {
        if(manager.mode !== 'pan')
            return;

        manager.sppStart = null;
    });
}