/**
 * 
 * 
 * @export
 * @param {number[][]} waveform Sampled data for each pixel, max at 0, min at 1 
 * @param {number} height 
 * @param {number} width 
 * @param {SVGElement} element 
 * @param {string} drawStyle 
 */
export function drawSvgPath(waveform, height, width, element, drawStyle) {
    let d = '';
    // "for" is used for faster iteration
    for (let i = 0; i < waveform.length; i++) {
        d += ` M${~~(i / 2)}, ${waveform[0][i]}`;
        d += ` L${~~(i / 2)}, ${waveform[1][i]}`;
    }

    const path = document.createElement('path');
    path.setAttribute('d', d);

    if(element.firstChild != null) {
        element.replaceChild(path, element.firstChild);
    } else {
        element.appendChild(path);
    }
}