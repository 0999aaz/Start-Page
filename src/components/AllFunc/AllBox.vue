<template>
  <n-tabs class="all-box" size="large" justify-content="space-evenly" animated>
    <n-tab-pane class="no-padding height--full" name="link" tab="捷径">
      <ShortCut />
    </n-tab-pane>
    
    <n-tab-pane class="no-padding height--full" name="recommend" tab="每日好剧推荐">
      <DailyRecommend />
    </n-tab-pane>
  </n-tabs>
</template>

<script setup>
import { NTabs, NTabPane } from "naive-ui";
import ShortCut from "@/components/AllFunc/Box/ShortCut.vue";
// 引入刚刚新建的每日推荐组件
import DailyRecommend from "@/components/AllFunc/Box/DailyRecommend.vue";
</script>

<style>
.height--full {
  height: 100%;
}
</style>
