import { WaveShapeManager, Interval, defaultConfig } from "../../../src";

describe('WaveShapeManager class tests', () => {

    it('Can be created with default settings.', () => {
        const manager = new WaveShapeManager();

        expect(manager).not.toBeNull();

        const options = manager.options;

        expect(options.samplerate).toBe(defaultConfig.samplerate);
        expect(options.mode).toBe(defaultConfig.mode);
        expect(options.meterType).toBe(defaultConfig.meterType);
        expect(options.width).toBe(defaultConfig.width);
        expect(options.height).toBe(defaultConfig.height);
        expect(options.samplesPerPixel).toBe(defaultConfig.samplesPerPixel);
        expect(options.scrollPosition).toBe(defaultConfig.scrollPosition);
        expect(options.resolution).toBe(defaultConfig.resolution);

        const newId = manager.options.generateId();
        expect(newId).not.toBeNull();
    });

    it('Can be created with partial config.', () => {
        const manager = new WaveShapeManager({ samplesPerPixel: 333 });

        const options = manager.options;
        
        expect(options.samplesPerPixel).toBe(333);
        expect(options.width).toBe(defaultConfig.width);
    });

    it('Throws with invalid options.', () => {

        expect(() => new WaveShapeManager({samplesPerPixel: null} as any)).toThrow();
        expect(() => new WaveShapeManager().set({samplesPerPixel: null} as any)).toThrow();
    });

    it('Can add WaveShapers', () => {
        const segments: Interval[] = [
            { id: 'abc', start: 0, end: 30, index: 1, offsetStart: 0, source: '1' }
        ];

        const manager = new WaveShapeManager();
        const waveShaper = manager.setTracks({ id: '1', segments }).getTrack('1');

        expect(waveShaper).not.toBeNull();
    });

    it('Can add AudioData.', (done) => {
        const segments: Interval[] = [
            { id: 'abc', start: 0, end: 30, index: 1, offsetStart: 0, source: '1' },
            { id: 'def', start: 40, end: 70, index: 2, offsetStart: 0, source: '2' },
            { id: 'ghi', start: 600, end: 630, index: 3, offsetStart: 0, source: '1' }
        ];
        const tracks = ['1', '2'].map(id => ({ id, segments }));

        const ctx = new AudioContext();
        const manager = new WaveShapeManager({ samplerate: ctx.sampleRate, width: 10000 });
        manager.setTracks(...tracks);

        fetch('assets/audio/GTR.wav')
            .then(res => res.arrayBuffer())
            .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
            .then(data => {
                manager.addData({ id: '1', data })
                    .process()
                    .set({ meterType: 'peak' })
                    .process();
                done();
            });
    });

    it('Respects activeWaveShapers property.', () => {
        const segments = [
            { id: 'abc', start: 0, end: 30, index: 2, offsetStart: 0, source: '1' },
            { id: 'def', start: 5, end: 35, index: 1, offsetStart: 0, source: '1' },
            { id: 'ghi', start: 100, end: 130, index: 1, offsetStart: 0, source: '1' },
            { id: 'jkl', start: 110, end: 140, index: 2, offsetStart: 0, source: '1' },
            { id: 'jkl', start: 111, end: 141, index: 1, offsetStart: 0, source: '1' },
            { id: 'mno', start: 200, end: 230, index: 1, offsetStart: 0, source: '1' }
        ];
        const tracks = ['1',  '2'].map(id => ({ id, segments }));

        const manager = new WaveShapeManager();
        const callback1Spy = jasmine.createSpy();
        const callback2Spy = jasmine.createSpy();

        manager.setTracks(...tracks)
            .on('1', callback1Spy)
            .on('2', callback2Spy)

        const waveShaper1 = manager.getTrack('1');
        const waveShaper2 = manager.getTrack('2');

        if(waveShaper1 == null || waveShaper2 == null) {
            return fail('Waveshapers not created succesfully');
        }

        const waveShaper1DrawSpy = spyOn(waveShaper1, 'calculate');
        const waveShaper2DrawSpy = spyOn(waveShaper2, 'calculate');
        
        manager.setActive('1').process();

        expect(callback1Spy.calls.count()).toBe(1);
        expect(callback2Spy.calls.count()).toBe(0);

        expect(waveShaper1DrawSpy.calls.count()).toBe(1);
        expect(waveShaper2DrawSpy.calls.count()).toBe(0);

        manager.setActive().process();

        expect(callback1Spy.calls.count()).toBe(2);
        expect(callback2Spy.calls.count()).toBe(1);

        expect(waveShaper1DrawSpy.calls.count()).toBe(2);
        expect(waveShaper2DrawSpy.calls.count()).toBe(1);

        manager.setActive('2').process();

        expect(callback1Spy.calls.count()).toBe(2);
        expect(callback2Spy.calls.count()).toBe(2);

        expect(waveShaper1DrawSpy.calls.count()).toBe(2);
        expect(waveShaper2DrawSpy.calls.count()).toBe(2);
    });

    it('Call callbacks correctly', () => {
        const segments = [
            { id: 'abc', start: 0, end: 33, index: 1, offsetStart: 0, source: '1' },
            { id: 'def', start: 1, end: 31, index: 2, offsetStart: 0, source: '1' }
        ];
        const tracks = ['1', '2'].map(id => ({ id, segments }));

        const manager = new WaveShapeManager();
        const spy = jasmine.createSpy();

        manager.on("1", spy)
            .setTracks(...tracks)
            .process();

        expect(spy.calls.count()).toBe(1);
    });

    it('Removes callbacks when off is called', () => {
        const segments = [
            { id: 'abc', start: 0, end: 30, index: 1, offsetEnd: 0, offsetStart: 0, source: '1' },
            { id: 'def', start: 0, end: 30, index: 1, offsetEnd: 0, offsetStart: 0, source: '1' }
        ];
        const tracks = ['1', '2'].map(id => ({ id, segments }));

        const manager = new WaveShapeManager();
        const spy = jasmine.createSpy();

        manager.setTracks(...tracks)
            .on("1", spy)
            .process()
            .off("1", spy)
            .process()
            .on("1", spy)
            .process();

        expect(spy.calls.count()).toBe(2);
    });

    it('Stores the last process result.', () => {
        const segments = [
            { id: 'abc', start: 0, end: 30, index: 1, offsetStart: 0, source: '1' },
            { id: 'def', start: 0, end: 30, index: 1, offsetStart: 0, source: '1' }
        ];
        const tracks = ['1', '2'].map(id => ({ id, segments }));
        const manager = new WaveShapeManager();

        manager.setTracks(...tracks)
            .process();

        expect(manager.lastProcessResult).not.toBeNull();
    });

    it('Calculates duration correctly.', () => {
        const segments = [
            { id: 'abc', start: 0, end: 30, index: 1, offsetStart: 0, source: '1' },
            { id: 'def', start: 20, end: 50, index: 1, offsetStart: 0, source: '1' }
        ];
        const tracks = ['1', '2'].map(id => ({ id, segments }));
        const manager = new WaveShapeManager();

        manager.setTracks(...tracks);
        expect(manager.duration).toBe(50);
    });

    it('Updates values with set.', () => {
        const manager = new WaveShapeManager();
        expect(manager.options.samplesPerPixel).toBe(defaultConfig.samplesPerPixel);

        manager.set({ samplesPerPixel: 1024 });
        expect(manager.options.samplesPerPixel).toBe(1024);
    });

    it('Updates segments when setTrack is called with same id more than once', () => {
        let segments = [
            { id: 'abc', start: 0, end: 30, index: 1, offsetStart: 0, source: '1' },
            { id: 'def', start: 0, end: 30, index: 1, offsetStart: 0, source: '1' }
        ];
        let tracks = ['1', '2'].map(id => ({ id, segments }));
        const manager = new WaveShapeManager();

        manager.setTracks(...tracks);
        expect(manager.duration).toBe(30);

        segments = [
            { id: 'abc', start: 0, end: 30, index: 1, offsetStart: 0, source: '1' },
            { id: 'def', start: 20, end: 50, index: 1, offsetStart: 0, source: '1' }
        ];
        tracks = ['1', '2'].map(id => ({ id, segments }));

        manager.setTracks(...tracks);
        expect(manager.duration).toBe(50);
    });

    it('Removes a track succesfully', () => {
        const segments = [
            { id: 'abc', start: 0, end: 30, index: 1, offsetStart: 0, source: '1' },
            { id: 'def', start: 20, end: 50, index: 1, offsetStart: 0, source: '1' }
        ];
        const tracks = ['1', '2'].map(id => ({ id, segments }));
        const manager = new WaveShapeManager();

        manager.setTracks(...tracks).removeTracks('1');

        expect(manager.getTrack('1')).toBeUndefined();
        expect(manager.getTrack('2')).not.toBeUndefined();
    });

    it('Removes callbacks when removing tracks', () => {
        const segments = [
            { id: 'abc', start: 0, end: 30, index: 1, offsetStart: 0, source: '1' },
            { id: 'def', start: 20, end: 50, index: 1, offsetStart: 0, source: '1' }
        ];
        const tracks = ['1', '2'].map(id => ({ id, segments }));
        const manager = new WaveShapeManager();

        manager
            .setTracks(...tracks)
            .on('1', () => null)
            .removeTracks('1');

        expect(manager.getTrack('1')).toBeUndefined();
        expect(manager.getTrack('2')).not.toBeUndefined();
    });

    it('Ignores off requests to non existant tracks and callbacks', () => {
        const segments = [
            { id: 'abc', start: 0, end: 30, index: 1, offsetStart: 0, source: '1' },
            { id: 'def', start: 20, end: 50, index: 1, offsetStart: 0, source: '1' }
        ];
        const tracks = ['1', '2'].map(id => ({ id, segments }));
        const noop = () => { };

        const manager = new WaveShapeManager();

        manager.off('1', noop);
        manager.setTracks(...tracks);

        manager.on('1', () => {});
        manager.off('1', noop);
    });

    it('Ignores process of non existant tracks', () => {
        const manager = new WaveShapeManager();
        manager.process('1');
    });

    it('Flattens existing tracks', () => {
        const segments = [
            { id: 'abc', start: 0, end: 30, index: 1, offsetStart: 0, source: '1' },
            { id: 'def', start: 20, end: 50, index: 1, offsetStart: 0, source: '1' }
        ];
        const tracks = ['1', '2'].map(id => ({ id, segments }));

        const manager = new WaveShapeManager();
        manager.setTracks(...tracks)
            .flatten()
            .flatten('1', '2');
    });

    it('Ignores flatten on non existant tracks', () => {
        const segments = [
            { id: 'abc', start: 0, end: 30, index: 1, offsetStart: 0, source: '1' },
            { id: 'def', start: 20, end: 50, index: 1, offsetStart: 0, source: '1' }
        ];
        const tracks = ['1', '2'].map(id => ({ id, segments }));

        const manager = new WaveShapeManager();
        manager.setTracks(...tracks)
            .flatten('3');
    });
});