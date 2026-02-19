'use client';

import React from 'react';
import { DrawingTool } from '@/types/shape';
import { TwitterPicker } from 'react-color';

interface ToolbarProps {
  activeTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  strokeColor: string;
  onStrokeColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  labelColor: 'black' | 'white';
  onLabelColorChange: (color: 'black' | 'white') => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClear: () => void;
}

const tools: { type: DrawingTool; label: string; icon: string }[] = [
  { type: 'select', label: 'Select', icon: '👆' },
  { type: 'point', label: 'Point', icon: '📍' },
  { type: 'line', label: 'Line', icon: '📏' },
  { type: 'rawline', label: 'Freehand', icon: '✏️' },
  { type: 'polyline', label: 'Polyline', icon: '〰️' },
  { type: 'polygon', label: 'Polygon', icon: '⬟' },
  { type: 'rectangle', label: 'Rectangle', icon: '⬜' },
  { type: 'circle', label: 'Circle', icon: '⭕' },
];

export function Toolbar({
  activeTool,
  onToolChange,
  strokeColor,
  onStrokeColorChange,
  strokeWidth,
  onStrokeWidthChange,
  labelColor,
  onLabelColorChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClear,
}: ToolbarProps) {
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6',
    '#000000', '#FFFFFF', '#6B7280', '#F97316',
  ];

  return (
    <div className="w-56 bg-gray-50/50 border-r border-gray-200/50 p-4 flex flex-col gap-5">
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tools</h2>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => (
            <button
              key={tool.type}
              onClick={() => onToolChange(tool.type)}
              className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTool === tool.type
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/60'
              }`}
            >
              <span className="block text-base mb-0.5">{tool.icon}</span>
              {tool.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Style</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Stroke Width: {strokeWidth}px
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={strokeWidth}
              onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-1.5">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => onStrokeColorChange(color)}
                  className={`w-7 h-7 rounded-full border transition-all duration-150 ${
                    strokeColor === color
                      ? 'border-gray-900 scale-110 shadow-md'
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Label Color
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => onLabelColorChange('white')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-150 border ${
                  labelColor === 'white'
                    ? 'border-gray-900 bg-white text-gray-900'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                White
              </button>
              <button
                onClick={() => onLabelColorChange('black')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-150 border ${
                  labelColor === 'black'
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-gray-900 text-gray-400 hover:bg-gray-800'
                }`}
              >
                Black
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Actions</h2>
        <div className="space-y-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`w-full py-2 px-3 rounded-xl text-xs font-medium transition-all duration-200 ${
              canUndo
                ? 'bg-white text-gray-700 border border-gray-200/60 hover:bg-gray-50'
                : 'bg-gray-100/50 text-gray-400 cursor-not-allowed'
            }`}
          >
            Undo
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`w-full py-2 px-3 rounded-xl text-xs font-medium transition-all duration-200 ${
              canRedo
                ? 'bg-white text-gray-700 border border-gray-200/60 hover:bg-gray-50'
                : 'bg-gray-100/50 text-gray-400 cursor-not-allowed'
            }`}
          >
            Redo
          </button>
          <button
            onClick={onClear}
            className="w-full py-2 px-3 rounded-xl text-xs font-medium bg-red-50 text-red-600 border border-red-200/60 hover:bg-red-100 transition-all duration-200"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <p className="text-[10px] text-gray-400 text-center">
          Press Esc to cancel • Enter to finish
        </p>
      </div>
    </div>
  );
}
