self.importScripts('./aurora.js');
self.importScripts('./mp3.js');

const processingQueue = [];
let processing = false;

/**
 * Accepts one or multiple url's to audio files
 * and adds them to the processing queue.
 * 
 * @param {string[]} urls example: ['/audio/sound.wav']
 */
self.onmessage = (message) => {
  processingQueue.push(message.data);
}

/**
 * Infinite timer that checks for items in the
 * processing queue and starts processing on the next item
 * if there is no processing going on.
 */
setTimeout(function next() {
  if (processingQueue.length > 0 && !processing) {
    processing = true;
    loadAudio(processingQueue.shift());
  }
  setTimeout(next, 10);
}, 10);

/**
 * Loads an audio audio file from given url,
 * decodes, converts it to an AudioBuffer and
 * posts it back to main thread.
 * 
 * @param {string} url 
 */
const loadAudio = (url) => {
  const asset = AV.Asset.fromURL(url);
  asset.decodeToBuffer((decoded) => {
    const metaData = getMetaData(asset, decoded.length);
    const channels = getChannels(decoded, metaData);
    self.postMessage({
      url: url,
      buffer: channels,
      meta: metaData
    }, channels);
    processing = false;
  });
}

/**
 * Returns an object containing the number of channels,
 * samplerate and channel data length of the audio file.
 * 
 * @param {any} asset Aurora asset data
 * @param {Float32Array} buffer 
 * @returns {{channels: number, sampleRate: number, length: number}} Audio track meta data
 */
const getMetaData = (asset, bufferLength) => {
  const channels = asset.format.channelsPerFrame;
  const sampleRate = asset.format.sampleRate;
  const length = bufferLength / channels;

  return {
    channels,
    sampleRate,
    length
  };
}

/**
 * 
 * @param {Float32Array} buffer 
 * @param {{channels: number, sampleRate: number, length: number}} meta 
 * @returns {ArrayBuffer[]}
 */
const getChannels = (buffer, meta) => {
  if(meta.channels === 1) {
    return [buffer.buffer];
  }

  var audioChans = [];
  for(var i = 0; i < meta.channels; i++) {
      audioChans.push(new Float32Array(meta.length));
  }
  for(var i = 0; i < buffer.byteLength; i++) {
      audioChans[i % meta.channels][Math.round(i/meta.channels)] = buffer[i];
  }
  for(var i = 0; i < meta.channels; i++) {
    audioChans[i] = audioChans[i].buffer;
  }
  return audioChans;
} 