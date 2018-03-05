[![Build Status](https://travis-ci.org/Idicious/waveshaper.svg?branch=master)](https://travis-ci.org/Idicious/waveshaper)
[![Coverage Status](https://coveralls.io/repos/github/Idicious/waveshaper/badge.svg)](https://coveralls.io/github/Idicious/waveshaper)
[![npm version](https://badge.fury.io/js/waveshaper.svg)](https://badge.fury.io/js/waveshaper)

# WaveShaper
This library calculates render data in real-time from audio-data which can be used to draw (interactive) audio waveforms. [waveshaper-dom](https://github.com/Idicious/waveshaper-dom) is a libray that uses this to render interactive waveforms in the browser. The output is stored
in the lastProcessResult property and is given per track to the registered callbacks. The format of the output data is per track a Float32Array which can be read in the following way: 

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

## Links
- [API](https://idicious.github.io/waveshaper/)
- Demo - Coming soon

## Example
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
            { id: '1', start: 10, end: 30, offsetStart: 5, index: 1, source: '1' },
            { id: '2', start: 15, end: 20, offsetStart: 2, index: 2, source: '2' },
        ]
    },
     {
        id: '2', intervals: [
            { id: '3', start: 10, end: 30, offsetStart: 5, index: 1, source: '1' },
            { id: '4', start: 15, end: 20, offsetStart: 2, index: 2, source: '2' },
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

const WS = new WaveShaper(options);
WS.setData(...data)
    .setTracks(...tracks)
    .on('1', callback)
    .on('2', callback)
    .process();

console.log(WS.lastProcessResult);
```
