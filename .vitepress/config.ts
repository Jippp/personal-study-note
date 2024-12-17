import { defineConfig } from 'vitepress'
import { getPosts } from './theme/serverUtils'

//每页的文章数量
const pageSize = 20

const isProd = process.env.NODE_ENV === 'production'

export default defineConfig({
  title: 'Blog',
  base: '/',
  description: 'blog',
  ignoreDeadLinks: true,
  themeConfig: {
    posts: await getPosts(pageSize),
    website: 'https://github.com/Jippp/personal-study-note',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Category', link: '/pages/category' },
      { text: 'Archives', link: '/pages/archives' },
      { text: 'Tags', link: '/pages/tags' },
      { text: 'About', link: '/pages/about' }
      // { text: 'Airene', link: 'http://airene.net' }  -- External link test
    ],
    search: {
      provider: 'local',
    },
    //outline:[2,3],
    outline: {
      label: '文章摘要',
      level: [2,6],
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/Jippp/personal-study-note' }],
    lastUpdated: {
      text: '上一次更新',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    }
  } as any,
  srcExclude: ['readme.md', 'Readme.md', 'README.md'],
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],

  lastUpdated: true,

  vite: {
    // 生产环境简化产物
    build: { minify: isProd },
    server: { port: 5000 }
  }
})
