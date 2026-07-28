"use client";

import { useEffect, useRef } from "react";

const aliveColors = [
  "#89A968",
  "#E3FBD7",
  "#5E8FA8",
  "#C5FCFB",
  "#FFC548",
  "#FFF3B8",
  "#615754",
  "#8D7A70",
];
const backgroundColor = "#FFFDEF";
const gridColor = "#000000";
const cellSize = 12;
const stepMs = 30000;

function createCells(columns: number, rows: number) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => (Math.random() > 0.72 ? 1 : 0)),
  );
}

function countNeighbors(cells: number[][], x: number, y: number) {
  let count = 0;
  const rows = cells.length;
  const columns = cells[0]?.length ?? 0;

  for (let yOffset = -1; yOffset <= 1; yOffset += 1) {
    for (let xOffset = -1; xOffset <= 1; xOffset += 1) {
      if (xOffset === 0 && yOffset === 0) {
        continue;
      }

      const wrappedX = (x + xOffset + columns) % columns;
      const wrappedY = (y + yOffset + rows) % rows;
      count += cells[wrappedY][wrappedX];
    }
  }

  return count;
}

function nextGeneration(cells: number[][]) {
  return cells.map((row, y) =>
    row.map((cell, x) => {
      const neighbors = countNeighbors(cells, x, y);

      if (cell === 1) {
        return neighbors === 2 || neighbors === 3 ? 1 : 0;
      }

      return neighbors === 3 ? 1 : 0;
    }),
  );
}

function draw(
  context: CanvasRenderingContext2D,
  cells: number[][],
  width: number,
  height: number,
) {
  const rows = cells.length;
  const columns = cells[0]?.length ?? 0;
  const renderedCellWidth = width / columns;
  const renderedCellHeight = height / rows;

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, width, height);

  cells.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 0) {
        return;
      }

      context.fillStyle = aliveColors[(x + y) % aliveColors.length];
      context.fillRect(
        x * renderedCellWidth,
        y * renderedCellHeight,
        renderedCellWidth,
        renderedCellHeight,
      );
    });
  });

  context.strokeStyle = gridColor;
  context.lineWidth = 1;
  context.beginPath();

  for (let x = 0; x <= columns; x += 1) {
    const xPosition = x * renderedCellWidth;
    context.moveTo(xPosition, 0);
    context.lineTo(xPosition, height);
  }

  for (let y = 0; y <= rows; y += 1) {
    const yPosition = y * renderedCellHeight;
    context.moveTo(0, yPosition);
    context.lineTo(width, yPosition);
  }

  context.stroke();
}

export function ConwayLife() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    let animationFrame = 0;
    let previousTime = 0;
    let cells: number[][] = [];
    let columns = 0;
    let rows = 0;

    const reseed = () => {
      cells = createCells(columns, rows);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      columns = Math.max(8, Math.floor(width / cellSize));
      rows = Math.max(6, Math.floor(height / cellSize));

      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      reseed();
      draw(context, cells, width, height);
    };

    const tick = (time: number) => {
      if (time - previousTime >= stepMs) {
        previousTime = time;
        cells = nextGeneration(cells);
        draw(context, cells, canvas.clientWidth, canvas.clientHeight);
      }

      animationFrame = window.requestAnimationFrame(tick);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-label="Animated Conway's Game of Life"
      className="size-full"
    />
  );
}
