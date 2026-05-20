export interface FlowcapStore {
  count(key: string, windowMs: number): number;
  add(key: string, windowMs: number): void;
  resetTime(key: string, windowMs: number): number;
  clear(key?: string): void;
}

export interface FlowcapOptions {
  limit?: number;
  window?: string | number;
  keyBy?: (req: any) => string;
  skip?: (req: any) => boolean;
  onLimit?: (req: any, res: any, next: (err?: any) => void) => void;
  legacyHeaders?: boolean;
  store?: FlowcapStore;
}

export interface FlowcapMiddleware {
  (req: any, res: any, next: (err?: any) => void): void;
}

declare function flowcap(options?: FlowcapOptions): FlowcapMiddleware;

declare namespace flowcap {
  export function login(overrides?: FlowcapOptions): FlowcapMiddleware;
  export function api(overrides?: FlowcapOptions): FlowcapMiddleware;
  export function strict(overrides?: FlowcapOptions): FlowcapMiddleware;
  export function loose(overrides?: FlowcapOptions): FlowcapMiddleware;
  export class Store implements FlowcapStore {
    constructor();
    count(key: string, windowMs: number): number;
    add(key: string, windowMs: number): void;
    resetTime(key: string, windowMs: number): number;
    clear(key?: string): void;
  }
}

export = flowcap;
