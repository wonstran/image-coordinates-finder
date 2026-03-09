# Image Coordinate Finder

Interactive web application for drawing shapes on images and exporting coordinates.

## Features

- 📍 **Point** - Click to place a point
- 📏 **Line** - Click and drag to draw a line
- 〰️ **Polyline** - Click multiple points, double-click to finish
- ⬟ **Polygon** - Click multiple points, double-click to close
- ⬜ **Rectangle** - Click and drag to draw a rectangle
- ⭕ **Circle** - Click center, drag to set radius

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deloyed Online Tool 

 Access [https://wonstran.github.io/image-coordinates-finder/](https://wonstran.github.io/image-coordinates-finder/)

## Usage

1. Upload an image (drag & drop or click to select)
2. Select a drawing tool from the toolbar
3. Draw shapes on the image
4. View coordinates in the bottom panel
5. Export to JSON or CSV

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Delete` | Delete selected shape |
| `Ctrl+A` | Select all (first shape) |
| `Escape` | Deselect / Cancel |

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- React-Konva (Canvas)
