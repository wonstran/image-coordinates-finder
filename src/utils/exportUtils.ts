import { Shape } from '@/types/shape';

export interface ExportData {
  version: string;
  imageWidth: number;
  imageHeight: number;
  exportDate: string;
  shapes: Shape[];
}

export function exportToJSON(shapes: Shape[], imageWidth: number, imageHeight: number): string {
  const data: ExportData = {
    version: '1.0',
    imageWidth,
    imageHeight,
    exportDate: new Date().toISOString(),
    shapes,
  };
  return JSON.stringify(data, null, 2);
}

export function exportToCSV(shapes: Shape[]): string {
  const headers = ['type', 'id', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height', 'radius', 'points', 'color'];
  const rows: string[] = [headers.join(',')];

  shapes.forEach((shape) => {
    let row: string[];
    
    switch (shape.type) {
      case 'point':
        row = ['point', shape.id, shape.x.toString(), shape.y.toString(), '', '', '', '', '', '', '', '', shape.strokeColor];
        break;
      case 'line':
        row = ['line', shape.id, '', '', shape.points[0].toString(), shape.points[1].toString(), shape.points[2].toString(), shape.points[3].toString(), '', '', '', '', shape.strokeColor];
        break;
      case 'polyline':
      case 'polygon':
        const pointsStr = shape.points.map(p => p.toFixed(2)).join(';');
        row = [shape.type, shape.id, '', '', '', '', '', '', '', '', '', pointsStr, shape.strokeColor];
        break;
      case 'rectangle':
        row = ['rectangle', shape.id, shape.x.toString(), shape.y.toString(), '', '', '', '', shape.width.toString(), shape.height.toString(), '', '', shape.strokeColor];
        break;
      case 'circle':
        row = ['circle', shape.id, shape.x.toString(), shape.y.toString(), '', '', '', '', '', '', shape.radius.toString(), '', shape.strokeColor];
        break;
      case 'rawline':
        const rawPointsStr = shape.points.map(p => p.toFixed(2)).join(';');
        row = ['rawline', shape.id, '', '', '', '', '', '', '', '', '', rawPointsStr, shape.strokeColor];
        break;
      default:
        row = [];
    }
    
    rows.push(row.join(','));
  });

  return rows.join('\n');
}

export function exportToNumpyArray(shapes: Shape[]): string {
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
    const label = `${index + 1}`;
    
    switch (shape.type) {
      case 'point':
        points.push(`    [${shape.x}, ${shape.y}]`);
        break;
      case 'line':
        linesArr.push(`    [[${shape.points[0]}, ${shape.points[1]}], [${shape.points[2]}, ${shape.points[3]}]]`);
        break;
      case 'polyline': {
        const polyPoints: string[] = [];
        for (let i = 0; i < shape.points.length; i += 2) {
          polyPoints.push(`[${shape.points[i]}, ${shape.points[i + 1]}]`);
        }
        polylines.push(`    [${polyPoints.join(', ')}]`);
        break;
      }
      case 'polygon': {
        const polyPoints: string[] = [];
        for (let i = 0; i < shape.points.length; i += 2) {
          polyPoints.push(`[${shape.points[i]}, ${shape.points[i + 1]}]`);
        }
        polygons.push(`    [${polyPoints.join(', ')}]`);
        break;
      }
      case 'rectangle':
        rectangles.push(`    [${shape.x}, ${shape.y}, ${shape.width}, ${shape.height}]`);
        break;
      case 'circle':
        circles.push(`    [${shape.x}, ${shape.y}, ${shape.radius}]`);
        break;
      case 'rawline': {
        const rawPoints: string[] = [];
        for (let i = 0; i < shape.points.length; i += 2) {
          rawPoints.push(`[${shape.points[i]}, ${shape.points[i + 1]}]`);
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
