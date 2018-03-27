import { ManagerOptions } from "../config/managerconfig";
import Interval from '../models/interval';

declare type WaveShaperCallback = (options: ManagerOptions, data: Float32Array) => void;

declare type OptionsCallback = (old: ManagerOptions, updated: ManagerOptions) => void;

declare type SegmentCallback = (old: Interval, updated: Interval) => void;

export {
  WaveShaperCallback,
  SegmentCallback,
  OptionsCallback
}