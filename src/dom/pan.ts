import { ManagerOptions } from '../config/managerconfig';
import { DomRenderWaveShapeManager } from '.';

const endMargin = 500;

interface PanState {
    panStart: number;
    panMax: number;
    options: ManagerOptions | null;
}

const panState: PanState = {
    panStart: 0,
    panMax: 0,
    options: null
}

/**
 * Adds pan functionality to waveshaper
 * 
 * @param {WaveShapeManager} manager
 * @param {HammerManager} hammer
 */
export default function(manager: DomRenderWaveShapeManager, hammer: HammerManager) {

    const shouldHandle = (ev: HammerInput, options: ManagerOptions) => options.mode === 'pan' && ev.target.hasAttribute('data-wave-id');

    hammer.on('panstart', (ev) => { 
        const options = manager.options;
        if(!shouldHandle(ev, options))
            return;

        panState.panMax = manager.getScrollWidth() + endMargin;
        panState.panStart = options.scrollPosition;
    });

    hammer.on('panmove', (ev) =>  {
        panState.options = manager.options;
        if(panState.options == null || !shouldHandle(ev, panState.options))
            return;

        const position = panState.panStart - ev.deltaX;
        const newPosition = position > 0 ? position : 0;

        // If it was and is still 0 no need to update
        if(newPosition === panState.options.scrollPosition)
            return;

        if(position > panState.panMax - panState.options.width)
            return;
        
        manager.set({ scrollPosition: newPosition }).process();
    });

    hammer.on('panend', (ev) => {
        if(panState.options == null || !shouldHandle(ev, panState.options))
            return;

        panState.options = null;
        panState.panStart = 0;
        panState.panMax = 0;
    });
}