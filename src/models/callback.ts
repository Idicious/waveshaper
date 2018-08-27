import { ManagerOptions } from "../config/managerconfig";
import AudioInterval from "../models/interval";

declare type WaveShaperCallback = (
  options: ManagerOptions,
  data: Float32Array,
  start: number,
  width: number,
  shift: number
) => void;

declare type OptionsCallback = (
  old: ManagerOptions,
  updated: ManagerOptions
) => void;

declare type SegmentCallback = (
  old: AudioInterval | null,
  updated: AudioInterval | null
) => void;

export { WaveShaperCallback, SegmentCallback, OptionsCallback };
