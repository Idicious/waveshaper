//import Interval from '../models/interval';
import { ManagerOptions } from "../config/managerconfig";
import AudioInterval from "../models/interval";

/**
 * Calculate rms values
 *
 * @export
 * @param resolution
 * @param samplesPerPixel
 * @param width
 * @param intervals
 * @param scrollPosition
 * @param sampleRate
 * @param dataMap
 * @returns
 */
export default (
  options: ManagerOptions,
  intervals: AudioInterval[],
  dataMap: Map<string, Float32Array>,
  startPosition: number,
  width: number,
  shift: number,
  lastValue: Float32Array
): Float32Array => {
  const sampleSize = Math.ceil(options.samplesPerPixel / options.resolution);
  const start = options.scrollPosition * options.samplesPerPixel;
  const startSecond = start / options.samplerate;
  const secondsPerPixel = options.samplesPerPixel / options.samplerate;
  const calcStartSecond = startSecond + startPosition * secondsPerPixel;
  const calcEndSecond = calcStartSecond + width * secondsPerPixel;

  const absShift = Math.abs(shift) * 4;
  const shiftTarget = shift > 0 ? 0 : absShift;
  const shiftStart = shift > 0 ? absShift : 0;

  let peaks = new Float32Array(lastValue.buffer)
    .copyWithin(shiftTarget, shiftStart)
    .fill(0, startPosition * 4, (startPosition + width) * 4);

  let currentIntervalIndex = intervals.findIndex(
    i => i.end > calcStartSecond && i.start + i.offsetStart < calcEndSecond
  );

  // There are no intervals in this range so return empty array
  if (currentIntervalIndex === -1) {
    return peaks;
  }

  const maxIntervalIncrementIndex = intervals.length - 1;

  let currentInterval = intervals[currentIntervalIndex];
  let buffer = dataMap.get(currentInterval.source);

  // For each pixel we display
  for (let i = startPosition; i < startPosition + width; i++) {
    const currentSecond = startSecond + i * secondsPerPixel;

    if (currentSecond >= currentInterval.end) {
      if (currentIntervalIndex === maxIntervalIncrementIndex) {
        return peaks;
      } else {
        currentInterval = intervals[++currentIntervalIndex];
        buffer = dataMap.get(currentInterval.source);
      }
    }

    if (currentInterval.start + currentInterval.offsetStart > currentSecond) {
      peaks.set([0, 0, 0, 0], i * 4);
      continue;
    }

    const startBorder =
      currentSecond - secondsPerPixel <
      currentInterval.start + currentInterval.offsetStart;
    const endBorder = currentSecond + secondsPerPixel > currentInterval.end;
    const intervalBorder = startBorder || endBorder ? 1 : 0;

    if (buffer == null) {
      peaks.set([0, 0, intervalBorder, 1], i * 4);
      continue;
    }

    const secondsIntoInterval = currentSecond - currentInterval.start;
    const startSample = Math.floor(secondsIntoInterval * options.samplerate);

    const endSample = startSample + options.samplesPerPixel;
    const length = buffer.length;
    const loopEnd = length < endSample ? length : endSample;

    // Cycle through the data-points relevant to the pixel
    // Don't cycle through more than sampleSize frames per pixel.
    let posSum = 0,
      negSum = 0,
      count = 0;
    for (let j = startSample; j < loopEnd; j += sampleSize, count++) {
      const val = buffer[j];
      // Keep track of positive and negative values separately
      if (val > 0) {
        posSum += val * val;
      } else {
        negSum += val * val;
      }
    }

    const min = -Math.sqrt(negSum / count);
    const max = Math.sqrt(posSum / count);

    peaks.set([min, max, intervalBorder, 1], i * 4);
  }
  return peaks;
};
