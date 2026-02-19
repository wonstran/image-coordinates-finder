import { Shape, ShapeType } from '@/types/shape';

export function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export function getShapeCenter(shape: Shape): { x: number; y: number } {
  switch (shape.type) {
    case 'point':
      return { x: shape.x, y: shape.y };
    case 'line':
    case 'rawline':
      return {
        x: (shape.points[0] + shape.points[shape.points.length - 2]) / 2,
        y: (shape.points[1] + shape.points[shape.points.length - 1]) / 2,
      };
    case 'polyline':
    case 'polygon': {
      const points = shape.points;
      let sumX = 0, sumY = 0;
      for (let i = 0; i < points.length; i += 2) {
        sumX += points[i];
        sumY += points[i + 1];
      }
      return {
        x: sumX / (points.length / 2),
        y: sumY / (points.length / 2),
      };
    }
    case 'rectangle':
      return {
        x: shape.x + shape.width / 2,
        y: shape.y + shape.height / 2,
      };
    case 'circle':
      return { x: shape.x, y: shape.y };
  }
}

export function formatCoordinates(shape: Shape): string {
  switch (shape.type) {
    case 'point':
      return `x: ${shape.x.toFixed(2)}, y: ${shape.y.toFixed(2)}`;
    case 'line':
      return `x1: ${shape.points[0].toFixed(2)}, y1: ${shape.points[1].toFixed(2)}, x2: ${shape.points[2].toFixed(2)}, y2: ${shape.points[3].toFixed(2)}`;
    case 'rawline':
    case 'polyline':
    case 'polygon': {
      const points: string[] = [];
      for (let i = 0; i < shape.points.length; i += 2) {
        points.push(`(${shape.points[i].toFixed(2)}, ${shape.points[i + 1].toFixed(2)})`);
      }
      return `points: [${points.join(', ')}]`;
    }
    case 'rectangle':
      return `x: ${shape.x.toFixed(2)}, y: ${shape.y.toFixed(2)}, width: ${shape.width.toFixed(2)}, height: ${shape.height.toFixed(2)}`;
    case 'circle':
      return `x: ${shape.x.toFixed(2)}, y: ${shape.y.toFixed(2)}, radius: ${shape.radius.toFixed(2)}`;
  }
}

export function getShapeBounds(shape: Shape): { x: number; y: number; width: number; height: number } {
  switch (shape.type) {
    case 'point':
      return { x: shape.x - 5, y: shape.y - 5, width: 10, height: 10 };
    case 'line':
    case 'rawline': {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (let i = 0; i < shape.points.length; i += 2) {
        minX = Math.min(minX, shape.points[i]);
        maxX = Math.max(maxX, shape.points[i]);
        minY = Math.min(minY, shape.points[i + 1]);
        maxY = Math.max(maxY, shape.points[i + 1]);
      }
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
    case 'polyline':
    case 'polygon': {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (let i = 0; i < shape.points.length; i += 2) {
        minX = Math.min(minX, shape.points[i]);
        maxX = Math.max(maxX, shape.points[i]);
        minY = Math.min(minY, shape.points[i + 1]);
        maxY = Math.max(maxY, shape.points[i + 1]);
      }
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
    case 'rectangle':
      return { x: shape.x, y: shape.y, width: shape.width, height: shape.height };
    case 'circle':
      return { x: shape.x - shape.radius, y: shape.y - shape.radius, width: shape.radius * 2, height: shape.radius * 2 };
  }
}
