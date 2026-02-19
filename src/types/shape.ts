export type ShapeType = 'point' | 'line' | 'polyline' | 'polygon' | 'rectangle' | 'circle' | 'rawline';

export interface BaseShape {
  id: string;
  type: ShapeType;
  strokeColor: string;
  strokeWidth: number;
}

export interface PointShape extends BaseShape {
  type: 'point';
  x: number;
  y: number;
}

export interface LineShape extends BaseShape {
  type: 'line';
  points: [number, number, number, number]; // [x1, y1, x2, y2]
}

export interface PolylineShape extends BaseShape {
  type: 'polyline';
  points: number[]; // [x1, y1, x2, y2, x3, y3, ...]
}

export interface PolygonShape extends BaseShape {
  type: 'polygon';
  points: number[];
}

export interface RectangleShape extends BaseShape {
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CircleShape extends BaseShape {
  type: 'circle';
  x: number;
  y: number;
  radius: number;
}

export interface RawlineShape extends BaseShape {
  type: 'rawline';
  points: number[]; // [x1, y1, x2, y2, x3, y3, ...]
}

export type Shape = PointShape | LineShape | PolylineShape | PolygonShape | RectangleShape | CircleShape | RawlineShape;

export type DrawingTool = ShapeType | 'select';

export interface CanvasState {
  shapes: Shape[];
  selectedId: string | null;
  activeTool: DrawingTool;
  strokeColor: string;
  strokeWidth: number;
  imageWidth: number;
  imageHeight: number;
  imageData: string | null;
}

export interface HistoryState {
  past: Shape[][];
  present: Shape[];
  future: Shape[][];
}
