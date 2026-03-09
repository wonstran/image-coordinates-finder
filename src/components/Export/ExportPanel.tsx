'use client';

import React, { useState, useRef } from 'react';
import { Shape } from '@/types/shape';
import {
  exportToJSON,
  exportToCSV,
  exportToNumpyArray,
  downloadFile,
  copyToClipboard,
  CoordinateType,
} from '@/utils/exportUtils';

interface ExportPanelProps {
  shapes: Shape[];
  imageWidth: number;
  imageHeight: number;
  stageRef?: React.RefObject<any>;
}

export function ExportPanel({ shapes, imageWidth, imageHeight, stageRef }: ExportPanelProps) {
  const [copied, setCopied] = useState<'json' | 'numpy' | null>(null);
  const [coordType, setCoordType] = useState<CoordinateType>('absolute');

  const handleExportJSON = () => {
    const filename = prompt('Enter filename:', 'coordinates');
    if (!filename) return;
    const json = exportToJSON(shapes, imageWidth, imageHeight, coordType);
    downloadFile(json, `${filename}.json`, 'application/json');
  };

  const handleExportCSV = () => {
    const filename = prompt('Enter filename:', 'coordinates');
    if (!filename) return;
    const csv = exportToCSV(shapes, imageWidth, imageHeight, coordType);
    downloadFile(csv, `${filename}.csv`, 'text/csv');
  };

  const handleSaveImage = () => {
    const filename = prompt('Enter filename:', 'image');
    if (!filename || !stageRef?.current) return;
    
    const stage = stageRef.current;
    const dataUrl = stage.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyNumpy = async () => {
    const numpy = exportToNumpyArray(shapes, imageWidth, imageHeight, coordType);
    await copyToClipboard(numpy);
    setCopied('numpy');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyJSON = async () => {
    const json = exportToJSON(shapes, imageWidth, imageHeight, coordType);
    await copyToClipboard(json);
    setCopied('json');
    setTimeout(() => setCopied(null), 2000);
  };

  const btnClass = (enabled: boolean) =>
    `px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
      enabled
        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        : 'bg-gray-50 text-gray-300 cursor-not-allowed'
    }`;

  return (
    <div className="flex items-center gap-2">
      {/* Coordinate Type Toggle - Blue highlight */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-full p-0.5">
        <button
          onClick={() => setCoordType('absolute')}
          className={`px-2 py-0.5 text-xs font-medium rounded-full transition-all ${
            coordType === 'absolute'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Abs
        </button>
        <button
          onClick={() => setCoordType('relative')}
          className={`px-2 py-0.5 text-xs font-medium rounded-full transition-all ${
            coordType === 'relative'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Rel
        </button>
      </div>

      <button onClick={handleSaveImage} className={btnClass(true)}>
        Save Image
      </button>
      <button onClick={handleExportJSON} disabled={shapes.length === 0} className={btnClass(shapes.length > 0)}>
        JSON
      </button>
      <button onClick={handleExportCSV} disabled={shapes.length === 0} className={btnClass(shapes.length > 0)}>
        CSV
      </button>
      <button onClick={handleCopyNumpy} disabled={shapes.length === 0} className={btnClass(shapes.length > 0)}>
        {copied === 'numpy' ? '✓' : 'Copy NumPy'}
      </button>
      <button onClick={handleCopyJSON} disabled={shapes.length === 0} className={btnClass(shapes.length > 0)}>
        {copied === 'json' ? '✓' : 'Copy JSON'}
      </button>
    </div>
  );
}
