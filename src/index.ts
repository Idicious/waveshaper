import WaveShapeManager from "./core/manager";
import WaveShaper from './core/waveshaper'
import Segment from './models/segment';
import Interval from './models/interval';
import { addInteraction, DomRenderWaveShapeManager } from './dom';
import defaultConfig from './config/managerconfig';

export { 
    WaveShapeManager,
     WaveShaper, 
     Segment, 
     Interval, 
     addInteraction, 
     DomRenderWaveShapeManager, 
     defaultConfig 
};

export default WaveShapeManager;