import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'vite.config.ts',
        '**/*.test.ts', 
        '**/*.test.tsx',
        '**/__tests__/**',
        '**/__mocks__/**',
        '**/stories/**'
      ],
      rollupTypes: false,
      strictOutput: true,
      tsconfigPath: './tsconfig.app.json'
    })
  ],
  build: {
    outDir: 'dist',
    lib: {
      entry: 'src/index.ts',
      name: 'SchemaFormApp',
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
});
