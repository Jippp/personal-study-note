<template>
  <div>
    <div id="cal-heatmap"></div>
  </div>
</template>

<script lang="ts" setup>
import { useData } from 'vitepress'
import { computed } from 'vue'
import CalHeatmap from 'cal-heatmap';
import Tooltip from 'cal-heatmap/plugins/Tooltip';
// css?
import 'cal-heatmap/cal-heatmap.css';

import { DateItem, PaintConfig, ToolTipConfig } from './const'

const { theme } = useData()
const data: DateItem[] = computed(() => {
  const dateFreqMap = theme.value.posts 
  ? theme.value.posts.reduce((countMapList: Record<string, number>[], item) => {
    if(!dateFreqMap[item.frontMatter.date]){
      dateFreqMap[item.frontMatter.date] = 0
    }
    dateFreqMap[item.frontMatter.date]++
    return countMapList
  }, {} as Record<string, number>) : {}

  return Object.entries(([date, value]) => ({
    date,
    value
  } as DateItem))/* .sort((a, b) => +new Date(b['date']) - +new Date(a['date'])) */

})

const cal = new CalHeatmap();

cal.paint({
  ...PaintConfig,
  data: {
    source: data,
    x: (datum: DateItem) => {
      return +new Date(datum['date']);
    },
    y: 'value'
  },
}, [[Tooltip, ToolTipConfig]]);


</script>

<style scoped>

</style>
