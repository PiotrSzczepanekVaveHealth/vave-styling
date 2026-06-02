import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/unistyles.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: ['react', 'react-native', 'react-native-svg', 'react-native-unistyles', 'react-native-nitro-modules'],
});
