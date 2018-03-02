[![Build Status](https://travis-ci.org/Idicious/waveshaper.svg?branch=master)](https://travis-ci.org/Idicious/waveshaper)
[![Coverage Status](https://coveralls.io/repos/github/Idicious/waveshaper/badge.svg?branch=master)](https://coveralls.io/github/Idicious/waveshaper?branch=master)

# WaveShaper
This library calculates render data in real-time from audio-data which can be used to draw (interactive) audio waveforms. [waveshaper-dom](https://github.com/Idicious/waveshaper-dom) is a libray that uses this to render interactive waveforms in the browser. The output is stored
in the lastProcessResult property is given per track to the registered callbacks. The format of the output data is per track a Float32Array which can be read in the following way: 

```
for(let i = 0; i < data.length; i += 4) {
    const negativeValue = data[i];
    const positiveValue = data[i + 1];
    const isIntervalBorder = data[i + 2];
    const isInsideInterval = data[i + 3];
}
```

The length of the result array is options.width * 4, with each group of 4 containing information for a single point.

## Installation
``` 
npm install waveshaper
```

## Using the library
```
const options = {
    samplesPerPixel: 1024,
    resolution: 64,
    width: 300,
    scrollPosition: 0,
    meterType: 'rms',
    samplerate: 44100
};

// data would generally contain decoded audio data
// If no data is provided the result array contains all 0's for positive and negative values.
const data = [
    { id: '1', data: new Float32Array(44100) },
    { id: '2', data: new Float32Array(44100) },
];

const tracks = [
    {
        id: '1', intervals: [
            { id: '1', start: 10, end: 30, offset-start: 5, index: 1, source: '1' },
            { id: '2', start: 15, end: 20, offset-start: 2, index: 2, source: '2' },
        ]
    },
     {
        id: '2', intervals: [
            { id: '3', start: 10, end: 30, offset-start: 5, index: 1, source: '1' },
            { id: '4', start: 15, end: 20, offset-start: 2, index: 2, source: '2' },
        ]
    },
];

const callback = function(options, renderData) {
    // Options at time process was called
    console.log(options);

    for(let i = 0; i < renderData.length; i += 4) {
        const negativeValue = renderData[i];
        const positiveValue = renderData[i + 1];
        const isIntervalBorder = renderData[i + 2];
        const isInsideInterval = renderData[i + 3];
    }
};

const WS = new WaveShaper(options)
    .setData(...data)
    .setTracks(...tracks)
    .on('1', callback)
    .on('2', callback)
    .process();

console.log(WS.lastProcessResult);
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
| getTrack | id: string | Returns the track with given ID, gives access to flattened and non flattened intervals. | WS.getTrack('1').flattened |

### Options

The setOptions method expects an object with one or more of the following properties.

| Property | Type | Constraints | Description |
| -------- | ---- | -----------   | ----------- |
| samplesPerPixel | number | > 0 | Zoom level, higher to zoom out, lower to zoom in. |
| resolution    | number | > 0 | Detail level, higher for more detail, lower for faster rendering. |
| width    | number | > 0 | Width in pixels of canvasses. |
| scrollPosition | number | >= 0 | Change to pan, position in pixels. |
| meterType | string | 'peak', 'rms' | Method of calculating display values. |
| samplerate | number | > 0 | Audio samplerate. |
