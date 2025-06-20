import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  output: {
    injectStyles: true
  },
  tools: {
    rspack: {
      output: {
        filename: 'index.js',
        library: {
          // name: 'reactApp',
          type: 'commonjs'
        },
        clean: true,
      },
      optimization: {
        splitChunks: false,
      },
    }
  }
});
