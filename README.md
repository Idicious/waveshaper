[![Build Status](https://travis-ci.org/Idicious/waveshaper.svg?branch=master)](https://travis-ci.org/Idicious/waveshaper)
[![Coverage Status](https://coveralls.io/repos/github/Idicious/waveshaper/badge.svg?branch=master)](https://coveralls.io/github/Idicious/waveshaper?branch=master)

# WaveShaper
Waveform drawing and interaction library. The library offers high performance drawing of audio files to multiple canvasses while providing the following functionality:

- pan
- zoom
- drag
- resize
- cut

The interaction supports touch devices as well as programmatically setting the values.

## Installation
``` 
npm install waveshaper
```

## Interval
An interval represents a portion of audio, it has the following properties:

| Property | Type | Constraints | Description
| -------- | ---- | -----------   | -----------
| id       | string | | Unique identifier
| index    | number | >= 0 | Used to resolve overlapping Intervals within a Track, higher indexes have priority.
| start    | number | >= 0 - offsetStart | Start time in seconds.
| offsetStart | number | >= 0 & < (end - start) | Offset from start in seconds.
| end | number | > start + offsetStart | End time in seconds.
| source | string | | id of audio data.

## WaveShaper
This is the the class you use to manage the settings of all the Tracks and get render data from them. The class offers a fluent API, all public methods besides getTrack return the manager.  

| Property | Type | Constraints | Description
| -------- | ---- | -----------   | -----------
| duration | number | readonly | Maximum end time of all intervals managed by this WaveShaper. |
| options | see below | readonly | Current options, can only be altered with the setOptions method. |
| lastProcessResult | ProcessResult | readonly | Result of last time process was called.

| Method | Arguments | Description | Examples |
| -----  | --------- | ----------  | ------- |
| flatten | ...ids: string[] | Flattens intervals for given Track id's, should be called if start, end, offset-start or index properties are changed of any Intervals. | WS.flatten('1')
| process   | ...ids: string[] | Calculates new render values and fires on events for given Track id's. | WS.process('1') |
| on | id: string, callBack: function | Registers a callback that will be triggered when the Tracks with given id's are processed. | WS.on('1', function(options, renderData) { console.log(renderData) }; |
| off | id: string, callBack: function | Unregisters given callback from given Track id. | WS.off('1', funcRef) |
| setOptions | options (see below) | Sets manager options. | WS.set({ samplesPerPixel: 50, scrollPosition: 10.4}) |
| setActive | ...ids: string[] | If set only these Tracks are processed when calling process and flatten. | WS.setActive('1', '2') |
| setData | ...data: Data[] | Sets audio data with the given id, this id is referenced in the Interval source property | WS.setData({ id: '1', data: audioBuffer})
| setTracks | ...tracks: TrackInput[] | Sets a track to the given id. | WS.setTracks({ id: '1', [{ id: '1', start: 0, end: 10, offset-start: 2, index: 1, source: '1' }]}) |
| clearTracks | ...ids: string[] | Removes Tracks with given id's including all callbacks assigned to them. | WS.removeTracks('1', '2') |

### Options

The setOptions method expects an object with one or more of the following properties.

| Property | Type | Constraints | Description |
| -------- | ---- | -----------   | ----------- |
| samplesPerPixel | number | > 0 | Zoom level, higher to zoom out, lower to zoom in. |
| resolution    | number | > 0 | Detail level, higher for more detail, lower for faster rendering. |
| width    | number | > 0 | Width in pixels of canvasses. |
| height | number | > 0 | Height in pixels of canvasses. |
| scrollPosition | number | >= 0 | Change to pan, position in pixels. |
| meterType | string | 'peak', 'rms' | Method of calculating display values. |
| mode | string | 'pan', 'drag', 'cut', 'resize' | Interaction mode, pan includes pinch-zoom. You can drag between canvasses. |
| generateId | () => string | | When a segment is cut it must be given a new id, the given method is used to generate the id. |
| samplerate | number | > 0 | Audio samplerate. |

## DomRenderWaveShaper

DomRenderWaveShaper is a subclass of WaveShaper which adds methods for registering canvasses to render when process is called. An instance of this class it exported as WS to the window.

| Property | Type | Constraints | Description |
| -------- | ---- | -----------   | ----------- |
| scrollWidth | number | readonly | Scroll width in pixels needed to scroll through longest track.

| Method | Arguments | Description | Examples |
| -----  | --------- | ----------  | ------- |
| setInteraction | element: HTMLElement | Adds event listeners to given DOM element to handle interactions. If this was called previously removes listeners from old element first. | WS.setInteraction(containerDiv) |
| clearInteraction | | Removes all event listeners | WS.clearInteraction() |
| registerCanvas | trackId: string, canvas: HTMLCanvasElement, color: string | Once registered the given Track will be rendered to the given canvas when process is called, returns an unregister function. | WS.registerCanvas('1', canvas, 'lightblue') |
| unregisterCanvas | id: string | Removes callbacks and references to the canvas belonging to the given Track id. | WS.unregisterCanvas('1') |

## Code example
```

// Container is used for delegated events, the canvasses should be rendered as direct or indirect children of the container element
const container = document.getElementById('container');
const ctx = new AudioContext();

 var options = {
    scrollPosition: 0,
    samplesPerPixel: 1024,
    resolution: 10,
    meterType: 'rms',
    mode: 'pan',
    height: 300,
    width: canvasContainer.clientWidth,
    samplerate: audioContext.sampleRate,
    generateId: function() { return Math.random().toString(); }
}

var tracks = [
    { id: '1', color: 'lightblue', intervals: [ 
        { id: '1', index: 0, start: 0, end: 30, offsetStart: 0, source: '1' },
        { id: '2', index: 1, start: 10, end: 20, offsetStart: 2, source: '2' }
    ]},
     { id: '2', color: 'lightblue', intervals: [ 
        { id: '3', index: 0, start: 0, end: 30, offsetStart: 0, source: '1' },
        { id: '4', index: 1, start: 10, end: 20, offsetStart: 2, source: '2' }
    ]},
];

var audioData = [
    { id: '1', url: './audiosample1.wav' },
    { id: '2', url: './audiosample2.wav' },
]

WS.setOptions(options);
tracks.forEach(track => {
    var canvas = document.createElement('canvas');
    WS.registerCanvas(track.id, canvas, track.color);

    container.appendChild(canvas);
});

// Without audio data will draw outlines
WS.setInteraction(container)
    .setTracks(...tracks)
    .loadData(...audioData)
    .process();
```

