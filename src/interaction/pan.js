import { WaveShaper } from '../core/waveshaper';
import { WaveShapeManager } from '../core/manager';
import * as Hammer from 'hammerjs';

/**
 * Adds drag functionality to waveshaper
 * 
 * @param {WaveShapeManager} manager
 * @param {HTMLElement} container
 */
export const setupPan = function(manager, container) {
    const hammer = new Hammer(container);

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
}