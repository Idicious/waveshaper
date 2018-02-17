import WaveShapeManager from "./src/core/manager";
import Segment from './src/models/segment';

export { WaveShapeManager, Segment };

(window as any)["WaveShapeManager"] = WaveShapeManager;