import { describe, expect, test } from "vitest";
import { Matrix3x3 } from "./matrix.js";

describe("matrix", () => {
  test.each([[[1, 2, 1, 3, 4, 1, -1, 2, -1], 8]])(
    "determinant(%o) -> %d",
    (matrix, determinant) => {
      expect(Matrix3x3.determinant(matrix)).toBe(determinant);
    },
  ),
    test.each([
      [
        [1, 2, 1, 3, 4, 1, -1, 2, -1],
        [-3 / 4, 1 / 2, -1 / 4, 1 / 4, 0, 1 / 4, 5 / 4, -1 / 2, -1 / 4],
      ],
      [
        [1, 0, 0, 0, 1, 0, 1, 1, 1],
        [1, 0, 0, 0, 1, 0, -1, -1, 1],
      ],
      [
        [1, 0, 0, 0, 1, 0],
        [1, 0, 0, 0, 1, 0, -1, -1, 1],
      ],
    ])("inverse(%o) -> %o", (matrix, expected) => {
      const inverse = makeZeroesPositive(Array.from(Matrix3x3.inverse(matrix)));
      const doubleInverse = makeZeroesPositive(Array.from(Matrix3x3.inverse(inverse)));
      const originalMatrix = matrix.length === 9 ? matrix : [...matrix, 1, 1, 1];
      expect(inverse).toStrictEqual(expected);
      expect(doubleInverse).toStrictEqual(originalMatrix);
    });
});

function makeZeroesPositive(matrix: number[]) {
  return matrix.map((value) => (value === 0 ? 0 : value));
}
