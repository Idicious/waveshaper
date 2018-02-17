# WaveShaper
Waveform drawing and interaction library.

#Installation
``` 
npm install waveshaper
```

#Getting started

The library offers performant drawing of audio files to multiple canvasses while providing the following functionality:

- pan
- zoom
- drag
- resize
- cut

## WaveShaper
Each WaveShaper manages a canvas. It can be compared to a Track in a DAW. A waveshaper has an array of Segments, multiple segments can reference the same audio file.


## Segment
A segment represents a portion of audio, it has the following properties:

| property | values | constraints | description
| -------- | ---- | -----------   | -----------
| id       | string | | Unique identifier
| index    | number | >= 0 | Used to resolve overlapping Segments within a WaveShaper, higher indexes have priority.
| start    | number | >= 0 - offsetStart | Start time in seconds
| duration | number | > 0 | Duration in seconds
| offsetStart | number | >= 0 & < duration - offsetEnd | Offset from start in seconds
| offsetEnd | number | >= 0 & < offsetStart | Offset from end in seconds
| source | string | | id of audio file

## WaveShapeManager
This is the the class you use to manage the settings for all the WaveShapers and to draw them. It has the following properties:

| property | type | constraints | description
| -------- | ---- | -----------   | -----------
| samplesPerPixel | number | > 0 | Zoom level, higher to zoom out, lower to zoom in.
| resolution    | number | > 0 | Detail level, higher for more detail
| width    | number | > 0 | Width in pixels of canvasses
| height | number | > 0 | Height in pixels of canvasses
| scrollPosition | number | >= 0 | Change to pan, position in pixels
| meterType | string | 'peak', 'rms' | Method of calculating display values
| mode | string | 'pan', 'drag', 'cut', 'resize' | Interaction mode, pan includes pinch-zoom

## Code example
```
var container = document.querySelector('#wavecontainer');
var ctx = new AudioContext();
var manager = new WaveShapeManager(ctx.sampleRate, container);
manager.generateId = function() {
    return Math.random().toString();
}

fetch('audiofile.wav')
    .then(res => res.arrayBuffer())
    .then(buffer => ctx.decodeAudioData(buffer))
    .then(audiobuffer => {
        manager.addAudioData('1', audiobuffer);
        manager.addWaveShaper('1', [
            { id: '1', index: '1', start: 0, duration: audiobuffer.duration, offsetStart: 0, offsetEnd: 0, source: '1'}
        ], 'whitesmoke');
    });
```

