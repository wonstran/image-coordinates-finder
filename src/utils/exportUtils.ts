import { Shape } from '@/types/shape';

export type CoordinateType = 'absolute' | 'relative';

export interface ExportData {
  version: string;
  imageWidth: number;
  imageHeight: number;
  coordinateType: CoordinateType;
  exportDate: string;
  shapes: Shape[];
}

// Helper functions to convert coordinates
function toRelativeCoord(value: number, dimension: number): number {
  return dimension > 0 ? value / dimension : 0;
}

function convertPoint(x: number, y: number, imageWidth: number, imageHeight: number, toRelative: boolean) {
  if (toRelative) {
    return {
      x: toRelativeCoord(x, imageWidth),
      y: toRelativeCoord(y, imageHeight),
    };
  }
  return { x, y };
}

function convertPoints(points: number[], imageWidth: number, imageHeight: number, toRelative: boolean) {
  return points.map((p, i) => {
    const dim = i % 2 === 0 ? imageWidth : imageHeight;
    return toRelative ? toRelativeCoord(p, dim) : p;
  });
}

function convertShape(shape: Shape, imageWidth: number, imageHeight: number, toRelative: boolean): Shape {
  switch (shape.type) {
    case 'point': {
      const coords = convertPoint(shape.x, shape.y, imageWidth, imageHeight, toRelative);
      return { ...shape, x: coords.x, y: coords.y };
    }
    case 'line': {
      const pts = convertPoints([...shape.points], imageWidth, imageHeight, toRelative);
      return { ...shape, points: pts as [number, number, number, number] };
    }
    case 'polyline':
    case 'polygon':
    case 'rawline': {
      return { ...shape, points: convertPoints([...shape.points], imageWidth, imageHeight, toRelative) };
    }
    case 'rectangle': {
      const coords = convertPoint(shape.x, shape.y, imageWidth, imageHeight, toRelative);
      return {
        ...shape,
        x: coords.x,
        y: coords.y,
        width: toRelative ? toRelativeCoord(shape.width, imageWidth) : shape.width,
        height: toRelative ? toRelativeCoord(shape.height, imageHeight) : shape.height,
      };
    }
    case 'circle': {
      const coords = convertPoint(shape.x, shape.y, imageWidth, imageHeight, toRelative);
      const avgDim = (imageWidth + imageHeight) / 2;
      return {
        ...shape,
        x: coords.x,
        y: coords.y,
        radius: toRelative ? toRelativeCoord(shape.radius, avgDim) : shape.radius,
      };
    }
    default:
      return shape;
  }
}

export function exportToJSON(shapes: Shape[], imageWidth: number, imageHeight: number, coordinateType: CoordinateType = 'absolute'): string {
  const toRelative = coordinateType === 'relative';
  const convertedShapes = shapes.map(s => convertShape(s, imageWidth, imageHeight, toRelative));
  
  const data: ExportData = {
    version: '1.0',
    imageWidth,
    imageHeight,
    coordinateType,
    exportDate: new Date().toISOString(),
    shapes: convertedShapes,
  };
  return JSON.stringify(data, null, 2);
}

function formatCoord(value: number, toRelative: boolean): string {
  return toRelative ? value.toFixed(4) : value.toString();
}

export function exportToCSV(shapes: Shape[], imageWidth: number = 1, imageHeight: number = 1, coordinateType: CoordinateType = 'absolute'): string {
  const toRelative = coordinateType === 'relative';
  const headers = ['type', 'id', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height', 'radius', 'points', 'color'];
  const rows: string[] = [headers.join(',')];

  shapes.forEach((shape) => {
    let row: string[];
    const convShape = convertShape(shape, imageWidth, imageHeight, toRelative);
    
    switch (convShape.type) {
      case 'point':
        row = ['point', convShape.id, formatCoord(convShape.x, toRelative), formatCoord(convShape.y, toRelative), '', '', '', '', '', '', '', '', convShape.strokeColor];
        break;
      case 'line':
        row = ['line', convShape.id, '', '', formatCoord(convShape.points[0], toRelative), formatCoord(convShape.points[1], toRelative), formatCoord(convShape.points[2], toRelative), formatCoord(convShape.points[3], toRelative), '', '', '', '', convShape.strokeColor];
        break;
      case 'polyline':
      case 'polygon':
        const pointsStr = convShape.points.map(p => formatCoord(p, toRelative)).join(';');
        row = [convShape.type, convShape.id, '', '', '', '', '', '', '', '', '', pointsStr, convShape.strokeColor];
        break;
      case 'rectangle':
        row = ['rectangle', convShape.id, formatCoord(convShape.x, toRelative), formatCoord(convShape.y, toRelative), '', '', '', '', formatCoord(convShape.width, toRelative), formatCoord(convShape.height, toRelative), '', '', convShape.strokeColor];
        break;
      case 'circle':
        row = ['circle', convShape.id, formatCoord(convShape.x, toRelative), formatCoord(convShape.y, toRelative), '', '', '', '', '', '', formatCoord(convShape.radius, toRelative), '', convShape.strokeColor];
        break;
      case 'rawline':
        const rawPointsStr = convShape.points.map(p => formatCoord(p, toRelative)).join(';');
        row = ['rawline', convShape.id, '', '', '', '', '', '', '', '', '', rawPointsStr, convShape.strokeColor];
        break;
      default:
        row = [];
    }
    
    rows.push(row.join(','));
  });

  return rows.join('\n');
}

export function exportToNumpyArray(shapes: Shape[], imageWidth: number = 1, imageHeight: number = 1, coordinateType: CoordinateType = 'absolute'): string {
  const toRelative = coordinateType === 'relative';
  
  const lines: string[] = [
    '# NumPy array format coordinates',
    '# Usage: import numpy as np',
    '',
  ];

  // Group shapes by type
  const points: string[] = [];
  const linesArr: string[] = [];
  const polylines: string[] = [];
  const polygons: string[] = [];
  const rectangles: string[] = [];
  const circles: string[] = [];
  const rawlines: string[] = [];

  shapes.forEach((shape, index) => {
    const convShape = convertShape(shape, imageWidth, imageHeight, toRelative);
    const label = `${index + 1}`;
    
    switch (convShape.type) {
      case 'point':
        points.push(`    [${formatCoord(convShape.x, toRelative)}, ${formatCoord(convShape.y, toRelative)}]`);
        break;
      case 'line':
        linesArr.push(`    [[${formatCoord(convShape.points[0], toRelative)}, ${formatCoord(convShape.points[1], toRelative)}], [${formatCoord(convShape.points[2], toRelative)}, ${formatCoord(convShape.points[3], toRelative)}]]`);
        break;
      case 'polyline': {
        const polyPoints: string[] = [];
        for (let i = 0; i < convShape.points.length; i += 2) {
          polyPoints.push(`[${formatCoord(convShape.points[i], toRelative)}, ${formatCoord(convShape.points[i + 1], toRelative)}]`);
        }
        polylines.push(`    [${polyPoints.join(', ')}]`);
        break;
      }
      case 'polygon': {
        const polyPoints: string[] = [];
        for (let i = 0; i < convShape.points.length; i += 2) {
          polyPoints.push(`[${formatCoord(convShape.points[i], toRelative)}, ${formatCoord(convShape.points[i + 1], toRelative)}]`);
        }
        polygons.push(`    [${polyPoints.join(', ')}]`);
        break;
      }
      case 'rectangle':
        rectangles.push(`    [${formatCoord(convShape.x, toRelative)}, ${formatCoord(convShape.y, toRelative)}, ${formatCoord(convShape.width, toRelative)}, ${formatCoord(convShape.height, toRelative)}]`);
        break;
      case 'circle':
        circles.push(`    [${formatCoord(convShape.x, toRelative)}, ${formatCoord(convShape.y, toRelative)}, ${formatCoord(convShape.radius, toRelative)}]`);
        break;
      case 'rawline': {
        const rawPoints: string[] = [];
        for (let i = 0; i < convShape.points.length; i += 2) {
          rawPoints.push(`[${formatCoord(convShape.points[i], toRelative)}, ${formatCoord(convShape.points[i + 1], toRelative)}]`);
        }
        rawlines.push(`    [${rawPoints.join(', ')}]`);
        break;
      }
    }
  });

  // Output each shape type as a separate array
  if (points.length > 0) {
    lines.push('# Points: [x, y]');
    lines.push('points = np.array([');
    lines.push(points.join(','));
    lines.push('])');
    lines.push('');
  }

  if (linesArr.length > 0) {
    lines.push('# Lines: [x1, y1, x2, y2]');
    lines.push('lines = np.array([');
    lines.push(linesArr.join(','));
    lines.push('])');
    lines.push('');
  }

  if (polylines.length > 0) {
    lines.push('# Polylines: [[x1, y1], [x2, y2], ...]');
    lines.push('polylines = np.array([');
    lines.push(polylines.join(','));
    lines.push('])');
    lines.push('');
  }

  if (polygons.length > 0) {
    lines.push('# Polygons: [[x1, y1], [x2, y2], ...]');
    lines.push('polygons = np.array([');
    lines.push(polygons.join(','));
    lines.push('])');
    lines.push('');
  }

  if (rectangles.length > 0) {
    lines.push('# Rectangles: [x, y, width, height]');
    lines.push('rectangles = np.array([');
    lines.push(rectangles.join(','));
    lines.push('])');
    lines.push('');
  }

  if (circles.length > 0) {
    lines.push('# Circles: [center_x, center_y, radius]');
    lines.push('circles = np.array([');
    lines.push(circles.join(','));
    lines.push('])');
    lines.push('');
  }

  if (rawlines.length > 0) {
    lines.push('# Raw lines (freehand): [[x1, y1], [x2, y2], ...]');
    lines.push('rawlines = np.array([');
    lines.push(rawlines.join(','));
    lines.push('])');
    lines.push('');
  }

  if (lines.length === 3) {
    lines.push('# No shapes to export');
  }

  return lines.join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
