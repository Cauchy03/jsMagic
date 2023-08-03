<template>
  <div class="scroll-container" :style="{ overflow: 'auto', height: `${viewPortHeight}px` /*列表视口高度（值自定义即可）*/ }"
    ref="scrollContainer" @scroll="requestAnimation">
    <div class="content-container" :style="{ height: `${itemHeight * dataSource.length}px`, position: 'relative' }">
      <div class="content-item" v-for="(data, index) in renderDataList" :key="index"
        :style="{ position: 'absolute', left: 0, top: 0, transform: `translateY(${(startIndex + index) * itemHeight}px)`, width: `100%` }">
        {{ data.text }} -- {{ data.id }} -- {{ index }}
      </div>
    </div>
  </div>

  {{ startIndex }}
</template>

<script setup lang="ts">

import { dataSource } from '@/shared/dataConstant';
import { ref, watch } from 'vue';
const viewPortHeight = 500; // 滚动列表的可视高度
const itemHeight = 50; // 一个列表项的高度
const startIndex = ref(0);
const endIndex = ref(0);
const scrollContainer = ref<HTMLElement | null>(null);

// requestAnimationFrame节流（意义不大）
const current = ref(0)
function requestAnimation() {
  const now = Date.now()
  if (now - current.value > 30) {
    current.value = now
    window.requestAnimationFrame(handleScroll)
  }
}
// 滚动事件
const handleScroll = () => {
  if (!scrollContainer.value) return
  const scrollTop = scrollContainer.value.scrollTop;
  startIndex.value = Math.floor(scrollTop / itemHeight);
  endIndex.value = Math.ceil((scrollTop + viewPortHeight) / itemHeight) - 1;
  // console.log(startIndex.value, endIndex.value);
}

// 截取数据
const renderDataList = ref(dataSource.slice(startIndex.value, endIndex.value + 1))
// 监听区间变化
watch([startIndex, endIndex], () => {
  renderDataList.value = dataSource.slice(startIndex.value, endIndex.value + 1)
  // console.log(renderDataList.value)
})
</script>

<style scoped lang="less">
.scroll-container {
  border: 2px solid red;
  width: 300px;

  .content-container {
    .content-item {
      height: 50px;
      background-image: linear-gradient(0deg, pink, blue);
    }
  }
}
</style>