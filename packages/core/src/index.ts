export type Transform = "auto" | "piecewiseaffine" | "affine" | "projective";

export interface AffineConfig {
  image: ImageData;
  sourcePoints: AffinePoints;
  destinationPoints: AffinePoints;
  transform: "affine";
}

export interface ProjectiveConfig {
  image: ImageData;
  sourcePoints: ProjectivePoints;
  destinationPoints: ProjectivePoints;
  transform: "projective";
}

export interface PiecewiseAffineConfig {
  image: ImageData;
  sourcePoints: PiecewiseAffinePoints;
  destinationPoints: PiecewiseAffinePoints;
  transform: "piecewiseaffine";
}

export type AffinePoints = [x1: number, y1: number, x2: number, y2: number, x3: number, y3: number];
export type ProjectivePoints = [
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number,
];
export type Point = [x: number, y: number];
export type PiecewiseAffinePoints = Point[];

export function affineWarp(config: AffineConfig): ImageData {
  const { image, sourcePoints, destinationPoints } = config;
  const affineMatrix = affineMatrixFromTriangles(sourcePoints, destinationPoints);
  return applyAffineTransformToImage(image, affineMatrix);
}

function applyAffineTransformToImage(image: ImageData, matrix: ArrayLike<number>): ImageData {
  const result = image.colorSpace
    ? new ImageData(image.width, image.height, {
        colorSpace: image.colorSpace,
      })
    : new ImageData(image.width, image.height);

  for (let i = 0; i < image.width; i++) {
    for (let j = 0; j < image.height; j++) {
      const [x, y] = applyAffineTransformToPoint(matrix, i, j);
      const x_ = Math.floor(x);
      const y_ = Math.floor(y);
      if (x_ >= image.width || x_ < 0 || y_ >= image.height || y_ < 0) {
        continue;
      }
      result.data[4 * (y_ * image.width + x_)] = image.data[4 * (j * image.width + i)]!;
      result.data[4 * (y_ * image.width + x_) + 1] = image.data[4 * (j * image.width + i) + 1]!;
      result.data[4 * (y_ * image.width + x_) + 2] = image.data[4 * (j * image.width + i) + 2]!;
      result.data[4 * (y_ * image.width + x_) + 3] = image.data[4 * (j * image.width + i) + 3]!;
    }
  }

  return result;
}

function applyAffineTransformToPoint(
  matrix: ArrayLike<number>,
  x: number,
  y: number,
): [x: number, y: number] {
  if (matrix.length < 6) {
    throw new Error("Matrix must have 6 elements");
  }
  const x_ = matrix[0]! * x + matrix[1]! * y + matrix[2]!;
  const y_ = matrix[3]! * x + matrix[4]! * y + matrix[5]!;
  return [x_, y_];
}

/**
 * Find the affine matrix that maps the source points to the destination points.
 *
 * trans     .  src      = dst
 *
 * t1 t2 t3    x1 x2 x3    x'1 x'2 x'3
 * t4 t5 t6  . y1 y2 y3  = y'1 y'2 z2
 * 0  0  1     1  1  1     1   1   1
 *
 * => trans = dst . src^-1
 */
function affineMatrixFromTriangles(src: AffinePoints, dst: AffinePoints): ArrayLike<number> {
  // This represents a row-major 3x3 matrix
  const srcMatrix = new Float32Array(6);
  srcMatrix[0] = src[0]; // x1
  srcMatrix[1] = src[2]; // x2
  srcMatrix[2] = src[4]; // x3
  srcMatrix[3] = src[1]; // y1
  srcMatrix[4] = src[3]; // y2
  srcMatrix[5] = src[5]; // y3

  /*
    The determinant of a 3x3 matrix is calculated as follows:

        | a b c |
        | d e f |     => det = a(ei − fh) − b(di − fg) + c(dh − eg)
        | g h i |
     */
  const determinant =
    srcMatrix[0] * (srcMatrix[4] - srcMatrix[5]) -
    srcMatrix[1] * (srcMatrix[3] - srcMatrix[5]) +
    srcMatrix[2] * (srcMatrix[3] - srcMatrix[4]);

  /*
    The inverse of a 3x3 matrix is calculated as follows:

        | a b c |^-1            | ei − fh  ch - bi  bf − ce |
        | d e f |   = 1/|det| * | fg − di  ai − cg  cd − af |
        | g h i |               | dh − eg  bg − ah  ae − bd |

    Therefore:

        | a b c |^-1            | e-f  c-b  bf-ce |
        | d e f |   = 1/|det| * | f-d  a-c  cd-af |
        | 1 1 1 |               | d-e  b-a  ae-bd |

    Indices: 

        | 0 1 2 |     | 4-5 2-1 1*5-2*4 |
        | 3 4 5 |  => | 5-3 0-2 2*3-0*5 |
        |       |     | 3-4 0-2 0*4-1*3 |
     */

  const invSrcMatrix = new Float32Array(9);
  invSrcMatrix[0] = (srcMatrix[4] - srcMatrix[5]) / determinant;
  invSrcMatrix[1] = (srcMatrix[2] - srcMatrix[1]) / determinant;
  invSrcMatrix[2] = (srcMatrix[1] * srcMatrix[5] - srcMatrix[2] * srcMatrix[4]) / determinant;
  invSrcMatrix[3] = (srcMatrix[5] - srcMatrix[3]) / determinant;
  invSrcMatrix[4] = (srcMatrix[0] - srcMatrix[2]) / determinant;
  invSrcMatrix[5] = (srcMatrix[2] * srcMatrix[3] - srcMatrix[0] * srcMatrix[5]) / determinant;
  invSrcMatrix[6] = (srcMatrix[3] - srcMatrix[4]) / determinant;
  invSrcMatrix[7] = (srcMatrix[0] - srcMatrix[2]) / determinant;
  invSrcMatrix[8] = (srcMatrix[0] * srcMatrix[4] - srcMatrix[1] * srcMatrix[3]) / determinant;

  const dstMatrix = new Float32Array(6);
  dstMatrix[0] = dst[0]; // x'1
  dstMatrix[1] = dst[2]; // x'2
  dstMatrix[2] = dst[4]; // x'3
  dstMatrix[3] = dst[1]; // y'1
  dstMatrix[4] = dst[3]; // y'2
  dstMatrix[5] = dst[5]; // y'3

  /*
    dst             .  src^-1       = trans

    | x'1 x'2 x'3 |   | i0 i1 i2 |    | x1 x2 x3 |
    | y'1 y'2 y'3 | . | i3 i4 i5 |  = | y1 y2 y3 |
    | 1   1   1   |   | i6 i7 i8 |    | 0  0  1  |
     */
  const affineMatrix = new Float32Array(9);
  affineMatrix[0] =
    dstMatrix[0] * invSrcMatrix[0] +
    dstMatrix[1] * invSrcMatrix[3] +
    dstMatrix[2] * invSrcMatrix[6];
  affineMatrix[1] =
    dstMatrix[0] * invSrcMatrix[1] +
    dstMatrix[1] * invSrcMatrix[4] +
    dstMatrix[2] * invSrcMatrix[7];
  affineMatrix[2] =
    dstMatrix[0] * invSrcMatrix[2] +
    dstMatrix[1] * invSrcMatrix[5] +
    dstMatrix[2] * invSrcMatrix[8];
  affineMatrix[3] =
    dstMatrix[3] * invSrcMatrix[0] +
    dstMatrix[4] * invSrcMatrix[3] +
    dstMatrix[5] * invSrcMatrix[6];
  affineMatrix[4] =
    dstMatrix[3] * invSrcMatrix[1] +
    dstMatrix[4] * invSrcMatrix[4] +
    dstMatrix[5] * invSrcMatrix[7];
  affineMatrix[5] =
    dstMatrix[3] * invSrcMatrix[2] +
    dstMatrix[4] * invSrcMatrix[5] +
    dstMatrix[5] * invSrcMatrix[8];
  affineMatrix[6] = 0;
  affineMatrix[7] = 0;
  affineMatrix[8] = 1;

  return affineMatrix;
}

export function loadSvgAsImageData(svgUrl: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get 2D context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      resolve(imageData);
    };
    img.onerror = () => reject(new Error("Failed to load SVG"));
    img.src = svgUrl;
  });
}
