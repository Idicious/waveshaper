import WaveShaper from "./core/waveshaper";
import Track from "./core/track";
import AudioInterval from "./models/interval";
import defaultConfig, {
  ManagerInput,
  ManagerOptions
} from "./config/managerconfig";
import rms from "./strategies/rms";
import peak from "./strategies/peak";

export {
  WaveShaper,
  Track,
  AudioInterval,
  defaultConfig,
  rms,
  peak,
  ManagerOptions,
  ManagerInput
};
