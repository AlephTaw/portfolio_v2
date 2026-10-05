"use client";

import { useMemo } from "react";

// Each square reveals a crop of one shared cover-positioned image, not a
// repeated thumbnail. Eight rows begin at the top of the visible planet.
export function EarthTileReveal({ width, height, imageSrc, seed: shuffleSeed }: {
  width: number; height: number; imageSrc: string; seed: number;
}) {
  const scale = Math.max(width / 1448, height / 1086);
  const imageWidth = 1448 * scale;
  const imageHeight = 1086 * scale;
  const offsetX = (width - imageWidth) / 2;
  const offsetY = (height - imageHeight) / 2;
  const gridTop = Math.max(0, offsetY + imageHeight * 0.09);
  const tileSize = (height - gridTop) / 8;
  const columns = Math.ceil(width / tileSize);
  const count = columns * 8;
  const order = useMemo(() => {
    const indices = Array.from({ length: count }, (_, index) => index);
    // Seeded shuffle keeps tile timing stable through React renders/resizing.
    let seed = shuffleSeed;
    for (let index = count - 1; index > 0; index--) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const other = seed % (index + 1);
      [indices[index], indices[other]] = [indices[other], indices[index]];
    }
    const ranks = new Array<number>(count);
    indices.forEach((index, rank) => { ranks[index] = rank; });
    return ranks;
  }, [count, shuffleSeed]);

  return <div className="absolute inset-0" data-earth-transition={imageSrc}>
    {order.map((rank, index) => {
      const x = (index % columns) * tileSize;
      const y = gridTop + Math.floor(index / columns) * tileSize;
      return <div key={index} className="earth-reveal-tile absolute" style={{
        left: x, top: y, width: tileSize + 0.5, height: tileSize + 0.5,
        backgroundImage: `url('${imageSrc}')`,
        backgroundSize: `${imageWidth}px ${imageHeight}px`,
        backgroundPosition: `${offsetX - x}px ${offsetY - y}px`,
        animationDelay: `${rank / Math.max(1, count - 1) * 1600}ms`,
      }} />;
    })}
  </div>;
}
