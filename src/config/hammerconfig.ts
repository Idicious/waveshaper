import * as Hammer from 'hammerjs';

const hammerOptions: HammerOptions = {
    touchAction : 'pan-y',
    recognizers: [
        [Hammer.Pan, { direction: Hammer.DIRECTION_HORIZONTAL }],
        [Hammer.Pinch, { enable : true }],
        [Hammer.Tap]
    ]
}

export default hammerOptions;