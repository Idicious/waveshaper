export type MeterType = 'peak' | 'rms';
export type InteractionMode = 'pan' | 'drag' | 'cut' | 'resize';

export type GenerateId = () => string;
export type GetTarget = (ev: Event) => HTMLElement;

export interface ManagerOptions {
    scrollPosition: number;
    samplesPerPixel: number;
    resolution: number;
    meterType: MeterType;
    mode: InteractionMode;
    width: number;
    height: number;
    generateId: GenerateId;
    samplerate: number;
    getEventTarget: GetTarget;
}

export interface ManagerInput {
    scrollPosition?: number;
    samplesPerPixel?: number;
    resolution?: number;
    meterType?: MeterType;
    mode?: InteractionMode;
    width?: number;
    height?: number;
    generateId?: GenerateId;
    samplerate?: number;
    getEventTarget?: GetTarget;
}

const defaultOptions: ManagerOptions = {
    scrollPosition: 0,
    samplesPerPixel: 1024,
    resolution: 10,
    meterType: 'rms',
    mode: 'pan',
    width: 300,
    height: 150,
    generateId: () => Math.random.toString(),
    samplerate: 44100,
    getEventTarget: (ev) => <HTMLElement>ev.target
}

export default defaultOptions;