import WaveShaper from '../core/waveshaper';
import WaveShapeManager from '../core/manager';
import Segment from '../models/segment';

const resizeState = {
    activeSegment: <Segment>null,
    activeSegmentSide: <'left' | 'right'>null,
    activeSegmentOffsetStart: 0,
    activeSegmentOffsetEnd: 0,
    dragWave: <WaveShaper>null
}

/**
 * Adds drag functionality to waveshaper
 * 
 * @param {WaveShapeManager} manager
 * @param {HammerManager} hammer
 */
export default function(manager: WaveShapeManager, hammer: HammerManager) {

    /** @param {HammerInput} ev */
    const shouldHandle = (ev: HammerInput) => manager.mode === 'resize' && ev.target.classList.contains('waveshaper');

    hammer.on('panstart', (ev) => { 
        if(!shouldHandle(ev))
            return;

        const id = ev.target.getAttribute('data-wave-id');
        const wave = manager.waveShapers.get(id);

        const bb = ev.target.getBoundingClientRect();
        const time = (manager.scrollPosition + (ev.center.x - bb.left)) * manager.samplesPerPixel / manager.samplerate;

        /** @type {Interval} */
        const interval = wave.flattened.find(i => i.start <= time && i.end >= time);

        if(interval == null) 
            return;

        resizeState.activeSegmentSide = 
            time < interval.start + ((interval.end - interval.start) / 2) ? 
                'left' : 
                'right';

        resizeState.activeSegment = wave.segments.find(s => s.id === interval.id);

        resizeState.activeSegmentOffsetStart = resizeState.activeSegment.offsetStart;
        resizeState.activeSegmentOffsetEnd = resizeState.activeSegment.offsetEnd;

        resizeState.activeSegment.index = 1000;
        resizeState.dragWave = wave;
    });

    hammer.on('panmove', (ev) =>  {
        if(!shouldHandle(ev))
            return;
            
        if(resizeState.activeSegment == null)
            return;

        const change = (ev.deltaX * manager.samplesPerPixel) / manager.samplerate;
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

        resizeState.dragWave.flatten();
        manager.draw([resizeState.dragWave.id], true);
    });

    hammer.on('panend', (ev) => {
        if(!shouldHandle(ev))
            return;

        resizeState.activeSegment = null;
        resizeState.activeSegmentOffsetStart = 0;
        resizeState.activeSegmentOffsetEnd = 0;
        resizeState.activeSegmentSide = null;
        resizeState.dragWave = null;
    });
}