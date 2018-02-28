import WaveShaper from '../core/waveshaper';
import { ManagerOptions } from '../config/managerconfig';
import Interval from '../models/interval';

/**
 * Adds drag functionality to waveshaper
 * 
 * @param manager
 * @param hammer
 */
export default (manager: WaveShaper, hammer: HammerManager) => {

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
        const time = (options.scrollPosition + (ev.center.x - bb.left)) * (options.samplesPerPixel / options.samplerate);

        const interval = wave.flattened.find(i => i.start + i.offsetStart <= time && i.end >= time);
        if(interval == null) return;

        const segment = wave.intervals.find(s => s.id === interval.id);
        if(segment == null) return;

        const newSegment: Interval = { 
            ...segment, 
            offsetStart: time - segment.start,
            id: options.generateId() 
        };

        segment.end = time;
        wave.intervals.push(newSegment);
        
        manager.flatten(wave.id);
        manager.process(wave.id);
    });
}