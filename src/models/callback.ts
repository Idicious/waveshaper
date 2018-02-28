import { ManagerOptions } from "../config/managerconfig";

declare type WaveShaperCallback = (options: ManagerOptions, data: Float32Array) => void;

export default WaveShaperCallback;