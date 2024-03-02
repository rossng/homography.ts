import { AffineConfig, AffinePoints, affineWarp, loadSvgAsImageData } from "@homography.ts/core";

async function main() {
  const imageUrl = new URL("../example-image.svg", import.meta.url);
  const imageData = await loadSvgAsImageData(imageUrl.toString());
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.putImageData(imageData, 0, 0);

  const points: [number, number][] = [];

  canvas.onclick = (ev: MouseEvent) => {
    if (points.length >= 6) {
      return;
    }

    const x = ev.offsetX;
    const y = ev.offsetY;
    points.push([x, y]);

    ctx.fillStyle = points.length <= 3 ? "red" : "green";
    ctx.beginPath();
    ctx.ellipse(x, y, 5, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (points.length === 6) {
      const config: AffineConfig = {
        image: imageData,
        sourcePoints: points.slice(0, 3).flat() as AffinePoints,
        destinationPoints: points.slice(3).flat() as AffinePoints,
        transform: "affine",
      };
      const warpedImageData = affineWarp(config);
      ctx.putImageData(warpedImageData, 0, 0);
    }
  };
}

main();
