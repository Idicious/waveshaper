import defaultOptions, { ManagerOptions, ManagerInput } from "../config/managerconfig";

export type InteractionMode = 'pan' | 'drag' | 'cut' | 'resize';
export type GenerateId = () => string;
export type GetTarget = (ev: Event) => HTMLElement;


export interface DomOptions extends ManagerOptions {
    getEventTarget: GetTarget;
    registerSetsActive: boolean;
    height: number;
    generateId: GenerateId;
    mode: InteractionMode;
}

export interface DomInput extends ManagerInput {
    getEventTarget?: GetTarget;
    registerSetsActive?: boolean;
    height?: number;
    generateId?: GenerateId;
    mode?: InteractionMode;
}

const defaultDomOptions: DomOptions = {
    ...defaultOptions,
    mode: 'pan',
    height: 150,
    getEventTarget: (ev) => <HTMLElement>ev.target,
    generateId: () => Math.random().toString(),
    registerSetsActive: true 
}

export default defaultDomOptions;