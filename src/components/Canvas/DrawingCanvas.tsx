'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Stage, Layer, Circle, Line, Rect, Transformer, Text } from 'react-konva';
import useImage from 'use-image';
import { Shape, DrawingTool } from '@/types/shape';

interface DrawingCanvasProps {
  shapes: Shape[];
  activeTool: DrawingTool;
  strokeColor: string;
  strokeWidth: number;
  selectedId: string | null;
  imageData: string | null;
  imageWidth: number;
  imageHeight: number;
  onShapeAdd: (shape: any) => void;
  onShapeUpdate: (id: string, updates: Partial<Shape>) => void;
  onShapeSelect: (id: string | null) => void;
  onCancel?: () => void;
  labelColor?: 'black' | 'white';
}

export function DrawingCanvas({
  shapes,
  activeTool,
  strokeColor,
  strokeWidth,
  selectedId,
  imageData,
  imageWidth,
  imageHeight,
  onShapeAdd,
  onShapeUpdate,
  onShapeSelect,
  onCancel,
  labelColor = 'white',
}: DrawingCanvasProps) {
  const stageRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  
  const [image] = useImage(imageData || '', 'anonymous');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [tempPoints, setTempPoints] = useState<number[]>([]);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  
  // Zoom and pan state
  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    
    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };

    // Zoom in or out based on wheel direction
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * 1.1 : oldScale / 1.1;
    
    // Limit zoom range
    const clampedScale = Math.max(0.1, Math.min(5, newScale));
    
    setScale(clampedScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  }, [scale, stagePos]);

  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(5, prev * 1.2));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(0.1, prev / 1.2));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setStagePos({ x: 0, y: 0 });
  }, []);

  // Handle Escape to cancel current drawing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (currentShape || tempPoints.length > 0) {
          setCurrentShape(null);
          setTempPoints([]);
          setIsDrawing(false);
          onCancel?.();
        }
      } else if (e.key === 'Enter') {
        // Finish polyline/polygon on Enter
        if (tempPoints.length >= 4) {
          if (activeTool === 'polyline') {
            onShapeAdd({
              type: 'polyline',
              points: tempPoints,
              strokeColor,
              strokeWidth,
            });
            setTempPoints([]);
            setIsDrawing(false);
          } else if (activeTool === 'polygon') {
            onShapeAdd({
              type: 'polygon',
              points: tempPoints,
              strokeColor,
              strokeWidth,
            });
            setTempPoints([]);
            setIsDrawing(false);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentShape, tempPoints, onCancel, activeTool, strokeColor, strokeWidth, onShapeAdd]);

  useEffect(() => {
    if (transformerRef.current && layerRef.current) {
      if (selectedId) {
        const selectedNode = layerRef.current.findOne(`#${selectedId}`);
        if (selectedNode) {
          transformerRef.current.nodes([selectedNode]);
          transformerRef.current.getLayer().batchDraw();
        }
      } else {
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId, shapes]);

  const getPointerPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const pos = stage.getPointerPosition();
    if (!pos) return { x: 0, y: 0 };
    
    // Transform screen coordinates to canvas coordinates accounting for zoom and pan
    const canvasX = (pos.x - stagePos.x) / scale;
    const canvasY = (pos.y - stagePos.y) / scale;
    
    return { x: canvasX, y: canvasY };
  }, [scale, stagePos]);

  const handleMouseDown = useCallback(
    (e: any) => {
      if (activeTool === 'select') {
        const clickedOnEmpty = e.target === e.target.getStage() || e.target.getClassName() === 'Image';
        if (clickedOnEmpty) {
          onShapeSelect(null);
        }
        return;
      }

      const pos = getPointerPosition();

      switch (activeTool) {
        case 'point': {
          onShapeAdd({
            type: 'point',
            x: pos.x,
            y: pos.y,
            strokeColor,
            strokeWidth,
          });
          break;
        }
        case 'rawline': {
          const newShape: Shape = {
            id: 'temp',
            type: 'rawline',
            points: [pos.x, pos.y],
            strokeColor,
            strokeWidth,
          };
          setCurrentShape(newShape);
          setIsDrawing(true);
          break;
        }
        case 'line': {
          // First click: set start point
          if (!currentShape || currentShape.type !== 'line') {
            const newShape: Shape = {
              id: 'temp',
              type: 'line',
              points: [pos.x, pos.y, pos.x, pos.y],
              strokeColor,
              strokeWidth,
            };
            setCurrentShape(newShape);
            setIsDrawing(true);
          } else {
            // Second click: set end point and finalize
            const updatedPoints: [number, number, number, number] = [
              currentShape.points[0],
              currentShape.points[1],
              pos.x,
              pos.y,
            ];
            const finalShape: Shape = {
              ...currentShape,
              points: updatedPoints,
            };
            onShapeAdd(finalShape);
            setCurrentShape(null);
            setIsDrawing(false);
          }
          break;
        }
        case 'polyline':
        case 'polygon': {
          setTempPoints((prev) => [...prev, pos.x, pos.y]);
          setIsDrawing(true);
          break;
        }
        case 'rectangle': {
          // First click: set corner
          if (!currentShape || currentShape.type !== 'rectangle') {
            const newShape: Shape = {
              id: 'temp',
              type: 'rectangle',
              x: pos.x,
              y: pos.y,
              width: 0,
              height: 0,
              strokeColor,
              strokeWidth,
            };
            setCurrentShape(newShape);
            setIsDrawing(true);
          } else {
            // Second click: set opposite corner
            const width = pos.x - currentShape.x;
            const height = pos.y - currentShape.y;
            const finalShape: Shape = {
              ...currentShape,
              width,
              height,
            };
            if (Math.abs(width) > 2 && Math.abs(height) > 2) {
              onShapeAdd(finalShape);
            }
            setCurrentShape(null);
            setIsDrawing(false);
          }
          break;
        }
        case 'circle': {
          // First click: set center
          if (!currentShape || currentShape.type !== 'circle') {
            const newShape: Shape = {
              id: 'temp',
              type: 'circle',
              x: pos.x,
              y: pos.y,
              radius: 0,
              strokeColor,
              strokeWidth,
            };
            setCurrentShape(newShape);
            setIsDrawing(true);
          } else {
            // Second click: set point on circumference
            const radius = Math.sqrt(
              Math.pow(pos.x - currentShape.x, 2) + Math.pow(pos.y - currentShape.y, 2)
            );
            const finalShape: Shape = {
              ...currentShape,
              radius,
            };
            if (radius > 2) {
              onShapeAdd(finalShape);
            }
            setCurrentShape(null);
            setIsDrawing(false);
          }
          break;
        }
      }
    },
    [activeTool, strokeColor, strokeWidth, getPointerPosition, onShapeAdd, onShapeSelect, currentShape]
  );

  const handleMouseMove = useCallback(
    (e: any) => {
      const pos = getPointerPosition();
      setMousePos(pos);

      if (!isDrawing && tempPoints.length === 0) return;

      // Handle polyline/polygon preview (no currentShape, but has tempPoints)
      if ((activeTool === 'polyline' || activeTool === 'polygon') && tempPoints.length > 0) {
        return; // Just tracking mouse position, preview is rendered separately
      }

      if (!currentShape) return;

      switch (currentShape.type) {
        case 'rawline': {
          setCurrentShape({
            ...currentShape,
            points: [...currentShape.points, pos.x, pos.y],
          });
          break;
        }
        case 'line': {
          const newPoints: [number, number, number, number] = [
            currentShape.points[0],
            currentShape.points[1],
            pos.x,
            pos.y,
          ];
          setCurrentShape({ ...currentShape, points: newPoints });
          break;
        }
        case 'rectangle': {
          const width = pos.x - currentShape.x;
          const height = pos.y - currentShape.y;
          setCurrentShape({
            ...currentShape,
            width,
            height,
          });
          break;
        }
        case 'circle': {
          const radius = Math.sqrt(
            Math.pow(pos.x - currentShape.x, 2) + Math.pow(pos.y - currentShape.y, 2)
          );
          setCurrentShape({ ...currentShape, radius });
          break;
        }
      }
    },
    [isDrawing, currentShape, getPointerPosition, tempPoints, activeTool]
  );

  const handleMouseUp = useCallback(() => {
    // Line, rectangle, circle use click-click, so no finalize on mouse up
    if (!isDrawing || !currentShape) {
      setIsDrawing(false);
      return;
    }

    // Skip finalize on mouse up for click-click tools
    if (currentShape.type === 'line' || currentShape.type === 'rectangle' || currentShape.type === 'circle') {
      return;
    }

    if (currentShape.type === 'rawline' && currentShape.points.length >= 4) {
      onShapeAdd(currentShape);
    }

    setCurrentShape(null);
    setIsDrawing(false);
  }, [isDrawing, currentShape, onShapeAdd]);

  const handleDoubleClick = useCallback(() => {
    if (activeTool === 'polyline' && tempPoints.length >= 4) {
      onShapeAdd({
        type: 'polyline',
        points: tempPoints,
        strokeColor,
        strokeWidth,
      });
      setTempPoints([]);
    } else if (activeTool === 'polygon' && tempPoints.length >= 6) {
      onShapeAdd({
        type: 'polygon',
        points: tempPoints,
        strokeColor,
        strokeWidth,
      });
      setTempPoints([]);
    }
  }, [activeTool, tempPoints, strokeColor, strokeWidth, onShapeAdd]);

  const handleShapeClick = useCallback(
    (id: string, e: any) => {
      if (activeTool === 'select') {
        e.cancelBubble = true;
        onShapeSelect(id);
      }
    },
    [activeTool, onShapeSelect]
  );

  const getShapeCenter = (shape: Shape): { x: number; y: number } => {
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
  };

  const renderShape = (shape: Shape, index: number) => {
    const isSelected = shape.id === selectedId;
    const commonProps = {
      id: shape.id,
      key: shape.id,
      stroke: shape.strokeColor,
      strokeWidth: shape.strokeWidth,
      onClick: (e: any) => handleShapeClick(shape.id, e),
      onTap: (e: any) => handleShapeClick(shape.id, e),
      draggable: activeTool === 'select',
      onDragEnd: (e: any) => {
        const newAttrs: any = {};
        
        if (shape.type === 'point') {
          newAttrs.x = e.target.x();
          newAttrs.y = e.target.y();
        } else if (shape.type === 'line') {
          const dx = e.target.x();
          const dy = e.target.y();
          newAttrs.points = [
            shape.points[0] + dx,
            shape.points[1] + dy,
            shape.points[2] + dx,
            shape.points[3] + dy,
          ];
        } else if (shape.type === 'rawline' || shape.type === 'polyline' || shape.type === 'polygon') {
          const dx = e.target.x();
          const dy = e.target.y();
          const newPoints = shape.points.map((p, i) => p + (i % 2 === 0 ? dx : dy));
          newAttrs.points = newPoints;
        } else if (shape.type === 'rectangle') {
          newAttrs.x = e.target.x();
          newAttrs.y = e.target.y();
        } else if (shape.type === 'circle') {
          newAttrs.x = e.target.x();
          newAttrs.y = e.target.y();
        }
        
        e.target.position({ x: 0, y: 0 });
        onShapeUpdate(shape.id, newAttrs);
      },
    };

    const shapeElement = (() => {
      switch (shape.type) {
        case 'point':
          return (
            <Circle
              {...commonProps}
              x={shape.x}
              y={shape.y}
              radius={1}
              fill={shape.strokeColor}
            />
          );
        case 'line':
          return (
            <Line
              {...commonProps}
              points={shape.points}
              lineCap="round"
              lineJoin="round"
            />
          );
        case 'polyline':
          return (
            <Line
              {...commonProps}
              points={shape.points}
              lineCap="round"
              lineJoin="round"
              tension={0}
            />
          );
        case 'polygon':
          return (
            <Line
              {...commonProps}
              points={shape.points}
              closed
              lineCap="round"
              lineJoin="round"
              fill={shape.strokeColor + '33'}
            />
          );
        case 'rawline':
          return (
            <Line
              {...commonProps}
              points={shape.points}
              lineCap="round"
              lineJoin="round"
              tension={0.5}
            />
          );
        case 'rectangle':
          return (
            <Rect
              {...commonProps}
              x={shape.x}
              y={shape.y}
              width={shape.width}
              height={shape.height}
              fill={shape.strokeColor + '33'}
            />
          );
        case 'circle':
          return (
            <Circle
              {...commonProps}
              x={shape.x}
              y={shape.y}
              radius={shape.radius}
              fill={shape.strokeColor + '33'}
            />
          );
        default:
          return null;
      }
    })();

    const center = getShapeCenter(shape);

    return (
      <React.Fragment key={shape.id}>
        {shapeElement}
        {/* Invisible larger hit area for easier selection */}
        {shape.type === 'point' && (
          <Circle
            x={shape.x}
            y={shape.y}
            radius={12}
            fill="transparent"
            onClick={(e) => handleShapeClick(shape.id, e)}
            onTap={(e) => handleShapeClick(shape.id, e)}
          />
        )}
        {shape.type === 'line' && (
          <Line
            points={shape.points}
            stroke="transparent"
            strokeWidth={20}
            onClick={(e) => handleShapeClick(shape.id, e)}
            onTap={(e) => handleShapeClick(shape.id, e)}
          />
        )}
        <Text
          x={center.x - 4}
          y={shape.type === 'point' ? center.y - 18 : center.y - 5}
          text={String(index + 1)}
          fontSize={10}
          fontFamily="Arial, sans-serif"
          fill={isSelected ? '#3B82F6' : labelColor}
        />
      </React.Fragment>
    );
  };

  const renderCurrentShape = () => {
    if (!currentShape) return null;
    return renderShape(currentShape, shapes.length);
  };

  const renderTempPolyline = () => {
    if (tempPoints.length < 2 && !mousePos) return null;

    const elements: React.ReactNode[] = [];

    // Draw dots at each click point
    for (let i = 0; i < tempPoints.length; i += 2) {
      elements.push(
        <Circle
          key={`dot-${i}`}
          x={tempPoints[i]}
          y={tempPoints[i + 1]}
          radius={4}
          fill={strokeColor}
        />
      );
    }

    // Draw lines between points
    if (tempPoints.length >= 2) {
      elements.push(
        <Line
          key="polyline-lines"
          points={tempPoints}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          lineCap="round"
          lineJoin="round"
          dash={[5, 5]}
        />
      );
    }

    // Draw preview line from last point to current mouse position
    if (mousePos && tempPoints.length >= 2) {
      const lastX = tempPoints[tempPoints.length - 2];
      const lastY = tempPoints[tempPoints.length - 1];
      elements.push(
        <Line
          key="preview-line"
          points={[lastX, lastY, mousePos.x, mousePos.y]}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          lineCap="round"
          lineJoin="round"
          opacity={0.5}
        />
      );
    }

    return <>{elements}</>;
  };

  return (
    <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Zoom Controls */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        <button
          onClick={zoomIn}
          className="w-8 h-8 bg-white border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center text-lg"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          className="w-8 h-8 bg-white border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center text-lg"
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={resetZoom}
          className="w-8 h-8 bg-white border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center text-xs font-bold"
          title="Reset Zoom"
        >
          1:1
        </button>
      </div>
      
      {/* Scale indicator */}
      <div className="absolute bottom-2 right-2 z-10 bg-white px-2 py-1 text-xs border border-gray-300 rounded">
        {Math.round(scale * 100)}%
      </div>

      <Stage
        ref={stageRef}
        width={imageWidth}
        height={imageHeight}
        scaleX={scale}
        scaleY={scale}
        x={stagePos.x}
        y={stagePos.y}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDblClick={handleDoubleClick}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        draggable={activeTool === 'select'}
        onDragEnd={(e) => {
          setStagePos({ x: e.target.x(), y: e.target.y() });
        }}
        style={{ cursor: activeTool === 'select' ? (isPanning ? 'grabbing' : 'grab') : 'crosshair' }}
      >
        <Layer ref={layerRef}>
          {image && (
            <Rect
              x={0}
              y={0}
              width={imageWidth}
              height={imageHeight}
              fillPatternImage={image}
              fillPatternScaleX={imageWidth / image.width}
              fillPatternScaleY={imageHeight / image.height}
            />
          )}
          {!image && (
            <Rect
              x={0}
              y={0}
              width={imageWidth}
              height={imageHeight}
              fill="#f9fafb"
            />
          )}
          {shapes.map(renderShape)}
          {renderCurrentShape()}
          {renderTempPolyline()}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
            onTransformEnd={(e: any) => {
              const node = e.target;
              const shape = shapes.find((s) => s.id === node.id());
              if (!shape) return;

              if (shape.type === 'rectangle') {
                onShapeUpdate(shape.id, {
                  x: node.x(),
                  y: node.y(),
                  width: Math.max(5, node.width() * node.scaleX()),
                  height: Math.max(5, node.height() * node.scaleY()),
                });
                node.scaleX(1);
                node.scaleY(1);
              } else if (shape.type === 'circle') {
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                const radius = Math.max(5, shape.radius * ((scaleX + scaleY) / 2));
                onShapeUpdate(shape.id, {
                  x: node.x(),
                  y: node.y(),
                  radius,
                });
                node.scaleX(1);
                node.scaleY(1);
              }
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
}
