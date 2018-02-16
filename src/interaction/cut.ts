import WaveShaper from '../core/waveshaper';
import { WaveShapeManager } from '../core/manager';
import Interval from '../models/interval';
import Segment from '../models/segment';

/**
 * Adds drag functionality to waveshaper
 * 
 * @param {WaveShapeManager} manager
 * @param {HammerManager} hammer
 */
export default (manager: WaveShapeManager, hammer: HammerManager) => {

    const shouldHandle = (ev: HammerInput) => manager.mode === 'cut' && ev.target.classList.contains('waveshaper');

    hammer.on('tap', (ev: HammerInput) => { 
        if(!shouldHandle(ev))
            return;

        const id = ev.target.getAttribute('data-wave-id');
        const wave = manager.waveShapers.get(id);

        const bb = ev.target.getBoundingClientRect();
        const time = (manager.scrollPosition + (ev.center.x - bb.left)) * manager.samplesPerPixel / manager.samplerate;
        const interval = wave.flattened.find(i => i.start <= time && i.end >= time);

        if(interval == null) 
            return;

        const segment = wave.segments.find(s => s.id === interval.id);

        const cutTime = time - segment.start;

        const newSegment = { ...segment }
        newSegment.offsetStart = cutTime;
        newSegment.id = Math.random().toString();

        segment.offsetEnd = segment.duration - cutTime;
        wave.segments.push(newSegment);
        
        wave.flatten();
        manager.draw([wave.id], true);
    });
}