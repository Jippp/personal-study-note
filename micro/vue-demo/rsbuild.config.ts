import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';

export default defineConfig({
  plugins: [pluginVue()],
  tools: {
    rspack: {
      output: {
        library: {
          name: 'vue-demo-[name]',
          type: 'umd'
        },
        chunkLoadingGlobal: 'webpackJsonp-vue-demo'
      }
    }
  }
});
