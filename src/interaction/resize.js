import { WaveShaper } from '../core/waveshaper';
import { WaveShapeManager } from '../core/manager';
import * as Hammer from 'hammerjs';

/**
 * Adds drag functionality to waveshaper
 * 
 * @param {WaveShapeManager} manager
 * @param {HTMLElement} container
 */
export const setupResize = function(manager, container) {
    const hammer = new Hammer(container);

    hammer.on('panstart', (ev) => { 
        if(manager.mode !== 'resize')
            return;

        const id = ev.target.getAttribute('data-wave-id');
        const wave = manager.waveShapers.get(+id);

        const bb = ev.target.getBoundingClientRect();
        const time = (manager.scrollPosition + (ev.center.x - bb.left)) * manager.samplesPerPixel / manager.samplerate;
        const interval = wave.flattened.find(i => i.start <= time && i.end >= time);

        if(interval == null) 
            return;

        manager.activeSegmentSide = 
            time < interval.start + ((interval.end - interval.start) / 2) ? 
                'left' : 
                'right';

        manager.activeSegment = wave.segments.find(s => s.id === interval.id);

        manager.activeSegmentOffsetStart = manager.activeSegment.offsetStart;
        manager.activeSegmentOffsetEnd = manager.activeSegment.offsetEnd;

        manager.activeSegment.index = 1000;
        manager.dragWave = wave;
    });

    hammer.on('pan', (ev) =>  {
        if(manager.mode !== 'resize')
            return;
            
        if(manager.activeSegment == null)
            return;

        const change = (ev.deltaX * manager.samplesPerPixel) / manager.samplerate;
        let newTime = manager.activeSegmentSide === 'left' ?
             manager.activeSegmentOffsetStart + change :
             manager.activeSegmentOffsetEnd - change;

        // Don't allow offset to become less than 0
        if(newTime < 0) {
            newTime = 0;
        }

        const active = manager.activeSegment;
        const newDuration = manager.activeSegmentSide === 'left' ?
            active.end - active.start - newTime - active.offsetEnd :
            active.end - active.start - active.offsetStart - newTime;

        // Do not allow resizing 
        if(newDuration <= 2) {
            return;
        }
        
        manager.activeSegmentSide === 'left' ?
            active.offsetStart = newTime :
            active.offsetEnd = newTime;

        manager.dragWave.flatten();
        manager.draw([manager.dragWave.id], true);
    });

    hammer.on('panend', (ev) => {
        if(manager.mode !== 'resize')
            return;

        manager.activeSegment = null;
        manager.activeSegmentStart = null;
        manager.dragWave = null;
    });
}