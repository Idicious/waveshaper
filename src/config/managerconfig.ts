export type DrawStyle = 'fill' | 'stroke';
export type MeterType = 'peak' | 'rms';
export type InteractionMode = 'pan' | 'drag' | 'cut' | 'resize';

export interface ManagerOptions {
    scrollPosition: number;
    samplesPerPixel: number;
    resolution: number;
    drawStyle: DrawStyle,
    meterType: MeterType,
    mode: InteractionMode,
    width: number,
    height: number
}

const defaultOptions: ManagerOptions = {
    scrollPosition: 0,
    samplesPerPixel: 1024,
    resolution: 1,
    drawStyle: 'fill',
    meterType: 'rms',
    mode: 'pan',
    width: 300,
    height: 150
}

export default defaultOptions;