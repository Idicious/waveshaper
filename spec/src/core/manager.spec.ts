import { WaveShapeManager, WaveShaper } from "../../../src";
import defaultConfig from '../../../src/config/managerconfig';

describe('WaveShapeManager class tests', () => {
    let container: HTMLElement;
    let ctx: AudioContext;

    beforeEach(() => {
        container = document.createElement('div');
        ctx = new AudioContext();
    });

    afterEach(() => {
        ctx.close();
    });

    it('Can be created with default settings.', () => {
        const manager = new WaveShapeManager(ctx.sampleRate, container);

        expect(manager).not.toBeNull();

        expect(manager.samplerate).toBe(ctx.sampleRate);
        expect(manager.mode).toBe(defaultConfig.mode);
        expect(manager.meterType).toBe(defaultConfig.meterType);
        expect(manager.width).toBe(defaultConfig.width);
        expect(manager.height).toBe(defaultConfig.height);
        expect(manager.samplesPerPixel).toBe(defaultConfig.samplesPerPixel);
        expect(manager.scrollPosition).toBe(defaultConfig.scrollPosition);
        expect(manager.resolution).toBe(defaultConfig.resolution);
    });

    it('Can be created with partial config.', () => {
        const options = {
            samplesPerPixel: 333,
        };

        const manager = new WaveShapeManager(ctx.sampleRate, container, options as any);

        expect(manager.samplesPerPixel).toBe(333);
        expect(manager.width).toBe(defaultConfig.width);
    });

    it('Can add WaveShapers', () => {
        const segments = [
            { id: 'abc', start: 0, duration: 30, index: 1, offsetEnd: 0, offsetStart: 0, source: '1' }
        ];

        const manager = new WaveShapeManager(ctx.sampleRate, container);
        const waveShaper = manager.addWaveShaper('1', segments, 'whitesmoke');

        const foundWaveShaper = manager.getWaveShaper('1');
        if(foundWaveShaper == undefined) {
            fail('Failed to add waveshaper, null when calling getWaveShaper with same id.')
        }

        expect(foundWaveShaper).toEqual(waveShaper);
        expect((<WaveShaper>foundWaveShaper).segments[0].id).toBe('abc');
    });

    it('Can add AudioData and calls draw when added.', (done) => {
        const manager = new WaveShapeManager(ctx.sampleRate, container);
        const drawSpy = spyOn(manager, "draw");

        fetch('assets/audio/GTR.wav')
            .then(res => res.arrayBuffer())
            .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                manager.addAudioData('1', audioBuffer);
                expect(manager.audioData.get('1')).toEqual(audioBuffer.getChannelData(0));
                expect(drawSpy.calls.count()).toBe(1);

                done();
            });
    });

    it('Respects activeWaveShapers property.', () => {
        const segments = [
            { id: 'abc', start: 0, duration: 30, index: 1, offsetEnd: 0, offsetStart: 0, source: '1' },
            { id: 'def', start: 0, duration: 30, index: 1, offsetEnd: 0, offsetStart: 0, source: '1' }
        ];

        const manager = new WaveShapeManager(ctx.sampleRate, container);

        const waveShaper1 = manager.addWaveShaper('1', [segments[0]], 'blue');
        const waveShaper2 = manager.addWaveShaper('2', [segments[0]], 'red');

        const waveShaper1DrawSpy = spyOn(waveShaper1, 'draw');
        const waveShaper2DrawSpy = spyOn(waveShaper2, 'draw');

        expect(waveShaper1).not.toBeNull();
        expect(waveShaper2).not.toBeNull();

        manager.activeWaveShapers = ['1'];
        manager.draw(null, true);

        expect(waveShaper1DrawSpy.calls.count()).toBe(1);
        expect(waveShaper2DrawSpy.calls.count()).toBe(0);

        manager.activeWaveShapers = null;
        manager.draw(null, true);

        expect(waveShaper1DrawSpy.calls.count()).toBe(2);
        expect(waveShaper2DrawSpy.calls.count()).toBe(1);

        manager.activeWaveShapers = ['2'];
        manager.draw(null, true);

        expect(waveShaper1DrawSpy.calls.count()).toBe(2);
        expect(waveShaper2DrawSpy.calls.count()).toBe(2);
    });
});