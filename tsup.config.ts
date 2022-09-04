import { defineConfig } from 'tsup'

export default defineConfig({
  // outExtension({ format }) {
  //   return {
  //     js: `.mjs`
  //   }
  // },
  clean: true,
  bundle: false,
  dts: false,
  entry: ['src/**/*.ts', '!src/**/*.d.ts', 'src/**/**/*.ts'],
  format: ['cjs'],
  minify: false,
  tsconfig: 'tsconfig.json',
  target: 'es2020',
  splitting: false,
  skipNodeModulesBundle: false,
  sourcemap: true,
  shims: false,
  keepNames: true
})
