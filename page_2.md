---
page: true
title: page_2
aside: false
---
<script setup>
  import Page from "./.vitepress/theme/components/Page.vue";
  import { useData } from "vitepress";
  const { theme } = useData();
  const posts = theme.value.posts.slice(20,40)
</script>
<Page :posts="posts" :pageCurrent="2" :pagesNum="5" />