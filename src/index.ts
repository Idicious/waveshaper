import WaveShapeManager from "./core/manager";
import WaveShaper from './core/waveshaper'
import Segment from './models/segment';

export { WaveShapeManager, WaveShaper, Segment };

(window as any)["WaveShapeManager"] = WaveShapeManager;