import WaveShaper from '../core/waveshaper';
import WaveShapeManager from '../core/manager';
import Segment from '../models/segment';
import { ManagerOptions } from '../config/managerconfig';

interface DragState {
    activeSegment: Segment | null;
    activeSegmentStart: number;
    dragWave: WaveShaper | null;
    options: ManagerOptions | null;
    dragging: boolean;
}

const dragState: DragState = {
    activeSegment: null,
    activeSegmentStart: 0,
    dragWave: null,
    options: null,
    dragging: false
}

/**
 * Adds drag functionality to waveshaper
 * 
 * @param manager Waveshape Manager
 * @param hammer Hammer instance
 * @param container Container element
 */
export default (manager: WaveShapeManager, hammer: HammerManager, container: HTMLElement) => {

    const shouldHandle = (ev: HammerInput, options: ManagerOptions) => options.mode === 'drag' && ev.target.hasAttribute('data-wave-id');

    /**
     * Fires when the mouse moves over the container,
     * If a segment is being dragged and the pointer moves
     * into another canvas the segment is tranfered to the 
     * new canvas.
     */
    if(isTouchDevice()) {
        container.addEventListener('touchmove', ev => mouseHover(ev));
    } else {
        container.addEventListener('mousemove', ev => mouseHover(ev));
    }

    /**
     * Sets up the drag by finding the 
     */
    hammer.on('panstart', (ev: HammerInput) => {
        const options = manager.options;
        if (!shouldHandle(ev, options))
            return;

        const id = ev.target.getAttribute('data-wave-id');
        if(id == null) return;

        const wave = manager.getTrack(id);
        if(wave == null) return;

        const bb = ev.target.getBoundingClientRect();
        const time = (options.scrollPosition + (ev.center.x - bb.left)) * (options.samplesPerPixel / options.samplerate);
        const interval = wave.flattened.find(i => i.start <= time && i.end >= time);

        if (interval == null)
            return;

        const segment = wave.segments.find(s => s.id === interval.id);
        if(segment == null) return;

        dragState.options = options;

        dragState.activeSegment = segment;
        dragState.activeSegmentStart = dragState.activeSegment.start;

        dragState.activeSegment.index = 1000;
        dragState.dragWave = wave;
    });

    hammer.on('panmove', (ev: HammerInput) => {
        if (dragState.options == null || !shouldHandle(ev, dragState.options))
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

        manager.flatten(dragState.dragWave.id);
        manager.process(dragState.dragWave.id);

        dragState.dragging = false;
    });

    hammer.on('panend', (ev: HammerInput) => {
        if (dragState.options == null || !shouldHandle(ev, dragState.options))
            return;

        dragState.activeSegment = null;
        dragState.activeSegmentStart = 0;
        dragState.dragWave = null;
        dragState.options = null;
    });

    const mouseHover = (ev: TouchEvent | MouseEvent) => {
        if (dragState.options == null || dragState.options.mode !== 'drag')
            return;

        if (dragState.activeSegment == null || dragState.dragWave == null)
            return;

        const canvas = getTouchMouseTargetElement(ev);
        if (canvas == null || !(canvas instanceof HTMLCanvasElement))
            return;

        const id = canvas.getAttribute('data-wave-id');
        if(id == null) return;

        const wave = manager.getTrack(id);
        if(wave == null) return;

        if (dragState.dragWave.id !== id) {
            const index = dragState.dragWave.segments.indexOf(dragState.activeSegment);
            dragState.dragWave.segments.splice(index, 1);

            wave.segments.push(dragState.activeSegment);
            dragState.activeSegment.index = 1000;

            const currentId = dragState.dragWave.id;
            dragState.dragWave = wave;

            manager.flatten(wave.id, currentId);
            manager.process(wave.id, currentId);
        }
    }

    /**
     * Gets the actual target from a pointer event
     * @param ev 
     */
    const getTouchMouseTargetElement = (ev: TouchEvent | MouseEvent) => {
        if (ev instanceof TouchEvent) {
            return document.elementFromPoint(ev.touches[0].pageX, ev.touches[0].pageY);
        }
        return ev.target;
    }

    function isTouchDevice() {
        return 'ontouchstart' in window        // works on most browsers 
            || navigator.maxTouchPoints;       // works on IE10/11 and Surface
    };
}