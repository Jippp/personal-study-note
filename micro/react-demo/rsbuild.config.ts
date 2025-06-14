import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  tools: {
    rspack: {
      output: {
        library: {
          name: 'react-demo-[name]',
          type: 'umd'
        },
        chunkLoadingGlobal: 'webpackJsonp-react-demo'
      }
    }
  }
});
