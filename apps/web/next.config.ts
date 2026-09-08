import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // When running inside a nested git repo (monorepo), Turbopack may
  // resolve the workspace root incorrectly. Point it to the repo root
  // so pnpm workspace and packages are discovered.
  turbopack: {
    root: path.resolve(__dirname, '..', '..'),
  },
};

export default nextConfig;
