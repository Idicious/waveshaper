import WaveShaper from '../core/waveshaper';
import WaveShapeManager from '../core/manager';
import Segment from '../models/segment';

const dragState = {
    activeSegment: <Segment>null,
    activeSegmentStart: 0,
    dragWave: <WaveShaper>null
}

/**
 * Adds drag functionality to waveshaper
 * 
 * @param {WaveShapeManager} manager Waveshape Manager
 * @param {HammerManager} hammer Hammer instance
 * @param {HTMLElement} container Container element
 */
export default (manager: WaveShapeManager, hammer: HammerManager, container: HTMLElement) => {

    /** @param {HammerInput} ev - Hammer event */
    const shouldHandle = (ev: HammerInput) => manager.mode === 'drag' && ev.target.classList.contains('waveshaper');

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
        if (!shouldHandle(ev))
            return;

        const id = ev.target.getAttribute('data-wave-id');
        const wave = manager.waveShapers.get(id);

        const bb = ev.target.getBoundingClientRect();
        const time = (manager.scrollPosition + (ev.center.x - bb.left)) * manager.samplesPerPixel / manager.samplerate;
        const interval = wave.flattened.find(i => i.start <= time && i.end >= time);

        if (interval == null)
            return;

        dragState.activeSegment = wave.segments.find(s => s.id === interval.id);
        dragState.activeSegmentStart = dragState.activeSegment.start;

        dragState.activeSegment.index = 1000;
        dragState.dragWave = wave;
    });

    hammer.on('panmove', (ev: HammerInput) => {
        if (!shouldHandle(ev))
            return;

        if (dragState.activeSegment == null)
            return;

        const change = (ev.deltaX * manager.samplesPerPixel) / manager.samplerate;
        let newTime = dragState.activeSegmentStart + change;

        if (newTime + dragState.activeSegment.offsetStart < 0) {
            newTime = -dragState.activeSegment.offsetStart;
        }

        dragState.activeSegment.start = newTime;
        dragState.dragWave.flatten();
        manager.draw([dragState.dragWave.id], true);
    });

    hammer.on('panend', (ev: HammerInput) => {
        if (!shouldHandle(ev))
            return;

        dragState.activeSegment = null;
        dragState.activeSegmentStart = 0;
        dragState.dragWave = null;
    });

    const mouseHover = (ev: TouchEvent | MouseEvent) => {
        if (manager.mode !== 'drag')
            return;

        if (dragState.activeSegment == null || dragState.dragWave == null)
            return;

        const canvas = getTouchMouseTargetElement(ev);
        if (canvas == null || !(canvas instanceof HTMLCanvasElement))
            return;

        const id = canvas.getAttribute('data-wave-id');
        const wave = manager.waveShapers.get(id);

        if (dragState.dragWave.id !== id) {
            const index = dragState.dragWave.segments.indexOf(dragState.activeSegment);
            dragState.dragWave.segments.splice(index, 1);

            dragState.dragWave.flatten();
            manager.draw([dragState.dragWave.id], true);

            wave.segments.push(dragState.activeSegment);
            dragState.activeSegment.index = 1000;

            wave.flatten();
            manager.draw([wave.id], true);

            dragState.dragWave = wave;
        }
    }

    /**
     * Gets the actual target from a pointer event
     * @param {TouchEvent | MouseEvent} ev 
     */
    const getTouchMouseTargetElement = (ev: TouchEvent | MouseEvent) => {
        if (ev instanceof TouchEvent) {
            /** @type {TouchEvent} */
            const touch = ev;
            return document.elementFromPoint(touch.touches[0].pageX, touch.touches[0].pageY);
        }
        return ev.target;
    }

    function isTouchDevice() {
        return 'ontouchstart' in window        // works on most browsers 
            || navigator.maxTouchPoints;       // works on IE10/11 and Surface
    };
}