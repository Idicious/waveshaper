[![Build Status](https://travis-ci.org/Idicious/waveshaper.svg?branch=master)](https://travis-ci.org/Idicious/waveshaper)

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

## WaveShaper
Each WaveShaper manages a canvas. It can be compared to a Track in a DAW. A WaveShaper has an array of Segments, multiple segments can reference the same audio file.

| Property | Type | Description
| -------- | ---- | -----------
| element  | HTMLCanvas | Canvas element with rendered waveform


## Segment
A segment represents a portion of audio, it has the following properties:

| Property | Type | Constraints | Description
| -------- | ---- | -----------   | -----------
| id       | string | | Unique identifier
| index    | number | >= 0 | Used to resolve overlapping Segments within a WaveShaper, higher indexes have priority.
| start    | number | >= 0 - offsetStart | Start time in seconds
| duration | number | > 0 | Duration in seconds
| offsetStart | number | >= 0 & < duration - offsetEnd | Offset from start in seconds
| offsetEnd | number | >= 0 & < offsetStart | Offset from end in seconds
| source | string | | id of audio file

## WaveShapeManager
This is the the class you use to manage the settings for all the WaveShapers and to draw them.

| Property | Type | Constraints | Description
| -------- | ---- | -----------   | -----------
| samplesPerPixel | number | > 0 | Zoom level, higher to zoom out, lower to zoom in.
| resolution    | number | > 0 | Detail level, higher for more detail, lower for faster rendering. |
| width    | number | > 0 | Width in pixels of canvasses |
| height | number | > 0 | Height in pixels of canvasses |
| scrollPosition | number | >= 0 | Change to pan, position in pixels
| meterType | string | 'peak', 'rms' | Method of calculating display values
| mode | string | 'pan', 'drag', 'cut', 'resize' | Interaction mode, pan includes pinch-zoom. You can drag between canvasses. |
| activeWaveShapers | string[] | | Array of waveshaper id's, if set only these will be rendered when calling draw. |
| generateId | () => string | | When a segment is cut it must be given a new id, the given method is used to generate the id.

| Method | Arguments | Description | Examples |
| -----  | --------- | ----------  | ------- |
| draw   | ids: string[], forceDraw: boolean | When called renders the audio data to the canvasses. The first argument accepts an array of WaveShaper id's to render, if null uses activeWaveShapers property, if that is null renders all WaveShapers. The second argument if true forces a redraw and bypasses memoization of the last time draw was called. | manager.draw(['1', '2']), manager.draw(), manager.draw(['1'], true) |

## Code example
```

// Container is used for delegated events, the canvasses should be rendered as direct or indirect children of the container element
var container = document.getElementById('container');
var ctx = new AudioContext();

const managerConfig = {
    samplesPerPixel: 1024,
    resolution: 10,
    scrollPosition: 0,
    width: container.clientWidth;
    height: 300,
    mode: 'pan',
    meterType: 'peak',
    generateId: Math.random().toString()
}

const manager = new WaveShapeManager(ctx.sampleRate, container, managerConfig);

// Add a waveshaper with segment data
const waveShaper = manager.addWaveShaper('1', [
    { id: '1', index: '0', start: 0, duration: audiobuffer.duration, offsetStart: 0, offsetEnd: 0, source: '1'},
    { id: '2', index: '1', start: 20, duration: audiobuffer.duration, offsetStart: 10.145, offsetEnd: 13.34, source: '2'}
], 'whitesmoke');

// Append the canvas to container element
container.appendChild(waveShaper.element);

// Draw renders outlines of segments when there is no audio data
manager.draw();

// Fetch audio data
fetch('audiofile.wav')
    .then(res => res.arrayBuffer())
    .then(buffer => ctx.decodeAudioData(buffer))
    .then(audiobuffer => {
        // This will trigger a rerender of all active waveshapers and render the actual waveforms for the segments using it
        manager.addAudioData('1', audiobuffer);
    });
```

