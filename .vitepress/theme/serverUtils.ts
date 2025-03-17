import { globby } from 'globby'
import matter from 'gray-matter'
import fs from 'fs-extra'
import { resolve } from 'path'

interface PostItem {
  frontMatter: {
    /** 日期 */
    date: string;
    /** 文章标题 */
    title: string;
    /** 草稿 */
    private?: boolean;
    [k: string]: any;
  };
  regularPath: string;
}

export async function getBasePosts(pageSize: number) {
  let paths = await globby(['posts/**/index.md'])

  //生成分页页面markdown
  await generatePaginationPages(paths.length, pageSize)

  return await Promise.all(
    paths.map(async (item) => {
      const content = await fs.readFile(item, 'utf-8')
      const { data } = matter(content)
      data.date = _convertDate(data.date)
      return {
        frontMatter: data,
        regularPath: `/${item.replace('.md', '.html')}`
      } as PostItem
    })
  )
}

export function getActivePosts(posts: PostItem[]) {
  return posts.filter(_filterShowPage as any).sort(_compareDate as any)
}

export function getDraftPosts(posts: PostItem[]) {
  return posts.filter(_filterDraftPage as any)
}

const getTemplate = ({
  currentPage, pageSize, pagesNum
}: {
  currentPage: number; pageSize: number; pagesNum: number
}) => {
  return `
---
page: true
title: ${currentPage === 1 ? 'home' : 'page_' + currentPage}
aside: false
---
<script setup>
  import Page from "./.vitepress/theme/components/Page.vue";
  import { useData } from "vitepress";
  const { theme } = useData();
  const posts = theme.value.posts.slice(${pageSize * (currentPage - 1)},${pageSize * currentPage})
</script>
<Page :posts="posts" :pageCurrent="${currentPage}" :pagesNum="${pagesNum}" />
`.trim()
}

async function generatePaginationPages(total: number, pageSize: number) {
  //  pagesNum
  let pagesNum = total % pageSize === 0 ? total / pageSize : Math.floor(total / pageSize) + 1
  const paths = resolve('./')
  if (total > 0) {
    for (let i = 1; i < pagesNum + 1; i++) {
      const page = getTemplate({
        currentPage: i,
        pageSize,
        pagesNum
      })
      const file = paths + `/page_${i}.md`
      await fs.writeFile(file, page)
    }
  }
  // rename page_1 to index for homepage
  await fs.move(paths + '/page_1.md', paths + '/index.md', { overwrite: true })
}

function _convertDate(date = new Date().toString()) {
  const json_date = new Date(date).toJSON()
  return json_date.split('T')[0]
}

function _compareDate(obj1: { frontMatter: { date: number } }, obj2: { frontMatter: { date: number } }) {
  return obj1.frontMatter.date < obj2.frontMatter.date ? 1 : -1
}

function _filterShowPage(obj: { frontMatter: { private: boolean } }) {
  return !obj.frontMatter.private
}
function _filterDraftPage(obj: { frontMatter: { private: boolean } }) {
  return !!obj.frontMatter.private
}
