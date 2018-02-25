import WaveShapeManager from "./core/manager";
import WaveShaper from './core/waveshaper'
import Interval from './models/interval';
import { addInteraction, DomRenderWaveShapeManager } from './dom';
import defaultConfig from './config/managerconfig';
import rms from './strategies/rms';
import peak from './strategies/peak';
import flatten from './methods/flatten';

export {
    WaveShapeManager,
    WaveShaper,
    Interval,
    addInteraction,
    DomRenderWaveShapeManager,
    defaultConfig,
    rms,
    peak,
    flatten
};

export default WaveShapeManager;