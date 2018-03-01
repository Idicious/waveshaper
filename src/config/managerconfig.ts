export type MeterType = 'peak' | 'rms';

export interface ManagerOptions {
    scrollPosition: number;
    samplesPerPixel: number;
    resolution: number;
    meterType: MeterType;
    width: number;
    samplerate: number;
}

export interface ManagerInput {
    scrollPosition?: number;
    samplesPerPixel?: number;
    resolution?: number;
    meterType?: MeterType;
    width?: number;
    samplerate?: number;
}

const defaultOptions: ManagerOptions = {
    scrollPosition: 0,
    samplesPerPixel: 1024,
    resolution: 10,
    meterType: 'rms',
    width: 300,
    samplerate: 44100
}

export default defaultOptions;