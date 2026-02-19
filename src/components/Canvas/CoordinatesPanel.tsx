'use client';

import React, { useState } from 'react';
import { Shape } from '@/types/shape';
import { formatCoordinates } from '@/utils/coordinateUtils';

interface CoordinatesPanelProps {
  shapes: Shape[];
  selectedId: string | null;
  onSelectShape: (id: string | null) => void;
}

export function CoordinatesPanel({ shapes, selectedId, onSelectShape }: CoordinatesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<'json' | 'list'>('json');

  const getShapeLabel = (shape: Shape): string => {
    const index = shapes.findIndex((s) => s.id === shape.id) + 1;
    return `${shape.type.charAt(0).toUpperCase() + shape.type.slice(1)} #${index}`;
  };

  return (
    <div className="bg-white border-t border-gray-200/60">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-600">
          Coordinates ({shapes.length})
        </span>
        <span className="text-gray-400 text-xs">{isExpanded ? '▼' : '▲'}</span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="flex gap-1.5 mb-3">
            <button
              onClick={() => setViewMode('json')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                viewMode === 'json'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              JSON
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                viewMode === 'list'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              List
            </button>
          </div>

          <div className="bg-gray-900 rounded-xl p-4 max-h-56 overflow-auto">
            {shapes.length === 0 ? (
              <p className="text-gray-500 text-xs">No shapes drawn yet</p>
            ) : viewMode === 'json' ? (
              <pre className="text-green-400 text-[10px] font-mono overflow-x-auto whitespace-pre">
                {JSON.stringify(
                  shapes.map((s) => ({
                    type: s.type,
                    ...(s.type === 'point'
                      ? { x: Math.round(s.x), y: Math.round(s.y) }
                      : s.type === 'line'
                      ? { points: s.points.map(p => Math.round(p)) }
                      : s.type === 'polyline' || s.type === 'polygon' || s.type === 'rawline'
                      ? { points: s.points.map(p => Math.round(p)) }
                      : s.type === 'rectangle'
                      ? { x: Math.round(s.x), y: Math.round(s.y), width: Math.round(s.width), height: Math.round(s.height) }
                      : s.type === 'circle'
                      ? { x: Math.round(s.x), y: Math.round(s.y), radius: Math.round(s.radius) }
                      : {}),
                  })),
                  null,
                  2
                )}
              </pre>
            ) : (
              <div className="space-y-1.5">
                {shapes.map((shape, idx) => (
                  <div
                    key={shape.id}
                    onClick={() => onSelectShape(shape.id)}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedId === shape.id
                        ? 'bg-gray-800 ring-1 ring-white/20'
                        : 'bg-gray-800/50 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-gray-400">
                        {idx + 1}
                      </span>
                      <span className="text-[10px] font-medium text-blue-400 uppercase">
                        {shape.type}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-gray-400 mt-1">
                      {formatCoordinates(shape)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
