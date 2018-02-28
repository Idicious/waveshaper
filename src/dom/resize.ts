import Track from '../core/track';
import WaveShaper from '../core/waveshaper';
import Interval from '../models/interval';
import { ManagerOptions } from '../config/managerconfig';

declare type SegmentSide = 'left' | 'right';

interface ResizeState {
    activeSegment: Interval | null;
    activeSegmentSide: SegmentSide | null;
    activeSegmentOffsetStart: number;
    activeSegmentOffsetEnd: number;
    dragWave: Track | null;
    options: ManagerOptions | null;
}

const resizeState: ResizeState = {
    activeSegment: null,
    activeSegmentSide: null,
    activeSegmentOffsetStart: 0,
    activeSegmentOffsetEnd: 0,
    dragWave: null,
    options: null
}

/**
 * Adds drag functionality to waveshaper
 * 
 * @param manager
 * @param hammer
 */
export default function(manager: WaveShaper, hammer: HammerManager) {

    const shouldHandle = (target: HTMLElement, options: ManagerOptions) => options.mode === 'resize' && target != null && target.hasAttribute('data-wave-id');

    hammer.on('panstart', (ev) => { 
        const options = manager.options;
        const target = manager.options.getEventTarget(ev.srcEvent);
        if(!shouldHandle(target, options))
            return;

        const id = target.getAttribute('data-wave-id');
        if(id == null) return;

        const wave = manager.getTrack(id);
        if(wave == null) return;

        const bb = ev.target.getBoundingClientRect();
        const time = (options.scrollPosition + (ev.center.x - bb.left)) * options.samplesPerPixel / options.samplerate;

        const interval = wave.flattened.find(i => i.start + i.offsetStart <= time && i.end >= time);

        if(interval == null) 
            return;

        resizeState.activeSegmentSide = 
            time < interval.start + interval.offsetStart + ((interval.end - (interval.start + interval.offsetStart)) / 2) ? 
                'left' : 
                'right';

        const segment = wave.intervals.find(s => s.id === interval.id);
        if(segment == null) return;

        resizeState.options = options;
        resizeState.activeSegment = segment;

        resizeState.activeSegmentOffsetStart = segment.offsetStart;
        resizeState.activeSegmentOffsetEnd = segment.end;

        segment.index = 1000;
        resizeState.dragWave = wave;
    });

    hammer.on('panmove', (ev) =>  {
        const target = manager.options.getEventTarget(ev.srcEvent);
        if(resizeState.dragWave == null || resizeState.options == null || !shouldHandle(target, resizeState.options))
            return;

        const options = manager.options;
            
        if(resizeState.activeSegment == null)
            return;

        const change = (ev.deltaX * options.samplesPerPixel) / options.samplerate;
        let newTime = resizeState.activeSegmentSide === 'left' ?
            resizeState.activeSegmentOffsetStart + change :
            resizeState.activeSegmentOffsetEnd + change;

        // Don't allow offset to become less than 0
        if(newTime < 0) {
            newTime = 0;
        }

        const active = resizeState.activeSegment;
        const newDuration = resizeState.activeSegmentSide === 'left' ?
            active.end - active.start - newTime :
            newTime - active.start - active.offsetStart;

        // Do not allow resizing 
        if(newDuration <= 2) {
            return;
        }
        
        resizeState.activeSegmentSide === 'left' ?
            active.offsetStart = newTime :
            active.end = newTime;

        manager.flatten(resizeState.dragWave.id);
        manager.process(resizeState.dragWave.id);
    });

    hammer.on('panend', (ev) => {
        const target = manager.options.getEventTarget(ev.srcEvent);
        if(resizeState.options == null || !shouldHandle(target, resizeState.options))
            return;

        resizeState.activeSegment = null;
        resizeState.activeSegmentOffsetStart = 0;
        resizeState.activeSegmentOffsetEnd = 0;
        resizeState.activeSegmentSide = null;
        resizeState.dragWave = null;
        resizeState.options = null;
    });
}