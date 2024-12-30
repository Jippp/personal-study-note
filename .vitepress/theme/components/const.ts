import dayjs from 'dayjs'

export const CalConfig = {
  ROW_COUNT: 7,
  RANGE: 12
}

/* https://cal-heatmap.com/docs/options */
export const PaintConfig = {
  range: CalConfig.RANGE,
  scale: {
    color: {
      type: 'threshold',
      range: ['#daf6ea', '#c7f0df', '#82edc0', '#0bd07d', '#00663b'],
      domain: [2, 4, 6, 8],
    },
  },
  domain: {
    type: 'month',
    gutter: 4,
    label: { text: 'YYYY.M月', textAlign: 'middle', position: 'bottom' },
  },
  subDomain: { type: 'yyDay', radius: 2, width: 11, height: 11, gutter: 4 },
  itemSelector: '#cal-heatmap',
}

export interface DateItem {
  date: string; 
  value: number
}

export const ToolTipConfig = {
  placement: 'bottom',
  text: (time: number, value: number, dayjsDate: dayjs.Dayjs) => `${
    value ? `You've written ${value} page${value > 1 ? 's' : ''}.` : 'No New Pages!'
  }-${dayjsDate.format('YYYY-MM-DD')}`
}

export const DataConfig = {
  x: (datum: DateItem) => {
    return +new Date(datum['date']);
  },
  y: 'value'
}

export const CalendarLabelConfig = {
  width: 25,
  textAlign: 'start',
  text: function () {
    return ['一', '', '三', '', '五', '', '日']
  },
}