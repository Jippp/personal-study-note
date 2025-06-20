import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';

export default defineConfig({
  plugins: [pluginVue()],
  output: {
    injectStyles: true
  },
  tools: {
    rspack: {
      output: {
        filename: 'index.js',
        library: {
          name: 'vueApp',
          type: 'umd'
        },
      },
      optimization: {
        splitChunks: false,
      },
    }
  }
});
