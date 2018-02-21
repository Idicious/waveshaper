import WaveShaper from '../core/waveshaper';
import WaveShapeManager from '../core/manager';
import Segment from '../models/segment';
import { ManagerOptions } from '../config/managerconfig';

declare type SegmentSide = 'left' | 'right';

interface ResizeState {
    activeSegment: Segment | null;
    activeSegmentSide: SegmentSide | null;
    activeSegmentOffsetStart: number;
    activeSegmentOffsetEnd: number;
    dragWave: WaveShaper | null;
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
 * @param {WaveShapeManager} manager
 * @param {HammerManager} hammer
 */
export default function(manager: WaveShapeManager, hammer: HammerManager) {

    const shouldHandle = (ev: HammerInput, options: ManagerOptions) => options.mode === 'resize' && ev != null && ev.target.hasAttribute('data-wave-id');

    hammer.on('panstart', (ev) => { 
        const options = manager.options;
        if(!shouldHandle(ev, options))
            return;

        const id = ev.target.getAttribute('data-wave-id');
        if(id == null) return;

        const wave = manager.getTrack(id);
        if(wave == null) return;

        const bb = ev.target.getBoundingClientRect();
        const time = (options.scrollPosition + (ev.center.x - bb.left)) * options.samplesPerPixel / options.samplerate;

        const interval = wave.flattened.find(i => i.start <= time && i.end >= time);

        if(interval == null) 
            return;

        resizeState.activeSegmentSide = 
            time < interval.start + ((interval.end - interval.start) / 2) ? 
                'left' : 
                'right';

        const segment = wave.segments.find(s => s.id === interval.id);
        if(segment == null) return;

        resizeState.options = options;
        resizeState.activeSegment = segment;

        resizeState.activeSegmentOffsetStart = segment.offsetStart;
        resizeState.activeSegmentOffsetEnd = segment.offsetEnd;

        segment.index = 1000;
        resizeState.dragWave = wave;
    });

    hammer.on('panmove', (ev) =>  {
        if(resizeState.dragWave == null || resizeState.options == null || !shouldHandle(ev, resizeState.options))
            return;

        const options = manager.options;
            
        if(resizeState.activeSegment == null)
            return;

        const change = (ev.deltaX * options.samplesPerPixel) / options.samplerate;
        let newTime = resizeState.activeSegmentSide === 'left' ?
            resizeState.activeSegmentOffsetStart + change :
            resizeState.activeSegmentOffsetEnd - change;

        // Don't allow offset to become less than 0
        if(newTime < 0) {
            newTime = 0;
        }

        const active = resizeState.activeSegment;
        const newDuration = resizeState.activeSegmentSide === 'left' ?
            (active.start + active.duration) - active.start - newTime - active.offsetEnd :
            (active.start + active.duration) - active.start - active.offsetStart - newTime;

        // Do not allow resizing 
        if(newDuration <= 2) {
            return;
        }
        
        resizeState.activeSegmentSide === 'left' ?
            active.offsetStart = newTime :
            active.offsetEnd = newTime;

        manager.flatten(resizeState.dragWave.id);
        manager.process(resizeState.dragWave.id);
    });

    hammer.on('panend', (ev) => {
        if(resizeState.options == null || !shouldHandle(ev, resizeState.options))
            return;

        resizeState.activeSegment = null;
        resizeState.activeSegmentOffsetStart = 0;
        resizeState.activeSegmentOffsetEnd = 0;
        resizeState.activeSegmentSide = null;
        resizeState.dragWave = null;
        resizeState.options = null;
    });
}