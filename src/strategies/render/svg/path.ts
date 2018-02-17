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
export default (waveform: number[][], height: number, width: number, element: HTMLElement, drawStyle: string) => {
    const factor = height / 2;
    const length = waveform.length;
    let d = '';
    d += ` M0, ${factor}`;

    // "for" is used for faster iteration
    for (let i = 0; i < length; i++) {
        d += ` L${~~(i)}, ${(Math.round(waveform[i][0] * factor) + factor)}`;
    }
    d += ` L${length}, ${factor}`;

    d += ` M0, ${factor}`;

    for (let i = 0; i < length; i++) {
        d += ` L${~~(i)}, ${(Math.round(waveform[i][1] * factor) + factor)}`;
    }

    d += ` L${length}, ${factor}`;

    if(element.firstChild != null) {
        const svg = <SVGSVGElement> element.firstChild;
        if(svg != null) {
            const path = <SVGPathElement>svg.firstChild;
            path.setAttribute('d', d);
            return;
        }
    }

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('height', height.toString());
    svg.setAttribute('width', width.toString());
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke', 'black');
    svg.appendChild(path);
    path.setAttribute('d', d);
    
    element.appendChild(svg);
}