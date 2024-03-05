# Homography.js

A TypeScript library for finding and applying transformations to images.

(Heavily) inspired by https://github.com/Eric-Canas/Homography.js/

This library is an early-stage experiment and should not be used by anyone for anything.

## Usage

- Install Node and (preferably) enable Corepack with `corepack enable`.
- To build the library:
  - In watch mode: `cd packages/core && pnpm dev`
  - Once: `cd packages/core && pnpm build`
- To run the example: `cd examples && pnpm dev`
  - If you are building the library in watch mode, the example application will automatically detect changes to it and reload.
- To run tests: `cd packages/core && pnpm test`
