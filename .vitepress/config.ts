import { defineConfig } from 'vitepress'
import { visualizer } from 'rollup-plugin-visualizer'
import { compression } from 'vite-plugin-compression2'
import imagemin from 'unplugin-imagemin/vite';
import { getBasePosts, getActivePosts, getDraftPosts } from './theme/serverUtils'

//每页的文章数量
const pageSize = 20

const isProd = process.env.NODE_ENV === 'production'

export default async function() {
  const posts = await getBasePosts(pageSize)
  const showPosts = getActivePosts(posts)
  const draftPosts = getDraftPosts(posts)
  
  return defineConfig({
    title: 'Blog',
    base: '/',
    description: 'blog',
    ignoreDeadLinks: true,
    themeConfig: {
      posts: showPosts,
      draftPosts,
      website: 'https://github.com/Jippp/personal-study-note',
      nav: [
        { text: 'Home', link: '/' },
        { text: 'Category', link: '/pages/category' },
        { text: 'Archives', link: '/pages/archives' },
        { text: 'Draft', link: '/pages/draft' },
        { text: 'Tags', link: '/pages/tags' },
        { text: 'About', link: '/pages/about' }
        // { text: 'Airene', link: 'http://airene.net' }  -- External link test
      ],
      search: {
        // TODO localSearch chunk包太大
        provider: 'local',
        // FEATURE 隐藏页面需要排除掉
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
      },
      lastUpdatedFromNow: isProd,
    } as any,
    srcExclude: ['readme.md', 'Readme.md', 'README.md'],
    head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  
    lastUpdated: true,
  
    vite: {
      ssr: {
        noExternal: ['cal-heatmap']
      },
      build: { 
        // 生产环境简化产物
        minify: isProd,
        rollupOptions: {
          output: {
            manualChunks: {
              'cal-heatmap': ['cal-heatmap'],
            }
          }
        }
      },
      server: { port: 5000 },
      plugins: [
        compression(),
        imagemin(),
        !isProd ? visualizer(
          {
            // emitFile: true,
            // filename: "stats.html",
            open: true,  // 打包后自动打开页面
            gzipSize: true,  // 查看 gzip 压缩大小
            brotliSize: true // 查看 brotli 压缩大小
          }
        ) : null,
      ]
    }
  })
}
