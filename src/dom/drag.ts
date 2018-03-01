import DomRenderWaveShaper from './index';
import { DomOptions } from './dom-config';
import { DragState } from './dragstate';

/**
 * Adds drag functionality to waveshaper
 * 
 * @param manager Waveshape Manager
 * @param hammer Hammer instance
 * @param container Container element
 */
export default (manager: DomRenderWaveShaper, hammer: HammerManager, dragState: DragState) => {

    const shouldHandle = (target: HTMLElement, options: DomOptions) => options.mode === 'drag' && target.hasAttribute('data-wave-id');

    /**
     * Sets up the drag by finding the 
     */
    hammer.on('panstart', (ev: HammerInput) => {
        const options = manager.options;
        const target = manager.options.getEventTarget(ev.srcEvent);
        if (!shouldHandle(target, options))
            return;

        const id = target.getAttribute('data-wave-id');
        if(id == null) return;

        const wave = manager.getTrack(id);
        if(wave == null) return;

        const bb = ev.target.getBoundingClientRect();
        const time = (options.scrollPosition + (ev.center.x - bb.left)) * (options.samplesPerPixel / options.samplerate);
        const interval = wave.flattened.find(i => i.start + i.offsetStart <= time && i.end >= time);

        if (interval == null)
            return;

        const segment = wave.intervals.find(s => s.id === interval.id);
        if(segment == null) return;

        dragState.options = options;

        dragState.activeSegment = segment;
        dragState.activeSegmentStart = dragState.activeSegment.start;
        dragState.duration = segment.end - segment.start;

        dragState.activeSegment.index = 1000;
        dragState.dragWave = wave;
    });

    hammer.on('panmove', (ev: HammerInput) => {
        const target = manager.options.getEventTarget(ev.srcEvent);
        if (dragState.options == null || !shouldHandle(target, dragState.options))
            return;

        if (dragState.activeSegment == null || dragState.dragWave == null)
            return;

        if (dragState.dragging)
            return;

        dragState.dragging = true;

        /** 
         * TODO below implementation stops all updates on touch devices on new track (tested on Samsung Galaxy s8),
         * when dragged back to original keeps working. Works on desktop, it's a small performance improvement as
         * it prevents a single track flatten + process when transferring a segment between tracks.
         */

        //// If the target has moved it is handled by the mouseHover function
        // const id = ev.target.getAttribute('data-wave-id');
        // if(id !== dragState.dragWave.id)
        //     return;

        const change = (ev.deltaX * dragState.options.samplesPerPixel) / dragState.options.samplerate;
        let newTime = dragState.activeSegmentStart + change;

        if (newTime + dragState.activeSegment.offsetStart < 0) {
            newTime = -dragState.activeSegment.offsetStart;
        }

        dragState.activeSegment.start = newTime;
        dragState.activeSegment.end = newTime + dragState.duration;

        manager.flatten(dragState.dragWave.id);
        manager.process(dragState.dragWave.id);

        dragState.dragging = false;
    });

    hammer.on('panend', (ev: HammerInput) => {
        const target = manager.options.getEventTarget(ev.srcEvent);
        if (dragState.options == null || !shouldHandle(target, dragState.options))
            return;

        dragState.activeSegment = null;
        dragState.activeSegmentStart = 0;
        dragState.dragWave = null;
        dragState.options = null;
        dragState.duration = 0;
    });
}