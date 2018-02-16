import WaveShaper from '../core/waveshaper';
import WaveShapeManager from '../core/manager';

const endMargin = 500;

const panState = {
    panStart: 0,
    panMax: 0
}

/**
 * Adds pan functionality to waveshaper
 * 
 * @param {WaveShapeManager} manager
 * @param {HammerManager} hammer
 */
export default function(manager: WaveShapeManager, hammer: HammerManager) {

    /** @param {HammerInput} ev */
    const shouldHandle = (ev: HammerInput) => manager.mode === 'pan' && ev.target.classList.contains('waveshaper');

    hammer.on('panstart', (ev) => { 
        if(!shouldHandle(ev))
            return;

        panState.panMax = manager.getScrollWidth() + endMargin;
        panState.panStart = manager.scrollPosition;
    });

    hammer.on('panmove', (ev) =>  {
        if(!shouldHandle(ev))
            return;

        const newPosition = panState.panStart - ev.deltaX;

        if(newPosition < 0)
            return;

        if(newPosition > panState.panMax - manager.width)
            return;
        
        manager.scrollPosition = newPosition;
        manager.draw(null, false);
    });

    hammer.on('panend', (ev) => {
        if(!shouldHandle(ev))
            return;

        panState.panStart = 0;
        panState.panMax = 0;
    });
}