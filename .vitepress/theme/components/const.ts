/* https://cal-heatmap.com/docs/options */
export const PaintConfig = {
  range: 1,
  domain: { type: 'year' },
  subDomain: { type: 'day', radius: 2, width: 11, height: 11, gutter: 4 },
  date: {
    start: new Date(`${new Date().getFullYear()}-01-01`),
    end: new Date(),
  },
  scale: {
    color: {
      type: 'threshold',
      range: ['#4dd05a', '#37a446', '#166b34', '#14432a',],
      domain: [3, 6, 9],
    },
  },
}

export interface DateItem {
  date: string; 
  value: number
}

export const ToolTipConfig = {
  placement: 'bottom',
  text: (time: number, value: number, dayjsDate: any) => `${
    value ? `You've written ${value} page${value > 1 ? 's' : ''}.` : 'No New Pages!'
  }-${dayjsDate.format('YYYY-MM-DD')}`
}

// export const CalendarLabelConfig = {
//   width: 30,
//   position: 'top',
//   key: 'top',
//   text: () => ['111', '222', '333']
// }