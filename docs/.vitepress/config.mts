import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Personal Study Note",
  description: "Just for myself",
  lastUpdated: true,
  head: [['link', { rel: 'icon', href: '/favicon.png' }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'lowcode', link: '/lowcode' }
    ],

    sidebar: [
      {
        text: 'lowcode',
        items: [
          { text: 'Markdown Examples', link: '/lowcode' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
