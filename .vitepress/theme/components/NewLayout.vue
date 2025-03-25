<script setup>
  import { computed, ref, onMounted, watchEffect } from 'vue'
  import { withBase, useData } from "vitepress";
  import DefaultTheme from 'vitepress/theme'
  import dayjs from 'dayjs';
  import Copyright from './Copyright.vue'

  const { theme, page, lang } = useData()
  const { Layout } = DefaultTheme;

  const date = computed(
    () => new Date(page.value.lastUpdated ?? '')
  );
  const datetime = ref('');
  const disDateTime = ref('')
  const lastUpdatedFromNow = ref(theme.value.lastUpdatedFromNow)

  onMounted(() => {
    watchEffect(() => {
      if(lastUpdatedFromNow.value) {
        datetime.value = new Intl.DateTimeFormat(
          theme.value.lastUpdated?.formatOptions?.forceLocale ? lang.value : undefined,
          theme.value.lastUpdated?.formatOptions ?? {
            dateStyle: 'short',
            timeStyle: 'short'
          }
        ).format(date.value)
        disDateTime.value = dayjs(date.value).fromNow()
      }
    });
  });

</script>

<template>
  <Layout>
    <template #doc-before>
      <div class="custom-block caution" v-if="lastUpdatedFromNow && !$frontmatter.page">
        <p class="custom-block-title">⚠️ Important Notice</p>
        <p>This post was last updated on: <strong>{{ datetime }}</strong> which was <strong>{{ disDateTime }}</strong>. Please pay attention to its timelines.</p>
      </div>

      <div style="padding-top:20px;" class='post-info' v-if="!$frontmatter.page">
        {{ $frontmatter.date?.substring(0, 10) }} &nbsp;&nbsp; 
        <span v-for="item in $frontmatter.tags">
          <a :href="withBase(`/pages/tags.html?tag=${item}`)"> {{ item }}</a>
        </span>
      </div>
    </template>
  </Layout>
  <Copyright />
</template>
