'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Toolbar } from '@/components/Canvas/Toolbar';
import { CoordinatesPanel } from '@/components/Canvas/CoordinatesPanel';
import { ImageUpload } from '@/components/ImageUploader/ImageUpload';
import { ExportPanel } from '@/components/Export/ExportPanel';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Shape, DrawingTool } from '@/types/shape';
import { v4 as uuidv4 } from 'uuid';

const DrawingCanvas = dynamic(() => import('@/components/Canvas/DrawingCanvas').then(mod => ({ default: mod.DrawingCanvas })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-8">Loading canvas...</div>
});

export default function Home() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [past, setPast] = useState<Shape[][]>([]);
  const [future, setFuture] = useState<Shape[][]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<DrawingTool>('point');
  const [strokeColor, setStrokeColor] = useState('#3B82F6');
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [labelColor, setLabelColor] = useState<'black' | 'white'>('white');
  const [imageWidth, setImageWidth] = useState(800);
  const [imageHeight, setImageHeight] = useState(600);
  const [imageData, setImageData] = useState<string | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(true);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const stageRef = useRef<any>(null);

  const saveToHistory = useCallback((newShapes: Shape[]) => {
    setPast((prev) => [...prev, shapes]);
    setFuture([]);
    setShapes(newShapes);
  }, [shapes]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast((prev) => prev.slice(0, -1));
    setFuture((prev) => [shapes, ...prev]);
    setShapes(previous);
  }, [past, shapes]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((prev) => prev.slice(1));
    setPast((prev) => [...prev, shapes]);
    setShapes(next);
  }, [future, shapes]);

  const handleDelete = useCallback(() => {
    if (selectedId) {
      const newShapes = shapes.filter((s) => s.id !== selectedId);
      saveToHistory(newShapes);
      setSelectedId(null);
    }
  }, [selectedId, shapes, saveToHistory]);

  const handleSelectAll = useCallback(() => {
    // For now, select first shape if exists
    if (shapes.length > 0 && !selectedId) {
      setSelectedId(shapes[0].id);
    }
  }, [shapes, selectedId]);

  const handleEscape = useCallback(() => {
    setSelectedId(null);
    setActiveTool('select');
  }, []);

  useKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    onDelete: handleDelete,
    onSelectAll: handleSelectAll,
    onEscape: handleEscape,
  });

  const handleImageLoad = useCallback((dataUrl: string, width: number, height: number) => {
    setImageData(dataUrl);
    setImageWidth(width);
    setImageHeight(height);
    setShowImageUpload(false);
  }, []);

  const handleShapeAdd = useCallback((shape: Omit<Shape, 'id'>) => {
    const newShape = { ...shape, id: uuidv4() } as Shape;
    saveToHistory([...shapes, newShape]);
  }, [shapes, saveToHistory]);

  const handleShapeUpdate = useCallback((id: string, updates: Partial<Shape>) => {
    const newShapes = shapes.map((s) => (s.id === id ? { ...s, ...updates } : s)) as Shape[];
    setShapes(newShapes);
  }, [shapes]);

  const handleClear = useCallback(() => {
    if (shapes.length > 0) {
      saveToHistory([]);
    }
    setSelectedId(null);
  }, [shapes, saveToHistory]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header - Apple style */}
      <header className="bg-gradient-to-b from-gray-100/80 to-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          {/* Logo - Apple-style coordinates icon */}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 relative overflow-hidden">
            {/* Background grid pattern */}
            <div className="absolute inset-0 opacity-20">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <defs>
                  <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="40" height="40" fill="url(#grid)" />
              </svg>
            </div>
            {/* Coordinate markers */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              {/* Crosshair center */}
              <circle cx="12" cy="12" r="2.5" fill="white"/>
              {/* Horizontal line */}
              <line x1="4" y1="12" x2="9" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="15" y1="12" x2="20" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              {/* Vertical line */}
              <line x1="12" y1="4" x2="12" y2="9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="12" y1="15" x2="12" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              {/* Coordinate dots */}
              <circle cx="7" cy="7" r="1.5" fill="#93C5FD"/>
              <circle cx="17" cy="17" r="1.5" fill="#93C5FD"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Image Coordinates Finder <span className="text-gray-400 text-lg">ver. 0.2</span></h1>
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 bg-white/90 px-4 py-1 text-sm border border-gray-300 rounded font-mono">
          X: {mousePos ? Math.round(mousePos.x) : 0} &nbsp; Y: {mousePos ? Math.round(mousePos.y) : 0}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImageUpload(true)}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors font-medium"
          >
            Change Image
          </button>
          <ExportPanel
            shapes={shapes}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            stageRef={stageRef}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <Toolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          strokeColor={strokeColor}
          onStrokeColorChange={setStrokeColor}
          strokeWidth={strokeWidth}
          onStrokeWidthChange={setStrokeWidth}
          labelColor={labelColor}
          onLabelColorChange={setLabelColor}
          onUndo={undo}
          onRedo={redo}
          canUndo={past.length > 0}
          canRedo={future.length > 0}
          onClear={handleClear}
        />

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-8 overflow-auto flex items-center justify-center bg-gray-50">
            {showImageUpload ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                <ImageUpload onImageLoad={handleImageLoad} />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="bg-white shadow-sm border border-gray-200 p-1">
                  <DrawingCanvas
                    shapes={shapes}
                    activeTool={activeTool}
                    strokeColor={strokeColor}
                    strokeWidth={strokeWidth}
                    selectedId={selectedId}
                    imageData={imageData}
                    imageWidth={Math.min(imageWidth, 1200)}
                    imageHeight={Math.min(imageHeight, 800)}
                    originalImageWidth={imageWidth}
                    originalImageHeight={imageHeight}
                    onShapeAdd={handleShapeAdd}
                    onShapeUpdate={handleShapeUpdate}
                    onShapeSelect={setSelectedId}
                    onMouseMove={setMousePos}
                    zoomScale={zoomScale}
                    onZoomChange={setZoomScale}
                    onStageRef={(ref: any) => { stageRef.current = ref?.current; }}
                    labelColor={labelColor}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setZoomScale(prev => Math.min(5, prev * 1.2))}
                    className="w-8 h-8 bg-white border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center text-lg"
                    title="Zoom In"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setZoomScale(prev => Math.max(0.1, prev / 1.2))}
                    className="w-8 h-8 bg-white border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center text-lg"
                    title="Zoom Out"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setZoomScale(1)}
                    className="w-8 h-8 bg-white border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center text-xs font-bold"
                    title="Reset Zoom"
                  >
                    1:1
                  </button>
                  <span className="bg-white px-2 py-1 text-xs border border-gray-300 rounded text-center">
                    {Math.round(zoomScale * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Coordinates Panel */}
          {!showImageUpload && (
            <CoordinatesPanel
              shapes={shapes}
              selectedId={selectedId}
              onSelectShape={setSelectedId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
