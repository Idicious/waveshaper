import { DragState } from "./dragstate";
import { DomRenderWaveShaper } from "../";

export default (manager: DomRenderWaveShaper,canvas: HTMLCanvasElement, dragState: DragState): () => void => {

    const enterlistener = (ev: PointerEvent) => pointerEnter(ev);
    const downlistener = (ev: PointerEvent) => canvas.releasePointerCapture(ev.pointerId);


    /**
     * Fires when the mouse moves over the container,
     * If a segment is being dragged and the pointer moves
     * into another canvas the segment is tranfered to the 
     * new canvas.
     */
    canvas.addEventListener('pointerenter', enterlistener);
    canvas.addEventListener('pointerdown', downlistener);

    const destroy = () => {
        canvas.removeEventListener('pointerenter', enterlistener);
        canvas.removeEventListener('pointerdown', downlistener);
    }

    const pointerEnter = (ev: PointerEvent) => {
        if (dragState.options == null || dragState.options.mode !== 'drag')
            return;

        if (dragState.activeSegment == null || dragState.dragWave == null)
            return;

        const canvas = dragState.options.getEventTarget(ev);
        if (canvas == null || !(canvas instanceof HTMLCanvasElement))
            return;

        const id = canvas.getAttribute('data-wave-id');
        if (id == null) return;

        const wave = manager.getTrack(id);
        if (wave == null) return;

        if (dragState.dragWave.id !== id) {
            const index = dragState.dragWave.intervals.indexOf(dragState.activeSegment);
            dragState.dragWave.intervals.splice(index, 1);

            wave.intervals.push(dragState.activeSegment);
            dragState.activeSegment.index = 1000;

            const currentId = dragState.dragWave.id;
            dragState.dragWave = wave;

            manager.flatten(wave.id, currentId);
            manager.process(wave.id, currentId);
        }
    }

    return destroy;
}