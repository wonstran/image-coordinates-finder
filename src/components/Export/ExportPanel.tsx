'use client';

import React, { useState } from 'react';
import { Shape } from '@/types/shape';
import {
  exportToJSON,
  exportToCSV,
  exportToNumpyArray,
  downloadFile,
  copyToClipboard,
} from '@/utils/exportUtils';

interface ExportPanelProps {
  shapes: Shape[];
  imageWidth: number;
  imageHeight: number;
}

export function ExportPanel({ shapes, imageWidth, imageHeight }: ExportPanelProps) {
  const [copied, setCopied] = useState<'json' | 'numpy' | null>(null);

  const handleExportJSON = () => {
    const json = exportToJSON(shapes, imageWidth, imageHeight);
    downloadFile(json, 'coordinates.json', 'application/json');
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(shapes);
    downloadFile(csv, 'coordinates.csv', 'text/csv');
  };

  const handleCopyNumpy = async () => {
    const numpy = exportToNumpyArray(shapes);
    await copyToClipboard(numpy);
    setCopied('numpy');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyJSON = async () => {
    const json = exportToJSON(shapes, imageWidth, imageHeight);
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
    <div className="flex items-center gap-1">
      <button
        onClick={handleExportJSON}
        disabled={shapes.length === 0}
        className={btnClass(shapes.length > 0)}
      >
        JSON
      </button>
      <button
        onClick={handleExportCSV}
        disabled={shapes.length === 0}
        className={btnClass(shapes.length > 0)}
      >
        CSV
      </button>
      <button
        onClick={handleCopyNumpy}
        disabled={shapes.length === 0}
        className={btnClass(shapes.length > 0)}
      >
        {copied === 'numpy' ? '✓' : 'Copy NumPy'}
      </button>
      <button
        onClick={handleCopyJSON}
        disabled={shapes.length === 0}
        className={btnClass(shapes.length > 0)}
      >
        {copied === 'json' ? '✓' : 'Copy JSON'}
      </button>
    </div>
  );
}
