<script lang="ts" setup>
  import { useData, withBase } from 'vitepress'
  import { computed } from 'vue'
  import { useYearSort } from '../functions'

  const { isDraft } = defineProps({
    isDraft: Boolean
  })

  const { theme } = useData()

  const data = computed(() => useYearSort(theme.value[isDraft ? 'draftPosts' : 'posts']))
</script>

<template>
  <div v-for="yearList in data">
    <div class="year">
      {{ yearList[0].frontMatter.date.split('-')[0] }}
    </div>
    <a :href="withBase(article.regularPath)" v-for="(article, index) in yearList" :key="index" class="posts">
      <div class="post-container">
        <div class="post-dot"></div>
        {{ article.frontMatter.title }}
      </div>
      <div class="date">{{ article.frontMatter.date.slice(5) }}</div>
    </a>
  </div>
</template>

<style scoped>
.year {
  padding: 14px 0 8px 0;
  font-size: 1.25rem;
  font-weight: 500;
  font-family: var(--date-font-family), serif;
}
</style>
