import WaveShapeManager from '../core/manager';
import { ManagerOptions } from '../config/managerconfig';

/**
 * Adds drag functionality to waveshaper
 * 
 * @param {WaveShapeManager} manager
 * @param {HammerManager} hammer
 */
export default (manager: WaveShapeManager, hammer: HammerManager) => {

    const shouldHandle = (ev: HammerInput, options: ManagerOptions) => options.mode === 'cut' && ev.target.hasAttribute('data-wave-id');

    hammer.on('tap', (ev: HammerInput) => { 
        const options = manager.options;
        if(options == null || !shouldHandle(ev, options))
            return;

        const id = ev.target.getAttribute('data-wave-id');
        if(id == null) return;

        const wave = manager.getTrack(id);
        if(wave == null) return;

        const bb = ev.target.getBoundingClientRect();
        const time = (options.scrollPosition + (ev.center.x - bb.left)) * options.samplesPerPixel / options.samplerate;

        const interval = wave.flattened.find(i => i.start <= time && i.end >= time);
        if(interval == null) return;

        const segment = wave.segments.find(s => s.id === interval.id);
        if(segment == null) return;

        const cutTime = time - segment.start;

        const newSegment = { ...segment }
        newSegment.offsetStart = cutTime;
        newSegment.id = options.generateId();

        segment.offsetEnd = segment.duration - cutTime;
        wave.segments.push(newSegment);
        
        manager.flatten(wave.id);
        manager.process(wave.id);
    });
}