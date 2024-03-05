export namespace Matrix3x3 {
  export function determinant(matrix: ArrayLike<number>): number {
    /*
          The determinant of a 3x3 matrix is calculated as follows:
      
              | a b c |
              | d e f |     => det = a(ei − fh) − b(di − fg) + c(dh − eg)
              | g h i |

              | 0 1 2 |
              | 3 4 5 |     => det = 0(4*8 - 7*5) - 1(3*8 - 6*5) + 2(3*7 - 6*4)
              | 6 7 8 | 
           */

    if (matrix.length === 6) {
      const determinant =
        matrix[0] * (matrix[4] - matrix[5]) -
        matrix[1] * (matrix[3] - matrix[5]) +
        matrix[2] * (matrix[3] - matrix[4]);
      return determinant;
    }

    if (matrix.length === 9) {
      const determinant =
        matrix[0] * (matrix[4] * matrix[8] - matrix[5] * matrix[7]) -
        matrix[1] * (matrix[3] * matrix[8] - matrix[5] * matrix[6]) +
        matrix[2] * (matrix[3] * matrix[7] - matrix[4] * matrix[6]);
      return determinant;
    }

    throw new Error(`Cannot calculate determinant. Invalid matrix size: ${matrix.length}`);
  }

  /** Calculate the inverse of a 3x3 matrix.
   * If a 6-element array is passed, the last row is assumed to be [1, 1, 1].
   */
  export function inverse(matrix: ArrayLike<number>): Float32Array {
    /*
    The inverse of a 3x3 matrix is calculated as follows:

        | a b c |^-1            | ei − fh  ch - bi  bf − ce |
        | d e f |   = 1/|det| * | fg − di  ai − cg  cd − af |
        | g h i |               | dh − eg  bg − ah  ae − bd |
     */
    const inverse = new Float32Array(9);
    const determinant = Matrix3x3.determinant(matrix);

    if (matrix.length === 6) {
      /*
        For a 6-element matrix:

            | a b c |^-1            | e-f  c-b  bf-ce |
            | d e f |   = 1/|det| * | f-d  a-c  cd-af |
            | 1 1 1 |               | d-e  b-a  ae-bd |

        Indices: 

            | 0 1 2 |     | 4-5 2-1 1*5-2*4 |
            | 3 4 5 |  => | 5-3 0-2 2*3-0*5 |
            |       |     | 3-4 1-0 0*4-1*3 |
        */
      inverse[0] = (matrix[4] - matrix[5]) / determinant;
      inverse[1] = (matrix[2] - matrix[1]) / determinant;
      inverse[2] = (matrix[1] * matrix[5] - matrix[2] * matrix[4]) / determinant;
      inverse[3] = (matrix[5] - matrix[3]) / determinant;
      inverse[4] = (matrix[0] - matrix[2]) / determinant;
      inverse[5] = (matrix[2] * matrix[3] - matrix[0] * matrix[5]) / determinant;
      inverse[6] = (matrix[3] - matrix[4]) / determinant;
      inverse[7] = (matrix[1] - matrix[0]) / determinant;
      inverse[8] = (matrix[0] * matrix[4] - matrix[1] * matrix[3]) / determinant;
      return inverse;
    }

    if (matrix.length === 9) {
      /*
        Indices: 

            | 0 1 2 |     | 4*8-5*7 2*7-1*8 1*5-2*4 |
            | 3 4 5 |  => | 5*6-3*8 0*8-2*6 2*3-0*5 |
            | 6 7 8 |     | 3*7-4*6 1*6-0*7 0*4-1*3 |
        */
      inverse[0] = (matrix[4] * matrix[8] - matrix[5] * matrix[7]) / determinant;
      inverse[1] = (matrix[2] * matrix[7] - matrix[1] * matrix[8]) / determinant;
      inverse[2] = (matrix[1] * matrix[5] - matrix[2] * matrix[4]) / determinant;
      inverse[3] = (matrix[5] * matrix[6] - matrix[3] * matrix[8]) / determinant;
      inverse[4] = (matrix[0] * matrix[8] - matrix[2] * matrix[6]) / determinant;
      inverse[5] = (matrix[2] * matrix[3] - matrix[0] * matrix[5]) / determinant;
      inverse[6] = (matrix[3] * matrix[7] - matrix[4] * matrix[6]) / determinant;
      inverse[7] = (matrix[1] * matrix[6] - matrix[0] * matrix[7]) / determinant;
      inverse[8] = (matrix[0] * matrix[4] - matrix[1] * matrix[3]) / determinant;
      return inverse;
    }

    throw new Error(`Cannot calculate inverse. Invalid matrix size: ${matrix.length}`);
  }
}
