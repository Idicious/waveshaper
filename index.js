import { WaveShaper } from "./src/core/waveshaper";
import { WaveShapeManager } from "./src/core/manager";
import { Schedular } from './src/schedular/schedular';

export { WaveShaper };
export { WaveShapeManager };
export { Schedular };

window["WaveShaper"] = WaveShaper;
window["WaveShapeManager"] = WaveShapeManager;
window["Schedular"] = Schedular;