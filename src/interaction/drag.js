import { WaveShaper } from '../core/waveshaper';
import { WaveShapeManager } from '../core/manager';
import * as Hammer from 'hammerjs';

/**
 * Adds drag functionality to waveshaper
 * 
 * @param {WaveShapeManager} manager
 * @param {Hammer} hammer
 * @param {HTMLElement} container
 */
export const setupDrag = function(manager, hammer, container) {

    /**
     * Fires when the mouse moves into the canvas,
     * if a segment from another waveshaper is being dragged
     * it is transferred to the current one.
     */
    container.addEventListener('mousemove', ev => mouseHover(ev));
    container.addEventListener('touchemove', ev => mouseHover(ev));

    /**
     * Sets up the drag by finding the 
     */
    hammer.on('panstart', (ev) => { 
        if(manager.mode !== 'drag')
            return;
            
        const id = ev.target.getAttribute('data-wave-id');
        const wave = manager.waveShapers.get(+id);

        const bb = ev.target.getBoundingClientRect();
        const time = (manager.scrollPosition + (ev.center.x - bb.left)) * manager.samplesPerPixel / manager.samplerate;
        const interval = wave.flattened.find(i => i.start <= time && i.end >= time);

        if(interval == null) 
            return;

        manager.activeSegment = wave.segments.find(s => s.id === interval.id);
        manager.activeSegmentStart = manager.activeSegment.start;

        manager.activeSegment.index = 1000;
        manager.dragWave = wave;
    });

    hammer.on('pan', (ev) =>  {
        if(manager.mode !== 'drag')
            return;

        if(manager.activeSegment == null)
            return;

        const change = (ev.deltaX * manager.samplesPerPixel) / manager.samplerate;
        let newTime = manager.activeSegmentStart + change;

        if(newTime + manager.activeSegment.offsetStart < 0) {
            newTime = -manager.activeSegment.offsetStart;
        }
        
        manager.activeSegment.start = newTime;
        manager.dragWave.flatten();
        manager.draw([manager.dragWave.id], true);
    });

    hammer.on('panend', (ev) => {
        if(manager.mode !== 'drag')
            return;

        manager.activeSegment = null;
        manager.activeSegmentStart = null;
        manager.dragWave = null;
    });

    const mouseHover = (ev) => {
        if(manager.mode !== 'drag')
            return;
            
        if(manager.activeSegment == null && manager.dragWave == null)
            return;

        const canvas = container.querySelector('canvas:hover');
        if(canvas == null)
            return;

        const id = canvas.getAttribute('data-wave-id');
        const wave = manager.waveShapers.get(+id);

        if(manager.dragWave.id !== +id) {
            const index = manager.dragWave.segments.indexOf(manager.activeSegment);
            manager.dragWave.segments.splice(index, 1);

            manager.dragWave.flatten();
            manager.draw([manager.dragWave.id], true);

            wave.segments.push(manager.activeSegment);
            manager.activeSegment.index = 1000;

            wave.flatten();
            manager.draw([wave.id], true);

            manager.dragWave = wave;
        } 
    }
}