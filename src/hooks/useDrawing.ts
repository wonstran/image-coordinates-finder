import { useState, useCallback, useRef } from 'react';
import { Shape, DrawingTool, CanvasState } from '@/types/shape';
import { v4 as uuidv4 } from 'uuid';

export function useDrawing() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<DrawingTool>('point');
  const [strokeColor, setStrokeColor] = useState('#3B82F6');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [imageWidth, setImageWidth] = useState(800);
  const [imageHeight, setImageHeight] = useState(600);
  const [imageData, setImageData] = useState<string | null>(null);

  const addShape = useCallback((shape: Omit<Shape, 'id'>) => {
    const newShape = { ...shape, id: uuidv4() } as Shape;
    setShapes((prev) => [...prev, newShape]);
    return newShape.id;
  }, []);

  const updateShape = useCallback((id: string, updates: Partial<Shape>) => {
    setShapes((prev) =>
      prev.map((shape) => (shape.id === id ? { ...shape, ...updates } : shape)) as Shape[]
    );
  }, []);

  const deleteShape = useCallback((id: string) => {
    setShapes((prev) => prev.filter((shape) => shape.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  }, [selectedId]);

  const clearShapes = useCallback(() => {
    setShapes([]);
    setSelectedId(null);
  }, []);

  const getSelectedShape = useCallback(() => {
    return shapes.find((s) => s.id === selectedId) || null;
  }, [shapes, selectedId]);

  return {
    shapes,
    setShapes,
    selectedId,
    setSelectedId,
    activeTool,
    setActiveTool,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    imageWidth,
    setImageWidth,
    imageHeight,
    setImageHeight,
    imageData,
    setImageData,
    addShape,
    updateShape,
    deleteShape,
    clearShapes,
    getSelectedShape,
  };
}

export function useHistory(initialShapes: Shape[]) {
  const [past, setPast] = useState<Shape[][]>([]);
  const [present, setPresent] = useState<Shape[]>(initialShapes);
  const [future, setFuture] = useState<Shape[][]>([]);

  const setShapes = (newShapes: Shape[]) => {
    setPast((prev) => [...prev, present]);
    setPresent(newShapes);
    setFuture([]);
  };

  const undo = () => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast((prev) => prev.slice(0, -1));
    setFuture((prev) => [present, ...prev]);
    setPresent(previous);
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((prev) => prev.slice(1));
    setPast((prev) => [...prev, present]);
    setPresent(next);
  };

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  return {
    shapes: present,
    setShapes,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
