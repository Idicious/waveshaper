export type MeterType = 'peak' | 'rms';
export type InteractionMode = 'pan' | 'drag' | 'cut' | 'resize';

export type GenerateId = () => string;

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
    samplerate: 44100
}

export default defaultOptions;