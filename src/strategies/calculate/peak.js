import { Interval } from '../../models/interval';

/**
 * 
 * 
 * @export
 * @param {number} sampleRatio 
 * @param {number} samplesPerPixel 
 * @param {number} width 
 * @param {Interval[]} segments 
 * @param {number} scrollPosition 
 * @param {number} sampleRate
 * @returns 
 */
export function calculatePeaks(sampleRatio, samplesPerPixel, width, segments, scrollPosition, sampleRate) {
    const sampleSize = Math.max(1, samplesPerPixel / sampleRatio);
    const start = scrollPosition * samplesPerPixel;
    const startSecond = start / sampleRate;

    const vals = [];

    // For each pixel we display
    for (let i = 0; i < width; i++) {
        let posMax = 0;
        let negMax = 0;

        const currentSecond = startSecond + ((i * samplesPerPixel) / sampleRate);
        const interval = segments.find(s => s.start <= currentSecond && s.end >= currentSecond);

        if(interval == null) {
            vals.push([negMax, posMax]);
            continue;
        }

        const offsetStart = interval.start - interval.originalStart;
        const secondsIntoInterval = currentSecond - interval.start;
        const startSample = Math.floor(((secondsIntoInterval + offsetStart) * sampleRate));

        // Cycle through the data-points relevant to the pixel
        // Don't cycle through more tha n sampleSize frames per pixel.
        for (let j = 0; j < samplesPerPixel; j += sampleSize) {
            const index = j + startSample;
            if (index < interval.data.length) {
                const val = interval.data[index];

                // Keep track of positive and negative values separately
                if (val > 0 && val > posMax) {
                    posMax = val;
                } else if (val < negMax) {
                    negMax = val;
                }
            }
        }
        vals.push([negMax, posMax]);
    }
    return vals;
}

/**
 * 
 * 
 * @export
 * @param {number} sampleRatio 
 * @param {number} samplesPerPixel 
 * @param {number} width 
 * @param {Interval[]} segments 
 * @param {number} scrollPosition 
 * @param {number} sampleRate
 * @returns 
 */
// export function calculatePeaks2(sampleRatio, samplesPerPixel, width, segments, scrollPosition, sampleRate) {
//     const sampleSize = Math.max(1, samplesPerPixel / sampleRatio);
//     const start = scrollPosition * samplesPerPixel;
//     const startSecond = start / sampleRate;
//     const endSecond = startSecond + (width * samplesPerPixel / sampleRate);

//     const intervals = segments.filter(s => s.start <= endSecond && s.end >= startSecond);
//     const vals = [];

//     for(let interval of intervals) {
//         const startPixel = Math.floor(Math.max(interval.start - startSecond, 0) * sampleRate / samplesPerPixel);
//         const endPixel = startPixel + ((interval.end - interval.start) * sampleRate / samplesPerPixel);
//     }

//     // For each pixel we display
//     for (let i = 0; i < width; i++) {
//         let posMax = 0;
//         let negMax = 0;

//         const currentSecond = startSecond + ((i * samplesPerPixel) / sampleRate);
//         const interval = segments.find(s => s.start <= currentSecond && s.end >= currentSecond);

//         if(interval == null) {
//             vals.push([negMax, posMax]);
//             continue;
//         }

//         const startSample = Math.floor(((startSecond - interval.originalStart) * sampleRate) + (i * samplesPerPixel));

//         // Cycle through the data-points relevant to the pixel
//         // Don't cycle through more tha n sampleSize frames per pixel.
//         for (let j = 0; j < samplesPerPixel; j += sampleSize) {
//             const index = j + startSample;
//             if (index < interval.data.length) {
//                 const val = interval.data[index];

//                 // Keep track of positive and negative values separately
//                 if (val > 0 && val > posMax) {
//                     posMax = val;
//                 } else if (val < negMax) {
//                     negMax = val;
//                 }
//             }
//         }
//         vals.push([negMax, posMax]);
//     }
//     return vals;
// }