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
    const factor = height / 2;
    let d = '';
    d += ` M0, ${factor}`;

    // "for" is used for faster iteration
    for (let i = 0; i < waveform.length; i++) {
        d += ` L${~~(i)}, ${(waveform[i][0] * factor) + factor}`;
    }
    d += ` L${waveform.length}, ${factor}`;

    d += ` M0, ${factor}`;

    for (let i = 0; i < waveform.length; i++) {
        d += ` L${~~(i)}, ${(waveform[i][1] * factor) + factor}`;
    }

    d += ` L${waveform.length}, ${factor}`;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('height', element.height);
    svg.setAttribute('width', element.width);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('height', element.height);
    path.setAttribute('stroke', 'black');
    svg.appendChild(path);
    path.setAttribute('d', d);

    if(element.firstChild != null) {
        element.replaceChild(svg, element.firstChild);
    } else {
        element.appendChild(svg);
    }
}