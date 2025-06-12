declare module '@maptiler/sdk' {
  export interface MapOptions {
    container: string | HTMLElement;
    style: string;
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
  }

  export class Map {
    constructor(options: MapOptions);
    on(event: string, callback: (...args: unknown[]) => void): void;
    off(event: string, callback: (...args: unknown[]) => void): void;
    remove(): void;
  }
}
