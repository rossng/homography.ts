import { describe, expect, test } from "vitest";
import { AffinePoints, affineMatrixFromTriangles } from "./index.js";

describe("index", () => {
  test.each([
    [
      [0, 0, 0, 1, 1, 0] as AffinePoints,
      [1, 0, 1, 1, 2, 0] as AffinePoints,
      [1, 0, 1, 0, 1, 0, 0, 0, 1],
    ],
    [
      [0, 0, 0, 1, 1, 0] as AffinePoints,
      [0, 0, 1, 0, 0, -1] as AffinePoints,
      [0, 1, 0, -1, 0, 0, 0, 0, 1],
    ],
  ])(
    "affine matrix(%o, %o) -> %o",
    (points1: AffinePoints, points2: AffinePoints, expected: number[]) => {
      const matrix = Array.from(affineMatrixFromTriangles(points1, points2));
      expect(matrix).toStrictEqual(expected);
    },
  );
});
