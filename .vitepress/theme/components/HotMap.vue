<template>
  <div>
    <div id="cal-heatmap"></div>
  </div>
</template>

<script lang="ts" setup>
import CalHeatmap from 'cal-heatmap'
import Tooltip from 'cal-heatmap/plugins/Tooltip'
import CalendarLabel from 'cal-heatmap/plugins/CalendarLabel'
import 'cal-heatmap/cal-heatmap.css'
import dayjs from 'dayjs'
import { useData } from "vitepress"
import { watch, computed, ref } from "vue"
import { CalConfig, PaintConfig, ToolTipConfig, CalendarLabelConfig, DataConfig } from './const'

const { isDark, theme } = useData();

const calSourceData = ref([])
const postData = computed(() => theme.value.posts)
watch(postData, () => {
  if (postData.value.length !== 0) {
    const countMap = postData.value.reduce((countMap: Record<string, number>, item) => {
      if(!countMap[item.frontMatter.date]) {
        countMap[item.frontMatter.date] = 0
      }
      countMap[item.frontMatter.date] += 1
      return countMap
    }, {} as Record<string, number>)
    calSourceData.value = Object.keys(countMap).map((key) => {
      return {
        date: key,
        value: countMap[key],
      }
    })
  }
}, { immediate: true, })

const yyDaysTemplate: CalHeatmap.Template = DateHelper => {
  const ALLOWED_DOMAIN_TYPE: CalHeatmap.DomainType[] = ['month'];
  return {
    name: 'yyDay',
    allowedDomainType: ALLOWED_DOMAIN_TYPE,
    rowsCount: () => CalConfig.ROW_COUNT,
    columnsCount: (ts) => {
      // 当前月要额外处理，减少多于空间
      if (DateHelper.date(ts).startOf('month').valueOf() !== DateHelper.date().startOf('month').valueOf()) {
        return DateHelper.getWeeksCountInMonth(ts)
      } else {
        const firstBlockDate = DateHelper.getFirstWeekOfMonth(ts);
        // 计算从今天到第一个块的时间间隔
        const interval = DateHelper.intervals('day', firstBlockDate, DateHelper.date()).length;
        // 计算需要规划几列
        const intervalCol = Math.ceil((interval + 1) / 7);
        return intervalCol;
      }
    },
    mapping: (startTimestamp, endTimestamp) => {
      const clampStart = DateHelper.getFirstWeekOfMonth(startTimestamp);
      const clampEnd = dayjs().startOf('day').add(8 - dayjs().day(), 'day')

      // x星期几 y第几周
      let x = -1;
      const pivotDay = clampStart.weekday();

      return DateHelper.intervals('day', clampStart, clampEnd).map((ts) => {
        const weekday = DateHelper.date(ts).weekday();
        if (weekday === pivotDay) {
          x += 1;
        }

        return {
          t: ts,
          x,
          y: weekday,
        };
      });
    },
    extractUnit: (ts) => {
      return DateHelper.date(ts).startOf('day').valueOf();
    },
  };
};

function paint(cal: CalHeatmap, sourceData: any, theme: 'light' | 'dark') {
  cal.addTemplates(yyDaysTemplate);
  cal.paint(
    {
      theme,
      data: {
        source: sourceData,
        ...DataConfig,
      },
      date: {
        start: dayjs().subtract(CalConfig.RANGE - 1, 'month').valueOf(),
        locale: 'zh',
        timezone: 'Asia/Shanghai',
      },
      ...PaintConfig,
    },
    [
      [Tooltip, ToolTipConfig,],
      [CalendarLabel, CalendarLabelConfig],
    ]
  );
}

function destory(cal: CalHeatmap) {
  cal.destroy()
}

let cal: CalHeatmap;
watch(
  [isDark, calSourceData],
  () => {
    if(document) {
      if (isDark.value) {
        if (cal !== undefined) destory(cal);
        cal = new CalHeatmap();
        paint(cal, calSourceData.value, 'dark');
      } else {
        if (cal !== undefined) destory(cal);
        cal = new CalHeatmap();
        paint(cal, calSourceData.value, 'light');
      }
    }
  },
  {
    immediate: true,
  }
);

</script>

<style>
.ch-subdomain-bg:hover {
  stroke-width: 0;
}

/* 使用父级g元素的:has选择器来匹配包含红色文本的组 */
g:has(.ch-subdomain-text[style*="fill: #ff6b6b"]) .ch-subdomain-bg {
  opacity: 0.5;
  cursor: not-allowed;
  fill: #eee;
  pointer-events: none;
}
</style>
