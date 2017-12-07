import { WaveShaper } from '../core/waveshaper';
import { WaveShapeManager } from '../core/manager';
import * as Hammer from 'hammerjs';

/**
 * Adds drag functionality to waveshaper
 * 
 * @param {WaveShapeManager} manager
 * @param {HTMLElement} container
 */
export const setupCut = function(manager, container) {
    const hammer = new Hammer(container);

    hammer.on('tap', (ev) => { 
        const id = ev.target.getAttribute('data-wave-id');
        const wave = manager.waveShapers.get(+id);

        const bb = ev.target.getBoundingClientRect();
        const time = (manager.scrollPosition + (ev.center.x - bb.left)) * manager.samplesPerPixel / manager.samplerate;
        const interval = wave.flattened.find(i => i.start <= time && i.end >= time);

        if(interval == null) 
            return;

        const segment = wave.segments.find(s => s.id === interval.id);
        const cutTime = time - segment.start;

        const newSegment = Object.assign({}, segment);
        newSegment.offsetStart = cutTime;
        newSegment.id = Math.random();

        segment.offsetEnd = segment.duration - cutTime;
        wave.segments.push(newSegment);
        
        wave.flatten();
        manager.draw([wave.id], true);
    });
}