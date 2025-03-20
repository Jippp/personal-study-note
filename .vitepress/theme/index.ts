import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import NewLayout from './components/NewLayout.vue'
import Archives from './components/Archives.vue'
import Category from './components/Category.vue'
import Tags from './components/Tags.vue'
import Page from './components/Page.vue'
import HotMap from './components/HotMap.vue'
// import Comment from './components/Comment.vue'

import './custom.css'

dayjs.extend(relativeTime)

export default {
  ...DefaultTheme,
  Layout: NewLayout,
  enhanceApp({ app }) {
    // register global compoment
    app.component('Tags', Tags)
    app.component('Category', Category)
    app.component('Archives', Archives)
    app.component('Page', Page)
    app.component('HotMap', HotMap)
    // app.component('Comment', Comment)
  }
} satisfies Theme
