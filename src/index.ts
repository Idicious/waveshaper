import WaveShaper from "./core/waveshaper";
import Track from './core/track'
import Interval from './models/interval';
import DomRenderWaveShaper from './dom';
import defaultConfig from './config/managerconfig';
import rms from './strategies/rms';
import peak from './strategies/peak';
import flatten from './methods/flatten';

export {
    WaveShaper,
    Track,
    Interval,
    DomRenderWaveShaper,
    defaultConfig,
    rms,
    peak,
    flatten
};

export default new DomRenderWaveShaper();